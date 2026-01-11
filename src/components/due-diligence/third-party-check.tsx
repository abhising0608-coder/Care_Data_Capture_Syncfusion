'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import useSWR from 'swr';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Save, Mail, FileText, ArrowLeft, Send, PlusCircle, Check, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/firebase';
import type { ThirdPartyDiscussion, ThirdPartyPersonnel, ThirdPartyMinute, CompanyDashboard, AppUser } from '@/lib/definitions';
import { getCompaniesByRole } from '@/lib/mock-data';
import { Skeleton } from '../ui/skeleton';
import { ThirdPartyEmailModal } from './third-party-email-modal';


const fetcher = (url: string) => fetch(url).then(res => res.json());

const personnelSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  designation: z.string().min(1, 'Designation is required'),
});

const minuteSchema = z.object({
  id: z.string(),
  srNo: z.number(),
  query: z.string().min(1, 'Query is required'),
  response: z.string().min(1, 'Response is required'),
});

const discussionSchema = z.object({
  companyId: z.string().min(1, 'Company Name is required'),
  organizationName: z.string().min(1, 'Organization Name is required'),
  interactionDate: z.date().nullable(),
  meetingLocation: z.string().optional(),
  careTeam: z.array(z.string()).optional(),
  personnel: z.array(personnelSchema).optional(),
  minutes: z.array(minuteSchema).optional(),
});

type DiscussionFormValues = z.infer<typeof discussionSchema>;

