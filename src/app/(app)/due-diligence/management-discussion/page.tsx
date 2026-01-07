'use client';

import { useState } from 'react';
import { useForm, FormProvider, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { format } from "date-fns";
import { Calendar as CalendarIcon, Save, Send, Mail, Check, Trash2, Pencil, RefreshCw, ArrowLeft, X } from "lucide-react";
import { useRouter } from 'next/navigation';

import { useAuth } from '@/firebase';
import { getCompaniesByRole, mockUsers } from '@/lib/mock-data';
import type { ManagementDiscussion, ManagementPersonnel, DiscussionMinute, CompanyDashboard } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from "@/lib/utils";
import { ManagementDiscussionEmailModal } from '@/components/due-diligence/management-discussion-email-modal';

const formSchema = z.object({
    companyId: z.string().min(1, 'Company is required'),
    interactionDate: z.date().optional().nullable(),
    location: z.string().optional(),
    careTeam: z.array(z.string()).optional(),
    managementPersonnel: z.array(z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
        designation: z.string().min(1, "Designation is required"),
    })).optional(),
    discussionMinutes: z.array(z.object({
        id: z.string(),
        issue: z.string().min(1, "Issue is required"),
        response: z.string().min(1, "Response is required"),
    })).optional(),
});

type ManagementDiscussionFormValues = z.infer<typeof formSchema>;

