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
import type { ManagementDiscussion, ManagementPersonnel, DiscussionMinute } from '@/lib/definitions';
import { getCompaniesByRole } from '@/lib/mock-data';
import { Skeleton } from '../ui/skeleton';


const fetcher = (url: string) => fetch(url).then(res => res.json());

const personnelSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  designation: z.string().min(1, 'Designation is required'),
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

export default function ManagementDiscussionClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const { data: discussionData, isLoading: isDataLoading, mutate } = useSWR<ManagementDiscussion>(
      selectedCompanyId ? `/api/discussions/management/${selectedCompanyId}` : null,
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
        await fetch(`/api/discussions/management/${selectedCompanyId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        mutate();
        toast({ title: 'Success', description: 'Management discussion minutes have been saved.' });
    } catch (e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save data.' });
    }
  };

  const isLoading = isAuthLoading || (selectedCompanyId && isDataLoading);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Management Discussion</h1>
      </header>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
           <Card>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <FormField
                        control={form.control}
                        name="companyId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                 <Select onValueChange={(value) => { field.onChange(value); setSelectedCompanyId(value); }} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a company" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="interactionDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField control={form.control} name="meetingLocation" render={({ field }) => (<FormItem><FormLabel>Meeting Location</FormLabel><Input {...field} placeholder="Enter Location" /></FormItem>)}/>
                     <FormField
                        control={form.control}
                        name="careTeam"
                        render={({ field }) => (
                            <FormItem>
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

            {selectedCompanyId && (
              isLoading ? (
                <div className="space-y-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
              ) : (
                <>
                  <EditableTable
                      title="Add Management Personnel Interacted"
                      headers={['Name', 'Designation']}
                      fields={personnelFields}
                      append={appendPersonnel}
                      remove={removePersonnel}
                      update={updatePersonnel}
                  />
                   <EditableTable
                      title="Add Minutes"
                      headers={['Sr. No', 'Issues Raised During Discussion', 'Management’s Response']}
                      fields={minuteFields}
                      append={appendMinute}
                      remove={removeMinute}
                      update={updateMinute}
                      isMinutesTable={true}
                  />
                </>
              )
            )}

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => toast({ title: 'Placeholder' })}>Email to Client</Button>
                <Button type="button" variant="outline" onClick={() => toast({ title: 'Placeholder' })}>Send to GH</Button>
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>Back</Button>
            </div>
        </form>
      </FormProvider>
    </div>
  );
}

// Reusable Editable Table
interface EditableTableProps {
  title: string;
  headers: string[];
  fields: any[];
  append: (data: any) => void;
  remove: (index: number) => void;
  update: (index: number, data: any) => void;
  isMinutesTable?: boolean;
}

function EditableTable({ title, headers, fields, append, remove, update, isMinutesTable = false }: EditableTableProps) {
  const [newRow, setNewRow] = useState<any>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const keyMap = isMinutesTable ? ['srNo', 'issue', 'response'] : ['name', 'designation'];

  const handleAddNew = () => {
    const dataToAppend = isMinutesTable ? { ...newRow, id: uuidv4(), srNo: fields.length + 1 } : { ...newRow, id: uuidv4() };
    append(dataToAppend);
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

  const handleCancel = () => {
    setEditingIndex(null);
    setNewRow({});
  }

  return (
     <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        {headers.map(h => <TableHead key={h}>{h}</TableHead>)}
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                     <TableRow>
                        {headers.map((h, i) => (
                           <TableCell key={`new-${i}`}>
                                {keyMap[i] === 'srNo' ? (
                                    <Input value={fields.length + 1} readOnly disabled />
                                ) : (
                                    <Input 
                                        value={newRow[keyMap[i]] || ''}
                                        onChange={(e) => setNewRow(p => ({...p, [keyMap[i]]: e.target.value}))}
                                        placeholder={editingIndex !== null ? '' : `Enter ${h.toLowerCase()}`}
                                    />
                                )}
                            </TableCell>
                        ))}
                         <TableCell className="flex gap-1">
                             {editingIndex !== null ? (
                                <>
                                    <Button variant="ghost" size="icon" type="button" onClick={handleUpdate}><Check className="h-4 w-4 text-green-500" /></Button>
                                    <Button variant="ghost" size="icon" type="button" onClick={handleCancel}><X className="h-4 w-4 text-red-500" /></Button>
                                </>
                             ) : (
                                 <>
                                    <Button variant="ghost" size="icon" type="button" onClick={handleAddNew}><Check className="h-4 w-4 text-green-500" /></Button>
                                    <Button variant="ghost" size="icon" type="button" onClick={() => setNewRow({})}><RefreshCw className="h-4 w-4 text-blue-500" /></Button>
                                </>
                             )}
                        </TableCell>
                    </TableRow>
                    {fields.map((item, index) => (
                        <TableRow key={item.id}>
                            {keyMap.map(key => <TableCell key={`${item.id}-${key}`}>{item[key]}</TableCell>)}
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