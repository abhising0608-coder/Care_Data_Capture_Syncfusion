'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Send, Paperclip } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { RatingNote, Banker, BankerDiscussion, AppUser } from '@/lib/definitions';
import { useAuth } from '@/firebase';

const emailSchema = z.object({
  to: z.string().email("Invalid email").min(1, 'To field is required'),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Email body is required'),
});

type EmailFormValues = z.infer<typeof emailSchema>;

interface BankerEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    note: RatingNote;
    banker: Banker;
    discussion: BankerDiscussion;
    analyst: AppUser;
}

const generateFeedbackSeekingBody = (note: RatingNote, banker: Banker, analyst: AppUser): string => {
    let body = `Dear Sir/Madam,\n\n`;
    body += `As part of our annual surveillance of the ratings assigned to the bank facilities/debt instruments of ${note.companyName}, we would appreciate your feedback on the company.\n\n`;
    body += `We have attached a questionnaire for your reference. Your timely response would be highly valuable to our rating process.\n\n`;
    body += `Best regards,\n`;
    body += `${analyst.displayName}\n`;
    body += `CareEdge Ratings Ltd.`;
    return body;
};

const generateMinutesConfirmationBody = (note: RatingNote, banker: Banker, analyst: AppUser, discussion: BankerDiscussion): string => {
    let body = `Dear Sir/Madam,\n\n`;
    body += `This is in reference to our discussion on ${discussion.minutesCapturedOn ? new Date(discussion.minutesCapturedOn).toLocaleDateString() : 'a recent date'} regarding the rating of ${note.companyName}.\n\n`;
    body += `Please find attached the minutes of our discussion for your confirmation. Kindly review and confirm at your earliest convenience.\n\n`;
    body += `Best regards,\n`;
    body += `${analyst.displayName}\n`;
    body += `CareEdge Ratings Ltd.`;
    return body;
};


export function BankerEmailModal({ isOpen, onClose, note, banker, discussion, analyst }: BankerEmailModalProps) {
    const { toast } = useToast();
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    // In a real app, GH/RH would come from the note or user hierarchy
    const { user: groupHead } = useAuth(); 

    const form = useForm<EmailFormValues>({
        resolver: zodResolver(emailSchema),
    });
    const { control, handleSubmit, reset, formState: { isDirty } } = form;

    useEffect(() => {
        if (isOpen) {
            const emailBody = discussion.discussionHappened === 'Yes'
                ? generateMinutesConfirmationBody(note, banker, analyst, discussion)
                : generateFeedbackSeekingBody(note, banker, analyst);
            
            const toEmail = discussion.emailId;
            const ccEmails = [analyst.email, groupHead?.email].filter(Boolean).join(', ');


            reset({
                to: toEmail,
                cc: ccEmails,
                bcc: '',
                subject: `Credit rating of ${note.companyName}`,
                body: emailBody,
            });
        }
    }, [isOpen, note, banker, discussion, analyst, reset, groupHead]);


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
        console.log('Sending Banker email:', data);
        toast({
            title: 'Email Sent',
            description: `Email has been sent to ${data.to}.`,
        });
        onClose();
    };


    return (
      <>
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Banker Email Confirmation</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4 py-4 border-t border-b">
                         <div className="grid grid-cols-[100px_1fr] items-center gap-4 px-4">
                            <Label htmlFor="from" className="text-right text-muted-foreground">From</Label>
                            <Input id="from" value={'team@careedge.com'} readOnly className="col-span-3 bg-muted" />
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
                            <Label htmlFor="subject" className="text-right text-muted-foreground">Subject*</Label>
                             <Controller name="subject" control={control} render={({ field }) => <Input {...field} id="subject" className="col-span-3" />} />
                        </div>
                        <div className="grid grid-cols-[100px_1fr] items-center gap-4 px-4">
                            <Label className="text-right text-muted-foreground">Attachments</Label>
                             <div className="flex items-center gap-2 p-2 border rounded-md bg-muted text-sm">
                                <Paperclip className="h-4 w-4" />
                                <span>{`Banker_Questionnaire_${note.companyName.replace(/ /g, '_')}.pdf`}</span>
                            </div>
                        </div>
                         <div className="px-4">
                            <Label>Body</Label>
                             <Controller name="body" control={control} render={({ field }) => <Textarea {...field} id="body" className="col-span-3 min-h-[250px] mt-2" />} />
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