export default function ManagementDiscussionPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    const companies = getCompaniesByRole(user);
    const careTeamMembers = Object.values(mockUsers).map(u => u.displayName || u.email);

    const form = useForm<ManagementDiscussionFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            companyId: '',
            interactionDate: null,
            location: '',
            careTeam: [],
            managementPersonnel: [],
            discussionMinutes: [],
        },
    });
    
    const { fields: personnelFields, append: appendPersonnel, remove: removePersonnel, update: updatePersonnel } = useFieldArray({
        control: form.control,
        name: "managementPersonnel",
    });

    const { fields: minuteFields, append: appendMinute, remove: removeMinute, update: updateMinute } = useFieldArray({
        control: form.control,
        name: "discussionMinutes",
    });
    
    const [editingPersonnelIndex, setEditingPersonnelIndex] = useState<number | null>(null);
    const [newPersonnel, setNewPersonnel] = useState<Partial<ManagementPersonnel>>({});
    
    const [editingMinuteIndex, setEditingMinuteIndex] = useState<number | null>(null);
    const [newMinute, setNewMinute] = useState<Partial<DiscussionMinute>>({});

    const handleSave = (data: ManagementDiscussionFormValues) => {
        console.log("Saving draft:", data);
        toast({ title: 'Draft Saved', description: 'Your changes have been saved.' });
    };

    const handleMarkComplete = (data: ManagementDiscussionFormValues) => {
        if (!data.interactionDate || !data.discussionMinutes?.length) {
            toast({ variant: 'destructive', title: 'Validation Error', description: 'Date of Interaction and at least one discussion minute are required to mark as complete.' });
            return;
        }
        console.log("Marking as complete:", data);
        toast({ title: 'Complete', description: 'Discussion minutes have been finalized and uploaded to DMS (simulated).' });
        // Here you would generate PDF and upload to DMS
    };

    const handleEmailToClient = () => {
        const companyId = form.getValues('companyId');
        if (!companyId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a company first.' });
            return;
        }
        setIsEmailModalOpen(true);
    };

    const renderEditableTable = (
        title: string,
        description: string,
        columns: { key: string; header: string }[],
        fields: any[],
        newRowState: any,
        setNewRowState: Function,
        editingIndex: number | null,
        setEditingIndex: Function,
        appendFn: Function,
        updateFn: Function,
        removeFn: Function
    ) => (
        <Card>
            <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow>{columns.map(c => <TableHead key={c.key}>{c.header}</TableHead>)}<TableHead className="w-[120px]">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {fields.map((field, index) => (
                             editingIndex === index ? (
                                 <TableRow key={field.id}>
                                    {columns.map(col => <TableCell key={col.key}><Input value={newRowState[col.key] || ''} onChange={e => setNewRowState((prev: any) => ({ ...prev, [col.key]: e.target.value }))} /></TableCell>)}
                                     <TableCell className="flex gap-1">
                                        <Button size="icon" variant="ghost" onClick={() => { updateFn(index, { ...field, ...newRowState }); setEditingIndex(null); setNewRowState({}); }}><Check className="h-4 w-4 text-green-500" /></Button>
                                        <Button size="icon" variant="ghost" onClick={() => { setEditingIndex(null); setNewRowState({}); }}><X className="h-4 w-4 text-red-500" /></Button>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <TableRow key={field.id}>
                                    {columns.map(col => <TableCell key={col.key}>{field[col.key]}</TableCell>)}
                                    <TableCell className="flex gap-1">
                                        <Button size="icon" variant="ghost" onClick={() => { setEditingIndex(index); setNewRowState(field); }}><Pencil className="h-4 w-4 text-blue-500" /></Button>
                                        <Button size="icon" variant="ghost" onClick={() => removeFn(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </TableCell>
                                </TableRow>
                            )
                        ))}
                         {editingIndex === null && (
                            <TableRow>
                                {columns.map(col => <TableCell key={`new-${col.key}`}><Input placeholder={col.header} value={newRowState[col.key] || ''} onChange={(e) => setNewRowState((prev: any) => ({ ...prev, [col.key]: e.target.value }))} /></TableCell>)}
                                <TableCell className="flex gap-1">
                                    <Button size="icon" variant="ghost" onClick={() => { appendFn({ id: uuidv4(), ...newRowState }); setNewRowState({}); }}><Check className="h-4 w-4 text-green-500" /></Button>
                                    <Button size="icon" variant="ghost" onClick={() => setNewRowState({})}><RefreshCw className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );

    const formData = form.watch();
    const selectedCompanyId = form.watch('companyId');
    const selectedCompany = companies.find(c => c.id === selectedCompanyId);

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Management Discussion</h1>
                <p className="text-muted-foreground">Capture minutes of discussion with company management.</p>
            </header>

            <FormProvider {...form}>
                <form>
                    <Card>
                        <CardHeader><CardTitle>Meeting Metadata</CardTitle></CardHeader>
                        <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                             <FormField name="companyId" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a company" /></SelectTrigger></FormControl>
                                        <SelectContent>{companies.map(c => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField name="interactionDate" control={form.control} render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date of Interaction</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                             )} />
                            <FormField name="location" control={form.control} render={({ field }) => (<FormItem><FormLabel>Meeting Location</FormLabel><FormControl><Input placeholder="e.g., Virtual, Mumbai Office" {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField name="careTeam" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CARE Team Attendees</FormLabel>
                                    <Select onValueChange={val => field.onChange([...(field.value || []), val])} >
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select team members" /></SelectTrigger></FormControl>
                                        <SelectContent>{careTeamMembers.map((name, i) => <SelectItem key={i} value={name!}>{name}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {field.value?.map(member => <span key={member} className="bg-muted px-2 py-1 text-sm rounded-md">{member}</span>)}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    {renderEditableTable(
                        "Management Personnel Interacted",
                        "Add the company personnel who attended the meeting.",
                        [{key: 'name', header: 'Name'}, {key: 'designation', header: 'Designation'}],
                        personnelFields, newPersonnel, setNewPersonnel, editingPersonnelIndex, setEditingPersonnelIndex, appendPersonnel, updatePersonnel, removePersonnel
                    )}
                    
                    {renderEditableTable(
                        "Minutes of Discussion",
                        "Capture key issues raised and the management’s response.",
                        [{key: 'issue', header: 'Issues Raised'}, {key: 'response', header: 'Management’s Response'}],
                        minuteFields, newMinute, setNewMinute, editingMinuteIndex, setEditingMinuteIndex, appendMinute, updateMinute, removeMinute
                    )}
                    
                    <div className="flex justify-end gap-4 mt-8">
                        <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                        <Button type="button" variant="outline" onClick={form.handleSubmit(handleSave)}><Save className="mr-2 h-4 w-4" />Save Draft</Button>
                        <Button type="button" variant="outline" onClick={() => toast({ title: 'Placeholder', description: 'Send to GH functionality to be implemented.'})}><Send className="mr-2 h-4 w-4" />Send to GH</Button>
                        <Button type="button" variant="outline" onClick={handleEmailToClient}><Mail className="mr-2 h-4 w-4" />Email to Client</Button>
                        <Button type="button" onClick={form.handleSubmit(handleMarkComplete)}>Mark as Complete</Button>
                    </div>

                </form>
            </FormProvider>

            {selectedCompany && (
                <ManagementDiscussionEmailModal
                    isOpen={isEmailModalOpen}
                    onClose={() => setIsEmailModalOpen(false)}
                    discussionData={formData}
                    company={selectedCompany}
                />
            )}
        </div>
    );
}
