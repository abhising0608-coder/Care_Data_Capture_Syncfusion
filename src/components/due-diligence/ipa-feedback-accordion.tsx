'use client';

import React, { useState } from 'react';
import { useSWRConfig } from 'swr';
import Link from 'next/link';
import { Eye, Mail, Pencil, Check, RefreshCcw, Upload } from 'lucide-react';
import { format, parseISO } from 'date-fns';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import type { IPAFirm, IPAContact, FeedbackStatus } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';

interface IPAFeedbackAccordionProps {
    firms: IPAFirm[];
    companyId: string;
}

export function IPAFeedbackAccordion({ firms, companyId }: IPAFeedbackAccordionProps) {
    const { mutate } = useSWRConfig();
    const { toast } = useToast();

    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [activeContact, setActiveContact] = useState<IPAContact | null>(null);

    const [selectedContacts, setSelectedContacts] = useState<Record<string, {contactId: string, discussionHappened: 'Yes' | 'No' | ''}>>({});

    const handleDiscussionChange = (firmId: string, contactId: string, value: 'Yes' | 'No' | '') => {
        setSelectedContacts(prev => ({
            ...prev,
            [firmId]: { contactId: contactId, discussionHappened: value }
        }));
    };
    
    const handleCreateRecord = async (firmId: string) => {
        const selection = selectedContacts[firmId];
        if (!selection || !selection.contactId || !selection.discussionHappened) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a contact and discussion status.' });
            return;
        }

        try {
            await fetch('/api/due-diligence/ipa-feedback', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    companyId, 
                    firmId, 
                    contactId: selection.contactId, 
                    updates: { 
                        discussionHappened: selection.discussionHappened, 
                    } 
                }),
            });
            mutate(`/api/due-diligence/ipa-feedback?companyId=${companyId}`);
            toast({ title: 'Success', description: 'IPA discussion record created.' });
            setSelectedContacts(prev => ({...prev, [firmId]: {contactId: '', discussionHappened: ''}}));
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to create record.' });
        }
    }
    
    const handleResetSelection = (firmId: string) => {
         setSelectedContacts(prev => ({...prev, [firmId]: {contactId: '', discussionHappened: ''}}));
    }

    const openUploadModal = (contact: IPAContact) => {
        setActiveContact(contact);
        setUploadModalOpen(true);
    };

    const openEmailModal = (contact: IPAContact) => {
        setActiveContact(contact);
        setIsEmailModalOpen(true);
    }
    
    const statusVariant = (status: FeedbackStatus) => {
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
                                        onValueChange={(value) => handleDiscussionChange(firm.id, value, selectedContacts[firm.id]?.discussionHappened || '')}
                                        value={selectedContacts[firm.id]?.contactId || ''}
                                    >
                                        <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select Contact" /></SelectTrigger>
                                        <SelectContent>{firm.contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                     <Select
                                        value={selectedContacts[firm.id]?.discussionHappened || ''}
                                        onValueChange={(value: 'Yes' | 'No') => handleDiscussionChange(firm.id, selectedContacts[firm.id]?.contactId, value)}
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
                                                        <Button variant="ghost" size="icon" onClick={() => toast({title: "Placeholder", description: "Navigate to IPA feedback capture page."})}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => openEmailModal(contact)}><Mail className="h-4 w-4" /></Button>
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

            {/* Placeholder Modals */}
            <Dialog open={isUploadModalOpen} onOpenChange={setUploadModalOpen}>
                 <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload Document for {activeContact?.name}</DialogTitle>
                        <DialogDescription>
                            Attach a document related to the IPA discussion.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">(Placeholder for file upload input)</p>
                    </div>
                     <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={() => toast({title: 'Placeholder', description: 'File upload logic to be implemented.'})}>Upload</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Email to {activeContact?.name}</DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground">(Placeholder for IPA email composition modal)</p>
                     <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={() => toast({title: 'Placeholder', description: 'Email sending logic to be implemented.'})}>Send</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