export default function ThirdPartyCheckClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const { data: company, isLoading: isCompanyLoading } = useSWR<CompanyDashboard>(selectedCompanyId ? `/api/companies/${selectedCompanyId}` : null, fetcher);
  const { data: discussionData, isLoading: isDataLoading, mutate } = useSWR<ThirdPartyDiscussion>(
      selectedCompanyId ? `/api/discussions/third-party/${selectedCompanyId}` : null,
      fetcher
  );

  const companies = getCompaniesByRole(user);

  const form = useForm<DiscussionFormValues>({
    resolver: zodResolver(discussionSchema),
    defaultValues: {
      companyId: '',
      organizationName: '',
      interactionDate: new Date(),
      meetingLocation: '',
      careTeam: [],
      personnel: [],
      minutes: [],
    }
  });

  useEffect(() => {
    if (discussionData) {
      form.reset({
        ...discussionData,
        interactionDate: discussionData.interactionDate ? new Date(discussionData.interactionDate) : null,
      });
    } else if (selectedCompanyId) {
       form.reset({
        companyId: selectedCompanyId,
        organizationName: '',
        interactionDate: new Date(),
        meetingLocation: '',
        careTeam: [],
        personnel: [],
        minutes: [],
       })
    }
  }, [discussionData, selectedCompanyId, form]);
  
  const { fields: personnelFields, append: appendPersonnel, remove: removePersonnel, update: updatePersonnel } = useFieldArray({ control: form.control, name: "personnel" });
  const { fields: minuteFields, append: appendMinute, remove: removeMinute, update: updateMinute } = useFieldArray({ control: form.control, name: "minutes" });


  const handleSave = async (data: DiscussionFormValues) => {
    if (!selectedCompanyId) return;
    
    try {
        await fetch(`/api/discussions/third-party/${selectedCompanyId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        mutate();
        toast({ title: 'Success', description: 'Third-party check minutes have been saved.' });
    } catch (e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save data.' });
    }
  };

  const isLoading = isAuthLoading || (selectedCompanyId && isDataLoading);
  const relationship = discussionData?.relationship || 'Prefilled from master';

  return (
    <>
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Third Party</h1>
      </header>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
           <Card>
                <CardContent className="p-0 border rounded-lg">
                     <div className="grid grid-cols-2">
                        <div className="p-4 space-y-4 border-r">
                             <FormField
                                control={form.control}
                                name="companyId"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-2 items-center">
                                        <FormLabel>Company Name</FormLabel>
                                        <Select onValueChange={(value) => { field.onChange(value); setSelectedCompanyId(value); }} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                              <FormField
                                control={form.control}
                                name="organizationName"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-2 items-center">
                                        <FormLabel>Organization Name</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="CRISIL">CRISIL</SelectItem>
                                                <SelectItem value="ICRA">ICRA</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                              <FormField
                                control={form.control}
                                name="interactionDate"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-2 items-center">
                                        <FormLabel>Date of Interaction</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                        {field.value ? format(field.value, "PPP") : <span>Select Date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                                            </PopoverContent>
                                        </Popover>
                                    </FormItem>
                                )}
                            />
                            <FormItem className="grid grid-cols-2 items-center">
                                <FormLabel>Meeting Location</FormLabel>
                                <FormField control={form.control} name="meetingLocation" render={({ field }) => ( <Input {...field} placeholder="Enter Location" /> )}/>
                            </FormItem>
                             <FormItem className="grid grid-cols-2 items-center">
                                <FormLabel>Relationship with the Rated Entity</FormLabel>
                                <Input value={relationship} readOnly disabled />
                            </FormItem>
                            <FormField
                                control={form.control}
                                name="careTeam"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-2 items-center">
                                        <FormLabel>CARE Team</FormLabel>
                                        <Select onValueChange={field.onChange} value={Array.isArray(field.value) ? field.value[0] : ''}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Name" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Taha G">Taha G</SelectItem>
                                                <SelectItem value="Group Head">Group Head</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>
                         <div className="p-4">
                            <EditablePersonnelTable
                                fields={personnelFields}
                                append={appendPersonnel}
                                remove={removePersonnel}
                                update={updatePersonnel}
                            />
                        </div>
                     </div>
                </CardContent>
            </Card>

            {selectedCompanyId && (
              isLoading ? (
                <div className="space-y-6">
                    <Skeleton className="h-48 w-full" />
                </div>
              ) : (
                <EditableMinutesTable
                    fields={minuteFields}
                    append={appendMinute}
                    remove={removeMinute}
                    update={updateMinute}
                />
              )
            )}

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEmailModalOpen(true)} disabled={!discussionData}>Email to Client</Button>
                <Button type="button" variant="outline" onClick={() => toast({ title: 'Placeholder' })}>Send to GH</Button>
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>Back</Button>
            </div>
        </form>
      </FormProvider>
    </div>
    {discussionData && user && (
        <ThirdPartyEmailModal
            isOpen={isEmailModalOpen}
            onClose={() => setIsEmailModalOpen(false)}
            discussion={form.getValues()}
            company={company || null}
            analyst={user as AppUser}
        />
    )}
    </>
  );
}

function EditablePersonnelTable({ fields, append, remove, update }: any) {
  const [newRow, setNewRow] = useState<Partial<ThirdPartyPersonnel>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddNew = () => {
    if (!newRow.name && !newRow.designation) return;
    append({ ...newRow, id: uuidv4() });
    setNewRow({});
  };

  const handleUpdate = () => {
    if (editingIndex === null) return;
    update(editingIndex, { ...fields[editingIndex], ...newRow });
    setEditingIndex(null);
    setNewRow({});
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setNewRow(fields[index]);
  }

  return (
     <div>
        <h3 className="font-semibold mb-2">Add Management Personnel Interacted</h3>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Designation</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell>
                        <Input 
                            value={newRow.name || ''} 
                            onChange={e => setNewRow(p => ({...p, name: e.target.value}))} 
                            placeholder="John Doe"
                        />
                    </TableCell>
                    <TableCell>
                         <Input 
                            value={newRow.designation || ''} 
                            onChange={e => setNewRow(p => ({...p, designation: e.target.value}))}
                             placeholder="Assistance Manager"
                        />
                    </TableCell>
                    <TableCell className="flex gap-1">
                        <Button variant="ghost" size="icon" type="button" onClick={editingIndex !== null ? handleUpdate : handleAddNew}><Check className="h-4 w-4 text-green-500" /></Button>
                        <Button variant="ghost" size="icon" type="button" onClick={() => { setEditingIndex(null); setNewRow({}); }}><RefreshCw className="h-4 w-4 text-blue-500" /></Button>
                    </TableCell>
                </TableRow>
                {fields.map((item: any, index: number) => (
                    <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.designation}</TableCell>
                        <TableCell className="flex gap-1">
                            <Button variant="ghost" size="icon" type="button" onClick={() => handleEdit(index)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" type="button" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
     </div>
  )
}

function EditableMinutesTable({ fields, append, remove, update }: any) {
  const [newRow, setNewRow] = useState<Partial<ThirdPartyMinute>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddNew = () => {
    if (!newRow.query && !newRow.response) return;
    append({ ...newRow, id: uuidv4(), srNo: fields.length + 1 });
    setNewRow({});
  };

  const handleUpdate = () => {
    if (editingIndex === null) return;
    update(editingIndex, { ...fields[editingIndex], ...newRow });
    setEditingIndex(null);
    setNewRow({});
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setNewRow(fields[index]);
  }

  return (
     <Card>
        <CardHeader><CardTitle>Add Minutes</CardTitle></CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Sr. No</TableHead>
                        <TableHead>Query</TableHead>
                        <TableHead>Response</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                     <TableRow>
                        <TableCell><Input value={fields.length + 1} readOnly disabled /></TableCell>
                        <TableCell>
                            <Input 
                                value={newRow.query || ''} 
                                onChange={(e) => setNewRow(p => ({...p, query: e.target.value}))} 
                                placeholder="Enter query here"
                            />
                        </TableCell>
                        <TableCell>
                             <Input 
                                value={newRow.response || ''} 
                                onChange={(e) => setNewRow(p => ({...p, response: e.target.value}))} 
                                placeholder="Enter response here"
                            />
                        </TableCell>
                        <TableCell className="flex gap-1">
                             <Button variant="ghost" size="icon" type="button" onClick={editingIndex !== null ? handleUpdate : handleAddNew}><Check className="h-4 w-4 text-green-500" /></Button>
                            <Button variant="ghost" size="icon" type="button" onClick={() => { setEditingIndex(null); setNewRow({}); }}><RefreshCw className="h-4 w-4 text-blue-500" /></Button>
                        </TableCell>
                    </TableRow>
                    {fields.map((item: any, index: number) => (
                        <TableRow key={item.id}>
                            <TableCell>{item.srNo}</TableCell>
                            <TableCell>{item.query}</TableCell>
                            <TableCell>{item.response}</TableCell>
                            <TableCell className="flex gap-1">
                                <Button variant="ghost" size="icon" type="button" onClick={() => handleEdit(index)}><Pencil className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" type="button" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}
