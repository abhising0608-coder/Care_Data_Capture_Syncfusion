'use client';

import { useState } from 'react';
import { useForm, FormProvider, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Check, RefreshCw, Eye, Mail, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { AuditorDiscussion } from '@/lib/definitions';
import { mockAuditorContacts } from '@/lib/mock-data';

interface AuditorDiscussionTableProps {
    discussions: AuditorDiscussion[];
    onAddDiscussion: (newDiscussion: AuditorDiscussion) => void;
}

const discussionSchema = z.object({
  contactPerson: z.string().min(1, 'Please select a contact person.'),
  discussionHappened: z.enum(['Yes', 'No']),
});

type DiscussionFormValues = z.infer<typeof discussionSchema>;

const statusVariant = (status: AuditorDiscussion['status']) => {
    switch (status) {
        case 'Completed': return 'default';
        case 'In Progress': return 'secondary';
        case 'Pending':
        default: return 'destructive';
    }
}


export function AuditorDiscussionTable({ discussions, onAddDiscussion }: AuditorDiscussionTableProps) {
    const { toast } = useToast();
    const [localDiscussions, setLocalDiscussions] = useState(discussions);

    const form = useForm<DiscussionFormValues>({
        resolver: zodResolver(discussionSchema),
        defaultValues: {
            contactPerson: '',
            discussionHappened: 'No',
        },
    });

    const { control, handleSubmit, reset } = form;

    const handleAdd = (data: DiscussionFormValues) => {
        const contact = mockAuditorContacts.find(c => c.name === data.contactPerson);
        if (!contact) return;

        const newDiscussion: AuditorDiscussion = {
            id: uuidv4(),
            ...data,
            minutesCaptured: 'No',
            interactionDate: data.discussionHappened === 'No' ? new Date().toISOString() : null,
            email: contact.email,
            contact: contact.contact,
            status: data.discussionHappened === 'Yes' ? 'Pending' : 'In Progress',
        };
        
        onAddDiscussion(newDiscussion); // Propagate change to parent
        setLocalDiscussions(prev => [...prev, newDiscussion]); // Update local state to re-render
        reset();
        toast({
            title: 'Discussion Logged',
            description: `A new entry for ${data.contactPerson} has been added.`
        });
    };

    const handleAction = (action: 'view' | 'email', id: string) => {
        toast({
            title: 'Action Triggered',
            description: `Action '${action}' on item ${id} is a placeholder for now.`
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
                                <TableHead>Date of Interaction/Email</TableHead>
                                <TableHead>Email Id</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* New Row */}
                            <TableRow className="bg-muted/50">
                                <TableCell>
                                    <Controller
                                        name="contactPerson"
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent>
                                                    {mockAuditorContacts.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
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
                            {/* Existing Rows */}
                             {localDiscussions.map((d) => (
                                <TableRow key={d.id}>
                                    <TableCell>{d.contactPerson}</TableCell>
                                    <TableCell>{d.discussionHappened}</TableCell>
                                    <TableCell>{d.minutesCaptured}</TableCell>
                                    <TableCell>{d.interactionDate ? format(new Date(d.interactionDate), 'dd-MM-yyyy') : '-'}</TableCell>
                                    <TableCell>{d.email}</TableCell>
                                    <TableCell>{d.contact}</TableCell>
                                    <TableCell><Badge variant={statusVariant(d.status)}>{d.status}</Badge></TableCell>
                                    <TableCell className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleAction('view', d.id)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                         <Button variant="ghost" size="icon" onClick={() => handleAction('email', d.id)}>
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
