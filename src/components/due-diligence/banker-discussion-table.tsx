'use client';

import { useState } from 'react';
import { useForm, FormProvider, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Check, RefreshCw, Eye, Mail, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter, useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Banker, BankerDiscussion, RatingNote } from '@/lib/definitions';
import { useAuth } from '@/firebase';


interface BankerDiscussionTableProps {
    discussions: BankerDiscussion[];
    banker: Banker;
    note: RatingNote;
    onAddDiscussion: (newDiscussion: BankerDiscussion) => void;
}

const discussionSchema = z.object({
  contactPerson: z.string().min(1, 'Please select a contact person.'),
  discussionHappened: z.enum(['Yes', 'No']),
});

type DiscussionFormValues = z.infer<typeof discussionSchema>;

const statusVariant = (status: BankerDiscussion['status']) => {
    switch (status) {
        case 'Completed': return 'default';
        case 'In Progress': return 'secondary';
        case 'Pending':
        default: return 'destructive';
    }
}


export function BankerDiscussionTable({ discussions, banker, note, onAddDiscussion }: BankerDiscussionTableProps) {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const ratingCycleId = params.ratingCycleId as string;

    const [localDiscussions, setLocalDiscussions] = useState(discussions);

    const form = useForm<DiscussionFormValues>({
        resolver: zodResolver(discussionSchema),
        defaultValues: {
            contactPerson: '',
            discussionHappened: 'No',
        },
    });

    const { control, handleSubmit, reset } = form;

    const mockBankerContacts = [
        { id: 'bank-contact-1', name: 'Amit Sharma', email: 'amit@icici.com', contact: '1111111111' },
        { id: 'bank-contact-2', name: 'Vijay Varma', email: 'vijay@icici.com', contact: '2222222222' },
        { id: 'bank-contact-3', name: 'Rajesh M.', email: 'rajesh@icici.com', contact: '3333333333' },
    ];

    const handleAdd = (data: DiscussionFormValues) => {
        const contact = mockBankerContacts.find(c => c.name === data.contactPerson);
        if (!contact) return;

        const newDiscussion: BankerDiscussion = {
            id: uuidv4(),
            ...data,
            minutesCaptured: 'No',
            minutesCapturedOn: null,
            emailId: contact.email,
            contact: contact.contact,
            status: 'Pending',
        };
        
        onAddDiscussion(newDiscussion);
        setLocalDiscussions(prev => [...prev, newDiscussion]);
        reset();
        toast({
            title: 'Discussion Logged',
            description: `A new entry for ${data.contactPerson} has been added.`
        });
    };

    const handleAction = (action: 'view' | 'email', discussion: BankerDiscussion) => {
        // Placeholder for navigation/modal
        toast({
            title: `Action: ${action}`,
            description: `Triggered for ${discussion.contactPerson}. Navigation to be implemented.`,
        });
    };
    
    const handleDelete = (id: string) => {
        setLocalDiscussions(prev => prev.filter(d => d.id !== id));
        toast({
            variant: 'destructive',
            title: 'Entry Deleted',
            description: 'The discussion entry has been removed.'
        })
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(handleAdd)}>
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Contact Person</TableHead>
                                <TableHead>Discussion Happened</TableHead>
                                <TableHead>Minutes Captured</TableHead>
                                <TableHead>Minutes Captured On</TableHead>
                                <TableHead>Email Id</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="bg-muted/50">
                                <TableCell>
                                    <Controller
                                        name="contactPerson"
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent>
                                                    {mockBankerContacts.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </TableCell>
                                <TableCell>
                                     <Controller
                                        name="discussionHappened"
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Yes">Yes</SelectItem>
                                                    <SelectItem value="No">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </TableCell>
                                <TableCell colSpan={5}></TableCell>
                                <TableCell className="flex gap-1">
                                    <Button variant="ghost" size="icon" type="submit"><Check className="h-4 w-4 text-green-500" /></Button>
                                    <Button variant="ghost" size="icon" type="button" onClick={() => reset()}><RefreshCw className="h-4 w-4 text-blue-500" /></Button>
                                </TableCell>
                            </TableRow>
                             {localDiscussions.map((d) => (
                                <TableRow key={d.id}>
                                    <TableCell>{d.contactPerson}</TableCell>
                                    <TableCell>{d.discussionHappened}</TableCell>
                                    <TableCell>{d.minutesCaptured}</TableCell>
                                    <TableCell>{d.minutesCapturedOn ? format(new Date(d.minutesCapturedOn), 'dd-MM-yyyy') : '-'}</TableCell>
                                    <TableCell>{d.emailId}</TableCell>
                                    <TableCell>{d.contact}</TableCell>
                                    <TableCell><Badge variant={statusVariant(d.status)}>{d.status}</Badge></TableCell>
                                    <TableCell className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleAction('view', d)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                         <Button variant="ghost" size="icon" onClick={() => handleAction('email', d)}>
                                            <Mail className="h-4 w-4" />
                                        </Button>
                                         <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </form>
        </FormProvider>
    );
}
