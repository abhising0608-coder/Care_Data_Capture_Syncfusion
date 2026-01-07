
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
import type { RatingNote, AppUser } from '@/lib/definitions';
import { useAuth } from '@/firebase';

const emailSchema = z.object({
  to: z.string().email("Invalid email").min(1, 'To field is required'),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Email body is required'),
});

type EmailFormValues = z.infer<typeof emailSchema>;

interface SendPrToClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    note: RatingNote;
    analyst: AppUser;
}

const generateEmailBody = (note: RatingNote, analyst: AppUser): string => {
    let body = `Dear Sir/Madam,\n\n`;
    body += `Please find attached the press release for ${note.companyName} for your perusal.\n\n`;
    body += `This is in respect of the rating assigned at the Rating Committee meeting held on ${format(new Date(note.ratingNoteData?.workflowContext.committeeDate || new Date()), 'dd-MMM-yyyy')}.\n\n`;
    body += `Kindly confirm your acceptance of the rating by replying to this email.\n\n`;
    body += `Best regards,\n`;
    body += `${analyst.displayName}\n`;
    body += `CareEdge Ratings Ltd.`;
    return body;
};


export function SendPrToClientModal({ isOpen, onClose, note, analyst }: SendPrToClientModalProps) {
    const { toast } = useToast();
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const { user: groupHead } = useAuth(); // Assuming GH is logged in for CC list

    const form = useForm<EmailFormValues>({
        resolver: zodResolver(emailSchema),
    });
    const { control, handleSubmit, reset, formState: { isDirty } } = form;

    useEffect(() => {
        if (isOpen) {
            const emailBody = generateEmailBody(note, analyst);
            
            // Placeholder: Logic to get UPSI and Primary contacts would go here
            const toEmail = 'primary.contact@company.com';
            const bccEmail = 'upsi.contact@company.com'; // BCC for UPSI
            const ccEmails = [analyst.email, groupHead?.email].filter(Boolean).join(', ');


            reset({
                to: toEmail,
                cc: ccEmails,
                bcc: bccEmail,
                subject: `Press Release: Credit rating of ${note.companyName}`,
                body: emailBody,
            });
        }
    }, [isOpen, note, analyst, reset, groupHead]);


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
        console.log('Sending PR email to client:', data);
        toast({
            title: 'Email Sent',
            description: `Press Release has been sent to ${data.to}.`,
        });
        onClose();
    };


    return (
      <>
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Send Press Release to Client</DialogTitle>
                     <DialogDescription>
                        Review and send the Press Release to the client for acceptance.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4 py-4 border-t border-b">
                         <div className="grid grid-cols-[100px_1fr] items-center gap-4 px-4">
                            <Label htmlFor="from" className="text-right text-muted-foreground">From</Label>
                            <Input id="from" value={analyst.email || 'analyst@careedge.com'} readOnly className="col-span-3 bg-muted" />
                        </div>
                         <div className="grid grid-cols-[100px_1fr] items-center gap-4 px-4">
                            <Label htmlFor="to" className="text-right text-muted-foreground">To*</Label>
                            <Controller name="to" control={control} render={({ field }) => <Input {...field} id="to" className="col-span-3" />} />
                        </div>
                         <div className="grid grid-cols-[100px_1fr] items-center gap-4 px-4">
                            <Label htmlFor="cc" className="text-right text-muted-foreground">CC</Label>
                            <Controller name="cc" control={control} render={({ field }) => <Input {...field} id="cc" className="col-span-3" />} />
                        </div>
                        <div className="grid grid-cols-[100px_1fr] items-center gap-4 px-4">
                            <Label htmlFor="bcc" className="text-right text-muted-foreground">BCC</Label>
                            <Controller name="bcc" control={control} render={({ field }) => <Input {...field} id="bcc" className="col-span-3" />} />
                        </div>
                         <div className="grid grid-cols-[100px_1fr] items-center gap-4 px-4">
                            <Label htmlFor="subject" className="text-right text-muted-foreground">Subject*</Label>
                             <Controller name="subject" control={control} render={({ field }) => <Input {...field} id="subject" className="col-span-3" />} />
                        </div>
                        <div className="grid grid-cols-[100px_1fr] items-center gap-4 px-4">
                            <Label className="text-right text-muted-foreground">Attachments</Label>
                             <div className="flex items-center gap-2 p-2 border rounded-md bg-muted text-sm">
                                <Paperclip className="h-4 w-4" />
                                <span>{`PR_${note.companyName.replace(/ /g, '_')}.pdf`}</span>
                            </div>
                        </div>

                        <div className="px-4">
                             <Controller name="body" control={control} render={({ field }) => <Textarea {...field} id="body" className="col-span-3 min-h-[300px]" />} />
                        </div>
                    </div>
                    <DialogFooter className="pt-6">
                        <Button type="button" variant="outline" onClick={handleClose}>Close</Button>
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

