'use client';

import React, { useState } from 'react';
import { useSWRConfig } from 'swr';
import { Eye, Mail, Pencil, Trash2, Upload, MoreVertical, Check, X, FileText, MessageSquare } from 'lucide-react';
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

    const handleDiscussionChange = async (firmId: string, contactId: string, value: 'Yes' | 'No') => {
        try {
            await fetch('/api/due-diligence/dt-feedback', {
                method: 'POST',
                body: JSON.stringify({ companyId, firmId, contactId, updates: { discussionHappened: value } }),
            });
            mutate(`/api/due-diligence/dt-feedback?companyId=${companyId}`);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
        }
    };
    
    const openCaptureModal = (contact: DTContact) => {
        setActiveContact(contact);
        setMinutesContent('Placeholder for existing minutes...'); // Load existing minutes here
        setCaptureModalOpen(true);
    };

    const openViewModal = (contact: DTContact) => {
        setActiveContact(contact);
        setMinutesContent('Placeholder for saved minutes content...'); // Load saved minutes
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
                        // In a real app, you'd save `minutesContent`
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
                                    {firm.contacts.map((contact) => (
                                        <TableRow key={contact.id}>
                                            <TableCell>{contact.name}</TableCell>
                                            <TableCell>
                                                 <Select
                                                    value={contact.discussionHappened}
                                                    onValueChange={(value: 'Yes' | 'No') => handleDiscussionChange(firm.id, contact.id, value)}
                                                >
                                                    <SelectTrigger className="w-[100px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Yes">Yes</SelectItem>
                                                        <SelectItem value="No">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell><Badge variant={minutesVariant(contact.minutesCaptured)}>{contact.minutesCaptured}</Badge></TableCell>
                                            <TableCell>{contact.minutesCapturedOn ? format(parseISO(contact.minutesCapturedOn), 'dd-MMM-yyyy') : 'N/A'}</TableCell>
                                            <TableCell>{contact.email}</TableCell>
                                            <TableCell>{contact.contact}</TableCell>
                                            <TableCell><Badge variant={statusVariant(contact.status)}>{contact.status}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                 <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openViewModal(contact)}><Eye className="mr-2 h-4 w-4" />View Minutes</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openCaptureModal(contact)}><Pencil className="mr-2 h-4 w-4" />Capture/Edit Minutes</DropdownMenuItem>
                                                        <DropdownMenuItem><Mail className="mr-2 h-4 w-4" />Send Feedback Email</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openUploadModal(contact)}><Upload className="mr-2 h-4 w-4" />Upload Document</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
                    <div className="py-4 prose prose-sm max-w-none">
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
