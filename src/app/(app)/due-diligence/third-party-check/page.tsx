'use client';

import { useState } from 'react';
import { useForm, FormProvider, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { format } from "date-fns";
import { Calendar as CalendarIcon, Save, Send, Mail, Check, Trash2, Pencil, RefreshCw, ArrowLeft, X } from "lucide-react";
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/auth-context';
import { getCompaniesByRole, mockUsers, mockThirdParties } from '@/lib/mock-data';
import type { ThirdPartyPersonnel, ThirdPartyMinute, CompanyDashboard, ThirdPartyCheck } from '@/lib/definitions';
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
import { ThirdPartyCheckEmailModal } from '@/components/due-diligence/third-party-check-email-modal';

const formSchema = z.object({
    companyId: z.string().min(1, 'Company is required'),
    organizationId: z.string().min(1, 'Organization is required'),
    interactionDate: z.date().optional().nullable(),
    location: z.string().optional(),
    careTeam: z.array(z.string()).optional(),
    thirdPartyPersonnel: z.array(z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
        designation: z.string().min(1, "Designation is required"),
    })).optional(),
    discussionMinutes: z.array(z.object({
        id: z.string(),
        query: z.string().min(1, "Query is required"),
        response: z.string().min(1, "Response is required"),
    })).optional(),
});

type ThirdPartyCheckFormValues = z.infer<typeof formSchema>;

interface ThirdPartyCheckPageProps {
  isEmbedded?: boolean;
}

