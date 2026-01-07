'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { Save, Send, Calendar as CalendarIcon } from 'lucide-react';
import useSWR from 'swr';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import type { RatingNote, RatingInstrument } from '@/lib/definitions';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PressReleasePublicationProps {
  note: RatingNote;
}

const publicationSchema = z.object({
  clientConfirmationStatus: z.string().min(1, 'Confirmation status is required.'),
  clientConfirmationDate: z.date().nullable(),
}).refine(data => {
    if (data.clientConfirmationStatus === 'Accepted' && !data.clientConfirmationDate) {
        return false;
    }
    return true;
}, {
    message: 'Confirmation date is required when status is "Accepted".',
    path: ['clientConfirmationDate'],
});

type PublicationFormValues = z.infer<typeof publicationSchema>;

const fetcher = (url: string) => fetch(url).then(res => res.json());

const InfoField = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-2 items-center">
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <div className="text-sm">{value || <span className="text-xs italic">N/A</span>}</div>
    </div>
);


export function PressReleasePublication({ note }: PressReleasePublicationProps) {
    const { data: instruments, isLoading } = useSWR<RatingInstrument[]>(
        note.companyId ? `/api/instruments/${note.companyId}` : null,
        fetcher
    );
    const { toast } = useToast();
    const router = useRouter();
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', description: '', onConfirm: () => {} });

    const form = useForm<PublicationFormValues>({
        resolver: zodResolver(publicationSchema),
        defaultValues: {
            clientConfirmationStatus: '',
            clientConfirmationDate: null,
        },
    });

    const { watch, control, handleSubmit } = form;
    const clientConfirmationStatus = watch('clientConfirmationStatus');
    const clientConfirmationDate = watch('clientConfirmationDate');
    
    const isSendEnabled = clientConfirmationStatus === 'Accepted' && clientConfirmationDate;
    
    const instrumentsByMandate = instruments?.reduce((acc, inst) => {
        const key = inst.mandateId || 'Unknown Mandate';
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(inst);
        return acc;
    }, {} as Record<string, RatingInstrument[]>);

    const mandateIds = instrumentsByMandate ? Object.keys(instrumentsByMandate) : [];
    
    const onPublicationSubmit = (data: PublicationFormValues) => {
        toast({
            title: 'Sent for Publication',
            description: 'The press release has been sent to the publication team.',
        });
        // In a real app, this would trigger an API call to a backend service.
    };
    
    const handleConfirmRepresentation = () => {
        setIsConfirmModalOpen(false);
        toast({
            title: 'Case Moved to Representation',
            description: 'A new representation cycle has been initiated in Pre-committee.',
        });
        router.push('/dashboard');
    }

    const handleConfirmReview = () => {
        setIsConfirmModalOpen(false);
        toast({
            title: 'Case Moved for Review',
            description: 'A new review cycle has been initiated in Pre-committee for enhancement.',
        });
        router.push('/dashboard');
    }
    
    const handleSave = () => {
         const status = form.getValues('clientConfirmationStatus');
         if (status === 'Representation') {
             setModalContent({
                title: 'Confirmation',
                description: 'Are you sure you want to move back this case to pre committee level as you have selected client confirmation status as "Representation"?',
                onConfirm: handleConfirmRepresentation,
             });
             setIsConfirmModalOpen(true);
         } else if (status === 'Review') {
             setModalContent({
                title: 'Confirmation',
                description: 'Are you sure you want to move back this case to pre committee level as you have selected client confirmation status as "Review"?',
                onConfirm: handleConfirmReview,
             });
             setIsConfirmModalOpen(true);
         } else {
             toast({
                title: 'Draft Saved',
                description: 'Your changes have been saved.',
            });
         }
    };

  return (
    <>
        <FormProvider {...form}>
        <form onSubmit={handleSubmit(onPublicationSubmit)}>
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>{note.companyName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                        <InfoField label="Date of Committee" value={format(new Date(note.ratingNoteData?.workflowContext.committeeDate || Date.now()), 'dd-MMM-yyyy')} />
                        <InfoField label="Draft PR Sent Date" value={format(new Date(), 'dd-MMM-yyyy')} />
                        <FormField
                            control={control}
                            name="clientConfirmationStatus"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-2 items-center">
                                    <FormLabel>Client Confirmation Status</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Accepted">Accepted</SelectItem>
                                            <SelectItem value="Representation">Representation</SelectItem>
                                            <SelectItem value="Review">Review</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="col-start-2" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="clientConfirmationDate"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-2 items-center">
                                    <FormLabel>Client Confirmation Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                    disabled={clientConfirmationStatus !== 'Accepted'}
                                                >
                                                    {field.value ? format(field.value, "PPP") : <span>DD-MM-YYYY</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value || undefined}
                                                onSelect={field.onChange}
                                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage className="col-start-2" />
                                </FormItem>
                            )}
                        />
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Mandate Details</h3>
                        {isLoading ? (
                            <Skeleton className="h-48 w-full" />
                        ) : (
                            <Accordion type="multiple" defaultValue={mandateIds} className="w-full">
                            {instrumentsByMandate && Object.entries(instrumentsByMandate).map(([mandateId, mandateInstruments]) => (
                                    <AccordionItem value={mandateId} key={mandateId}>
                                        <AccordionTrigger className="font-semibold bg-muted/50 px-4 rounded-t-lg">{mandateId}</AccordionTrigger>
                                        <AccordionContent className="border border-t-0 p-0 rounded-b-lg">
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Instrument ID</TableHead>
                                                            <TableHead>Category</TableHead>
                                                            <TableHead>Sub Category</TableHead>
                                                            <TableHead>Instrument Name</TableHead>
                                                            <TableHead className="text-right">Total INS Amt. Size</TableHead>
                                                            <TableHead>PCL Acceptance Date</TableHead>
                                                            <TableHead>Rating Assigned</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {mandateInstruments.map((instrument) => (
                                                            <TableRow key={instrument.id}>
                                                                <TableCell>{instrument.instrumentId}</TableCell>
                                                                <TableCell>{instrument.category}</TableCell>
                                                                <TableCell>{instrument.subCategory}</TableCell>
                                                                <TableCell>{instrument.instrument}</TableCell>
                                                                <TableCell className="text-right">{instrument.instrumentSize.toLocaleString('en-IN')}</TableCell>
                                                                <TableCell>{instrument.initialRatingDate ? format(new Date(instrument.initialRatingDate), 'dd-MMM-yyyy') : 'N/A'}</TableCell>
                                                                <TableCell>{instrument.cycleHistory[0]?.rating || 'N/A'}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                            ))}
                            </Accordion>
                        )}
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button type="button" variant="outline" onClick={handleSave}>Save</Button>
                        <Button type="submit" disabled={!isSendEnabled}>
                            <Send className="mr-2 h-4 w-4" /> Send for Publication
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
        </FormProvider>

        <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
            <DialogContent className="sm:max-w-md">
                 <DialogHeader>
                    <DialogTitle>{modalContent.title}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p>{modalContent.description}</p>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">No</Button>
                    </DialogClose>
                    <Button onClick={modalContent.onConfirm}>Yes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
