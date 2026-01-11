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
import type { AuditCommitteeDiscussion, AuditCommitteePersonnel, AuditCommitteeMinute, CompanyDashboard, AppUser } from '@/lib/definitions';
import { getCompaniesByRole } from '@/lib/mock-data';
import { Skeleton } from '../ui/skeleton';
import { AuditCommitteeEmailModal } from './audit-committee-email-modal';


const fetcher = (url: string) => fetch(url).then(res => res.json());

const personnelSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
});

const minuteSchema = z.object({
  id: z.string(),
  srNo: z.number(),
  issue: z.string().min(1, 'Issue is required'),
  response: z.string().min(1, 'Response is required'),
});

const discussionSchema = z.object({
  companyId: z.string().min(1, 'Company Name is required'),
  interactionDate: z.date().nullable(),
  meetingLocation: z.string().optional(),
  careTeam: z.array(z.string()).optional(),
  personnel: z.array(personnelSchema).optional(),
  minutes: z.array(minuteSchema).optional(),
});

type DiscussionFormValues = z.infer<typeof discussionSchema>;

export default function AuditCommitteeClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const { data: company, isLoading: isCompanyLoading } = useSWR<CompanyDashboard>(selectedCompanyId ? `/api/companies/${selectedCompanyId}` : null, fetcher);
  const { data: discussionData, isLoading: isDataLoading, mutate } = useSWR<AuditCommitteeDiscussion>(
      selectedCompanyId ? `/api/discussions/audit-committee/${selectedCompanyId}` : null,
      fetcher
  );

  const companies = getCompaniesByRole(user);

  const form = useForm<DiscussionFormValues>({
    resolver: zodResolver(discussionSchema),
    defaultValues: {
      companyId: '',
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
        await fetch(`/api/discussions/audit-committee/${selectedCompanyId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        mutate();
        toast({ title: 'Success', description: 'Audit committee meeting minutes have been saved.' });
    } catch (e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save data.' });
    }
  };

  const isLoading = isAuthLoading || (selectedCompanyId && isDataLoading);

  return (
    <>
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Audit Committee Meeting</h1>
      </header>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <FormField
                            control={form.control}
                            name="companyId"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-[150px_1fr] items-center">
                                    <FormLabel>Select Company</FormLabel>
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
                            name="interactionDate"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-[150px_1fr] items-center">
                                    <FormLabel>Date of Interaction</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
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
                        <FormField control={form.control} name="meetingLocation" render={({ field }) => (<FormItem className="grid grid-cols-[150px_1fr] items-center"><FormLabel>Meeting Location</FormLabel><Input {...field} placeholder="Enter Location" /></FormItem>)}/>
                         <FormField
                            control={form.control}
                            name="careTeam"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-[150px_1fr] items-center">
                                    <FormLabel>CARE Team</FormLabel>
                                    <Select onValueChange={field.onChange} value={Array.isArray(field.value) ? field.value[0] : ''}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Name" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {/* In real app, this would be a multi-select or a tag input */}
                                            <SelectItem value="Taha G">Taha G</SelectItem>
                                            <SelectItem value="Group Head">Group Head</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Audit committee personnel interacted</CardTitle></CardHeader>
                    <CardContent>
                        <EditablePersonnelTable
                            fields={personnelFields}
                            append={appendPersonnel}
                            remove={removePersonnel}
                            update={updatePersonnel}
                        />
                    </CardContent>
                 </Card>
           </div>
           
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
                <Button type="button" variant="outline" onClick={() => setIsEmailModalOpen(true)}>Email to Client</Button>
                <Button type="button" variant="outline" onClick={() => toast({ title: 'Placeholder' })}>Send to GH</Button>
                <Button type="submit">Save</Button>
            </div>
        </form>
      </FormProvider>
    </div>
    {discussionData && company && user && (
         <AuditCommitteeEmailModal
            isOpen={isEmailModalOpen}
            onClose={() => setIsEmailModalOpen(false)}
            discussion={form.getValues()}
            company={company}
            analyst={user as AppUser}
        />
    )}
    </>
  );
}

function EditablePersonnelTable({ fields, append, remove, update }: any) {
  const [newRow, setNewRow] = useState<Partial<AuditCommitteePersonnel>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddNew = () => {
    if (!newRow.name) return;
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
    <Table>
        <TableBody>
             <TableRow>
                <TableCell>
                    <Input 
                        value={newRow.name || ''} 
                        onChange={e => setNewRow(p => ({...p, name: e.target.value}))} 
                        placeholder={editingIndex !== null ? '' : `Enter Name`}
                    />
                </TableCell>
                 <TableCell className="flex gap-1 w-24">
                     {editingIndex !== null ? (
                        <>
                            <Button variant="ghost" size="icon" type="button" onClick={handleUpdate}><Check className="h-4 w-4 text-green-500" /></Button>
                            <Button variant="ghost" size="icon" type="button" onClick={() => {setEditingIndex(null); setNewRow({})}}><X className="h-4 w-4 text-red-500" /></Button>
                        </>
                     ) : (
                         <>
                            <Button variant="ghost" size="icon" type="button" onClick={handleAddNew}><Check className="h-4 w-4 text-green-500" /></Button>
                            <Button variant="ghost" size="icon" type="button" onClick={() => setNewRow({})}><RefreshCw className="h-4 w-4 text-blue-500" /></Button>
                        </>
                     )}
                </TableCell>
            </TableRow>
            {fields.map((item: any, index: number) => (
                <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="flex gap-1 w-24">
                        <Button variant="ghost" size="icon" type="button" onClick={() => handleEdit(index)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" type="button" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
  )
}

function EditableMinutesTable({ fields, append, remove, update }: any) {
  const [newRow, setNewRow] = useState<Partial<AuditCommitteeMinute>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddNew = () => {
    if (!newRow.issue && !newRow.response) return;
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
                        <TableHead className="w-16">Sr. No</TableHead>
                        <TableHead>Issues Raised During Discussion</TableHead>
                        <TableHead>Audit committee's response</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                     <TableRow>
                        <TableCell><Input value={(editingIndex !== null ? newRow.srNo : fields.length + 1) || ''} readOnly disabled /></TableCell>
                        <TableCell>
                            <Input 
                                value={newRow.issue || ''} 
                                onChange={(e) => setNewRow(p => ({...p, issue: e.target.value}))} 
                                placeholder="Enter issue here"
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
                             {editingIndex !== null ? (
                                <>
                                    <Button variant="ghost" size="icon" type="button" onClick={handleUpdate}><Check className="h-4 w-4 text-green-500" /></Button>
                                    <Button variant="ghost" size="icon" type="button" onClick={() => {setEditingIndex(null); setNewRow({})}}><X className="h-4 w-4 text-red-500" /></Button>
                                </>
                             ) : (
                                 <>
                                    <Button variant="ghost" size="icon" type="button" onClick={handleAddNew}><Check className="h-4 w-4 text-green-500" /></Button>
                                    <Button variant="ghost" size="icon" type="button" onClick={() => setNewRow({})}><RefreshCw className="h-4 w-4 text-blue-500" /></Button>
                                </>
                             )}
                        </TableCell>
                    </TableRow>
                    {fields.map((item: any, index: number) => (
                        <TableRow key={item.id}>
                            <TableCell>{item.srNo}</TableCell>
                            <TableCell>{item.issue}</TableCell>
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