export default function ThirdPartyCheckPage({ isEmbedded = false }: ThirdPartyCheckPageProps) {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    const companies = getCompaniesByRole(user);
    const careTeamMembers = Object.values(mockUsers).map(u => u.displayName || u.email);

    const form = useForm<ThirdPartyCheckFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            companyId: '',
            organizationId: '',
            interactionDate: null,
            location: '',
            careTeam: [],
            thirdPartyPersonnel: [],
            discussionMinutes: [],
        },
    });

    const { fields: personnelFields, append: appendPersonnel, remove: removePersonnel, update: updatePersonnel } = useFieldArray({
        control: form.control,
        name: "thirdPartyPersonnel",
    });

    const { fields: minuteFields, append: appendMinute, remove: removeMinute, update: updateMinute } = useFieldArray({
        control: form.control,
        name: "discussionMinutes",
    });
    
    const [editingPersonnelIndex, setEditingPersonnelIndex] = useState<number | null>(null);
    const [newPersonnel, setNewPersonnel] = useState<Partial<ThirdPartyPersonnel>>({});
    
    const [editingMinuteIndex, setEditingMinuteIndex] = useState<number | null>(null);
    const [newMinute, setNewMinute] = useState<Partial<ThirdPartyMinute>>({});
    
    const selectedOrgId = form.watch('organizationId');
    const thirdParties = mockThirdParties;
    const selectedThirdParty = thirdParties.find(tp => tp.id === selectedOrgId);
    const thirdPartyContacts = selectedThirdParty?.contacts || [];

    const handleSave = (data: ThirdPartyCheckFormValues) => {
        console.log("Saving draft:", data);
        toast({ title: 'Draft Saved', description: 'Your changes have been saved.' });
    };

    const handleMarkComplete = (data: ThirdPartyCheckFormValues) => {
        if (!data.interactionDate || !data.discussionMinutes?.length) {
            toast({ variant: 'destructive', title: 'Validation Error', description: 'Date of Interaction and at least one query/response are required to mark as complete.' });
            return;
        }
        console.log("Marking as complete:", data);
        toast({ title: 'Complete', description: 'Third-party check has been finalized and uploaded to DMS (simulated).' });
    };
    
    const handleEmail = () => {
        const companyId = form.getValues('companyId');
        if (!companyId || !selectedOrgId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a company and organization first.' });
            return;
        }
        setIsEmailModalOpen(true);
    };

    const renderEditablePersonnelTable = () => (
        <Card>
            <CardHeader><CardTitle>Third Party Personnel Interacted</CardTitle><CardDescription>Add the personnel who attended the meeting.</CardDescription></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Designation</TableHead><TableHead className="w-[120px]">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                         {personnelFields.map((field, index) => (
                             editingPersonnelIndex === index ? (
                                 <TableRow key={field.id}>
                                    <TableCell><Input value={newPersonnel.name || ''} readOnly disabled /></TableCell>
                                    <TableCell><Input value={newPersonnel.designation || ''} readOnly disabled /></TableCell>
                                     <TableCell className="flex gap-1">
                                        <Button size="icon" variant="ghost" onClick={() => { updatePersonnel(index, { ...field, ...newPersonnel }); setEditingPersonnelIndex(null); setNewPersonnel({}); }}><Check className="h-4 w-4 text-green-500" /></Button>
                                        <Button size="icon" variant="ghost" onClick={() => { setEditingPersonnelIndex(null); setNewPersonnel({}); }}><X className="h-4 w-4 text-red-500" /></Button>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <TableRow key={field.id}>
                                    <TableCell>{(field as any).name}</TableCell>
                                    <TableCell>{(field as any).designation}</TableCell>
                                    <TableCell className="flex gap-1">
                                        <Button size="icon" variant="ghost" onClick={() => { setEditingPersonnelIndex(index); setNewPersonnel(field as any); }}><Pencil className="h-4 w-4 text-blue-500" /></Button>
                                        <Button size="icon" variant="ghost" onClick={() => removePersonnel(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </TableCell>
                                </TableRow>
                            )
                        ))}
                         {editingPersonnelIndex === null && (
                            <TableRow>
                                <TableCell>
                                     <Select onValueChange={(val) => { const c = thirdPartyContacts.find(c=>c.name === val); if(c) setNewPersonnel({id: c.id, name: c.name, designation: c.designation})}}>
                                        <SelectTrigger><SelectValue placeholder="Select Personnel" /></SelectTrigger>
                                        <SelectContent>{thirdPartyContacts.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell><Input placeholder="Designation" value={newPersonnel.designation || ''} readOnly disabled/></TableCell>
                                <TableCell className="flex gap-1">
                                    <Button size="icon" variant="ghost" onClick={() => { appendPersonnel({ ...newPersonnel }); setNewPersonnel({}); }}><Check className="h-4 w-4 text-green-500" /></Button>
                                    <Button size="icon" variant="ghost" onClick={() => setNewPersonnel({})}><RefreshCw className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );

     const renderEditableMinutesTable = () => (
        <Card>
            <CardHeader><CardTitle>Minutes of Discussion</CardTitle><CardDescription>Capture key queries raised and the third-party’s response.</CardDescription></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Query</TableHead><TableHead>Response</TableHead><TableHead className="w-[120px]">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {minuteFields.map((field, index) => (
                             editingMinuteIndex === index ? (
                                 <TableRow key={field.id}>
                                    <TableCell><Textarea value={newMinute.query || ''} onChange={e => setNewMinute(prev => ({ ...prev, query: e.target.value }))} /></TableCell>
                                    <TableCell><Textarea value={newMinute.response || ''} onChange={e => setNewMinute(prev => ({ ...prev, response: e.target.value }))} /></TableCell>
                                     <TableCell className="flex gap-1">
                                        <Button size="icon" variant="ghost" onClick={() => { updateMinute(index, { ...field, ...newMinute }); setEditingMinuteIndex(null); setNewMinute({}); }}><Check className="h-4 w-4 text-green-500" /></Button>
                                        <Button size="icon" variant="ghost" onClick={() => { setEditingMinuteIndex(null); setNewMinute({}); }}><X className="h-4 w-4 text-red-500" /></Button>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <TableRow key={field.id}>
                                    <TableCell>{(field as any).query}</TableCell>
                                    <TableCell>{(field as any).response}</TableCell>
                                    <TableCell className="flex gap-1">
                                        <Button size="icon" variant="ghost" onClick={() => { setEditingMinuteIndex(index); setNewMinute(field as any); }}><Pencil className="h-4 w-4 text-blue-500" /></Button>
                                        <Button size="icon" variant="ghost" onClick={() => removeMinute(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </TableCell>
                                </TableRow>
                            )
                        ))}
                         {editingMinuteIndex === null && (
                            <TableRow>
                                <TableCell><Textarea placeholder="Query" value={newMinute.query || ''} onChange={e => setNewMinute(prev => ({ ...prev, query: e.target.value }))} /></TableCell>
                                <TableCell><Textarea placeholder="Response" value={newMinute.response || ''} onChange={e => setNewMinute(prev => ({ ...prev, response: e.target.value }))} /></TableCell>
                                <TableCell className="flex gap-1">
                                    <Button size="icon" variant="ghost" onClick={() => { appendMinute({ id: uuidv4(), ...newMinute }); setNewMinute({}); }}><Check className="h-4 w-4 text-green-500" /></Button>
                                    <Button size="icon" variant="ghost" onClick={() => setNewMinute({})}><RefreshCw className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );

    const formData = form.watch();
    const selectedCompany = companies.find(c => c.id === formData.companyId);

    return (
        <div className="space-y-6">
            {!isEmbedded && (
                <header>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Third Party Check</h1>
                    <p className="text-muted-foreground">Capture minutes of discussion with third parties.</p>
                </header>
            )}

            <FormProvider {...form}>
                <form>
                    <Card>
                        <CardHeader><CardTitle>Meeting Metadata</CardTitle></CardHeader>
                        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            <FormField name="organizationId" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Organization Name</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select an organization" /></SelectTrigger></FormControl>
                                        <SelectContent>{thirdParties.map(tp => <SelectItem key={tp.id} value={tp.id}>{tp.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField name="relationship" control={form.control} render={({ field }) => (<FormItem><FormLabel>Relationship with Rated Entity</FormLabel><FormControl><Input value={selectedThirdParty?.relationship || ''} readOnly disabled /></FormControl></FormItem>)} />
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

                    {renderEditablePersonnelTable()}
                    {renderEditableMinutesTable()}
                    
                    <div className="flex justify-end gap-4 mt-8">
                        <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                        <Button type="button" variant="outline" onClick={form.handleSubmit(handleSave)}><Save className="mr-2 h-4 w-4" />Save Draft</Button>
                        <Button type="button" variant="outline" onClick={() => toast({ title: 'Placeholder', description: 'Send to GH functionality to be implemented.'})}><Send className="mr-2 h-4 w-4" />Send to GH</Button>
                        <Button type="button" variant="outline" onClick={handleEmail}><Mail className="mr-2 h-4 w-4" />Email to Client</Button>
                        <Button type="button" onClick={form.handleSubmit(handleMarkComplete)}>Mark as Complete</Button>
                    </div>
                </form>
            </FormProvider>

            {selectedCompany && selectedThirdParty && (
                <ThirdPartyCheckEmailModal
                    isOpen={isEmailModalOpen}
                    onClose={() => setIsEmailModalOpen(false)}
                    checkData={formData}
                    company={selectedCompany}
                    thirdParty={selectedThirdParty}
                />
            )}
        </div>
    );
}
