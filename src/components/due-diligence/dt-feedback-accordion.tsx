'use client';

import React, { useState } from 'react';
import { useSWRConfig } from 'swr';
import { Eye, Mail, Pencil, Trash2, Upload, MoreVertical, Check, RefreshCcw, FileText, MessageSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { DTFirm, DTContact, DTFeedbackStatus } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '../ui/card';

interface DTFeedbackAccordionProps {
    firms: DTFirm[];
    companyId: string;
}

export function DTFeedbackAccordion({ firms, companyId }: DTFeedbackAccordionProps) {
    const { mutate } = useSWRConfig();
    const { toast } = useToast();

    const [isCaptureModalOpen, setCaptureModalOpen] = useState(false);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [activeContact, setActiveContact] = useState<DTContact | null>(null);
    const [minutesContent, setMinutesContent] = useState('');
    const [selectedContacts, setSelectedContacts] = useState<Record<string, {contactId: string, discussionHappened: 'Yes' | 'No' | ''}>>({});

    const handleDiscussionChange = (firmId: string, contact: DTContact, value: 'Yes' | 'No' | '') => {
        setSelectedContacts(prev => ({
            ...prev,
            [firmId]: { contactId: contact.id, discussionHappened: value }
        }));
    };
    
    const handleCreateRecord = async (firmId: string) => {
        const selection = selectedContacts[firmId];
        if (!selection || !selection.contactId || !selection.discussionHappened) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a contact and discussion status.' });
            return;
        }

        try {
            await fetch('/api/due-diligence/dt-feedback', {
                method: 'POST',
                body: JSON.stringify({ 
                    companyId, 
                    firmId, 
                    contactId: selection.contactId, 
                    updates: { discussionHappened: selection.discussionHappened, status: 'Pending' } 
                }),
            });
            mutate(`/api/due-diligence/dt-feedback?companyId=${companyId}`);
            toast({ title: 'Success', description: 'DT discussion record created.' });
            // Reset selection for this firm
            setSelectedContacts(prev => ({...prev, [firmId]: {contactId: '', discussionHappened: ''}}));
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to create record.' });
        }
    }
    
    const handleResetSelection = (firmId: string) => {
         setSelectedContacts(prev => ({...prev, [firmId]: {contactId: '', discussionHappened: ''}}));
    }

    const openCaptureModal = (contact: DTContact) => {
        setActiveContact(contact);
        setMinutesContent(contact.minutesContent || 'Placeholder for existing minutes...'); // Load existing minutes here
        setCaptureModalOpen(true);
    };

    const openViewModal = (contact: DTContact) => {
        setActiveContact(contact);
        setMinutesContent(contact.minutesContent || 'No minutes captured.'); // Load saved minutes
        setViewModalOpen(true);
    };

    const openUploadModal = (contact: DTContact) => {
        setActiveContact(contact);
        setUploadModalOpen(true);
    };

    const handleSaveMinutes = async (isFinal: boolean) => {
        if (!activeContact) return;

        const newStatus = isFinal ? 'Yes' : 'Partial';

        try {
            await fetch('/api/due-diligence/dt-feedback', {
                method: 'POST',
                body: JSON.stringify({ 
                    companyId, 
                    firmId: firms.find(f => f.contacts.some(c => c.id === activeContact.id))!.id, 
                    contactId: activeContact.id, 
                    updates: { 
                        minutesCaptured: newStatus,
                        minutesContent,
                    } 
                }),
            });
            mutate(`/api/due-diligence/dt-feedback?companyId=${companyId}`);
            toast({ title: 'Success', description: `Minutes saved ${isFinal ? 'as final' : 'as draft'}.` });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save minutes.' });
        }
        setCaptureModalOpen(false);
    }
    
    const statusVariant = (status: DTFeedbackStatus) => {
        switch (status) {
            case 'Completed': return 'default';
            case 'In Progress': return 'secondary';
            case 'Pending':
            default: return 'outline';
        }
    };
    
    const minutesVariant = (status: 'Yes' | 'No' | 'Partial') => {
        switch (status) {
            case 'Yes': return 'default';
            case 'Partial': return 'secondary';
            case 'No':
            default: return 'outline';
        }
    };


    return (
        <>
            <Accordion type="multiple" defaultValue={firms.map(f => f.id)}>
                {firms.map((firm) => (
                    <AccordionItem value={firm.id} key={firm.id}>
                        <AccordionTrigger className="text-lg font-semibold">{firm.firmName}</AccordionTrigger>
                        <AccordionContent>
                            <div className="p-4 border rounded-lg bg-background space-y-4">
                               <div className="flex items-center gap-4 p-4 border-b">
                                    <Select 
                                        onValueChange={(value) => handleDiscussionChange(firm.id, firm.contacts.find(c => c.id === value)!, selectedContacts[firm.id]?.discussionHappened || '')}
                                        value={selectedContacts[firm.id]?.contactId || ''}
                                    >
                                        <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select Contact" /></SelectTrigger>
                                        <SelectContent>{firm.contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                     <Select
                                        value={selectedContacts[firm.id]?.discussionHappened || ''}
                                        onValueChange={(value: 'Yes' | 'No') => handleDiscussionChange(firm.id, firm.contacts.find(c => c.id === selectedContacts[firm.id]?.contactId)!, value)}
                                        disabled={!selectedContacts[firm.id]?.contactId}
                                    >
                                        <SelectTrigger className="w-[200px]"><SelectValue placeholder="Discussion Happened?" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Yes">Yes</SelectItem>
                                            <SelectItem value="No">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button size="icon" onClick={() => handleCreateRecord(firm.id)}><Check className="h-4 w-4" /></Button>
                                    <Button size="icon" variant="outline" onClick={() => handleResetSelection(firm.id)}><RefreshCcw className="h-4 w-4" /></Button>
                               </div>

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Contact Person</TableHead>
                                            <TableHead>Discussion Happened?</TableHead>
                                            <TableHead>Minutes Captured</TableHead>
                                            <TableHead>Minutes Captured On</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Contact No.</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {firm.contacts.filter(c => c.status).map((contact) => (
                                            <TableRow key={contact.id}>
                                                <TableCell>{contact.name}</TableCell>
                                                <TableCell><Badge variant={contact.discussionHappened === 'Yes' ? 'default' : 'secondary'}>{contact.discussionHappened}</Badge></TableCell>
                                                <TableCell><Badge variant={minutesVariant(contact.minutesCaptured)}>{contact.minutesCaptured}</Badge></TableCell>
                                                <TableCell>{contact.minutesCapturedOn ? format(parseISO(contact.minutesCapturedOn), 'dd-MMM-yyyy') : 'N/A'}</TableCell>
                                                <TableCell>{contact.email}</TableCell>
                                                <TableCell>{contact.contact}</TableCell>
                                                <TableCell><Badge variant={statusVariant(contact.status!)}>{contact.status}</Badge></TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-1 justify-end">
                                                        <Button variant="ghost" size="icon" onClick={() => openViewModal(contact)}><Eye className="h-4 w-4" /></Button>
                                                        <Button variant="ghost" size="icon" onClick={() => openCaptureModal(contact)} disabled={contact.discussionHappened === 'No'}><Pencil className="h-4 w-4" /></Button>
                                                        <Button variant="ghost" size="icon" disabled={contact.discussionHappened === 'Yes'}><Mail className="h-4 w-4" /></Button>
                                                        <Button variant="ghost" size="icon" onClick={() => openUploadModal(contact)}><Upload className="h-4 w-4" /></Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                         {firm.contacts.filter(c => c.status).length === 0 && (
                                            <TableRow><TableCell colSpan={8} className="text-center h-24">No discussion records created for this firm yet.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            
            {/* Capture/Edit Minutes Modal */}
            <Dialog open={isCaptureModalOpen} onOpenChange={setCaptureModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Capture/Edit Minutes for {activeContact?.name}</DialogTitle>
                        <DialogDescription>
                            Enter the discussion minutes below. You can save as a draft or mark as complete.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea 
                            value={minutesContent}
                            onChange={(e) => setMinutesContent(e.target.value)}
                            className="min-h-[200px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleSaveMinutes(false)}>Save as Draft</Button>
                        <Button onClick={() => handleSaveMinutes(true)}>Mark as Complete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Minutes Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setViewModalOpen}>
                 <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>View Minutes for {activeContact?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 prose prose-sm max-w-none prose-p:text-muted-foreground">
                       <p>{minutesContent}</p>
                    </div>
                     <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Upload Document Modal */}
            <Dialog open={isUploadModalOpen} onOpenChange={setUploadModalOpen}>
                 <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload Document for {activeContact?.name}</DialogTitle>
                        <DialogDescription>
                            Attach a document related to the discussion.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">(Placeholder for file upload input)</p>
                    </div>
                     <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button>Upload</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
    