'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Send, Paperclip } from 'lucide-react';
import { format } from 'date-fns';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { CompanyDashboard, SiteVisit } from '@/lib/definitions';
import { useAuth } from '@/firebase';

const emailSchema = z.object({
  to: z.string().email("Invalid email").min(1, 'To field is required'),
  cc: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Email body is required'),
});

type EmailFormValues = z.infer<typeof emailSchema>;

interface SiteVisitEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    visitData: Partial<SiteVisit>;
    company: CompanyDashboard;
}

const generateEmailBody = (visitData: Partial<SiteVisit>, company: CompanyDashboard): string => {
    let body = `Dear Team,\n\nPlease find the minutes of the recent site visit regarding ${company.companyName} for your confirmation.\n\n`;

    body += `--------------------------------\n`;
    body += `PLANT VISIT DETAILS\n`;
    body += `--------------------------------\n`;
    if (visitData.visitDate) {
         body += `Date of Visit: ${format(visitData.visitDate, "PPP")}\n`;
    }
    body += `Plant Visited: ${visitData.plantVisited || 'N/A'}\n`;
    body += `Location: ${visitData.location || 'N/A'}\n\n`;

    if (visitData.careTeam && visitData.careTeam.length > 0) {
        body += `Attendees (CARE Team):\n`;
        visitData.careTeam.forEach(member => {
            body += `- ${member}\n`;
        });
        body += `\n`;
    }

    if (visitData.clientPersonnel && visitData.clientPersonnel.length > 0) {
        body += `Attendees (Client Personnel):\n`;
        visitData.clientPersonnel.forEach(p => {
            body += `- ${p.name} (${p.designation})\n`;
        });
        body += `\n`;
    }

    body += `--------------------------------\n`;
    body += `OTHER DETAILS\n`;
    body += `--------------------------------\n`;
    body += `Product Manufactured: ${visitData.productManufactured || 'N/A'}\n`;
    body += `Installed Capacity: ${visitData.installedCapacity || 'N/A'}\n`;
    body += `Other Information: ${visitData.otherInfo || 'N/A'}\n\n`;
    
    body += 'We appreciate your prompt confirmation.\n\nBest regards,\nCareEdge Ratings';
    return body;
}

export function SiteVisitEmailModal({ isOpen, onClose, visitData, company }: SiteVisitEmailModalProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const form = useForm<EmailFormValues>({
        resolver: zodResolver(emailSchema),
    });
    const { control, handleSubmit, reset, formState: { isDirty } } = form;

    useEffect(() => {
        if (isOpen && company) {
            const ccList = [user?.email, 'group.head@careedge.com', 'rating.head@careedge.com'].filter(Boolean).join(', ');
            const emailBody = generateEmailBody(visitData, company);
            
            reset({
                to: 'primary.contact@company.com', // Placeholder, should come from contact master
                cc: ccList,
                subject: `Site / Plant Visit - ${company.companyName}`,
                body: emailBody,
            });
        }
    }, [isOpen, visitData, company, user, reset]);

    const handleClose = () => {
        if (isDirty) {
            setIsAlertOpen(true);
        } else {
            onClose();
        }
    };
    
    const onConfirmClose = () => {
        setIsAlertOpen(false);
        onClose();
    };

    const onSubmit = (data: EmailFormValues) => {
        console.log('Sending site visit minutes email:', data);
        toast({
            title: 'Email Sent',
            description: `Minutes have been sent to ${data.to}.`,
        });
        onClose();
    };

    return (
      <>
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Email Confirmation: Site / Plant Visit</DialogTitle>
                     <DialogDescription>
                        Review and send the minutes of the site visit to the client.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="from" className="text-right">From</Label>
                            <Input id="from" value="team@careedge.com" readOnly className="col-span-3 bg-muted" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="to" className="text-right">To</Label>
                            <Controller name="to" control={control} render={({ field }) => <Input {...field} id="to" className="col-span-3" />} />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cc" className="text-right">CC</Label>
                            <Controller name="cc" control={control} render={({ field }) => <Input {...field} id="cc" className="col-span-3" />} />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="subject" className="text-right">Subject</Label>
                             <Controller name="subject" control={control} render={({ field }) => <Input {...field} id="subject" className="col-span-3" />} />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                             <Label htmlFor="body" className="text-right pt-2">Body</Label>
                             <Controller name="body" control={control} render={({ field }) => <Textarea {...field} id="body" className="col-span-3 min-h-[300px]" />} />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="attachments" className="text-right">Attachments</Label>
                            <div className="col-span-3">
                                <Button type="button" variant="outline" size="sm"><Paperclip className="mr-2 h-4 w-4" /> Add Attachment</Button>
                                <p className="text-xs text-muted-foreground mt-1">(Attachment upload is a placeholder)</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                        <Button type="submit"><Send className="mr-2 h-4 w-4" /> Send</Button>
                    </DialogFooter>
                </form>
                 <DialogClose asChild>
                    <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground" onClick={handleClose}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </button>
                 </DialogClose>
            </DialogContent>
        </Dialog>
        
         <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You have unsaved changes. Are you sure you want to discard them and close the dialog?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>No, stay</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirmClose}>Yes, discard</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </>
    );
}
