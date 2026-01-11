'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import useSWR from 'swr';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Save, Mail, File as FileIcon, ArrowLeft, Send, PlusCircle, Check, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/firebase';
import type { SitePlantVisit, SiteVisitPersonnel, CompanyDashboard, AppUser } from '@/lib/definitions';
import { getCompaniesByRole } from '@/lib/mock-data';
import { Skeleton } from '../ui/skeleton';
import { DocumentsModal } from './documents-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SitePlantVisitOtherDetails } from './site-plant-visit-other-details';
import { SitePlantVisitEmailModal } from './site-plant-visit-email-modal';
import { Label } from '@/components/ui/label';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const personnelSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  designation: z.string().min(1, 'Designation is required'),
});

const visitDetailsSchema = z.object({
  companyId: z.string().min(1, 'Company Name is required'),
  visitDate: z.date().nullable(),
  careTeam: z.array(z.string()).min(1, "At least one team member is required"),
  plantVisited: z.string().min(1, 'Plant visited is required'),
  locationDetails: z.string().min(1, "Location details are required."),
  personnel: z.array(personnelSchema).min(1, "At least one client personnel is required."),
});

const otherDetailsSchema = z.object({
  operationalStatus: z.string().optional(),
  deptProcesses: z.string().optional(),
  productsManufactured: z.string().optional(),
  capexCompleted: z.string().optional(),
  technologyAdopted: z.string().optional(),
  accreditations: z.string().optional(),
  rawMaterialStorage: z.string().optional(),
  rawMaterialDuration: z.string().optional(),
  finishedGoodsStorage: z.string().optional(),
  landAcquired: z.string().optional(),
  epcContractor: z.string().optional(),
  civilWorkStatus: z.string().optional(),
  civilWorkContractor: z.string().optional(),
  plantMachineryDetails: z.string().optional(),
  approvalsStatus: z.string().optional(),
  capexImplementationStatus: z.string().optional(),
  completionDate: z.string().optional(),
  labourRelations: z.string().optional(),
  labourUnion: z.string().optional(),
  workforceStrength: z.string().optional(),
  esicPfCompliance: z.string().optional(),
  anyOtherInfo: z.string().optional(),
});


const fullSchema = visitDetailsSchema.merge(otherDetailsSchema);
type FullFormValues = z.infer<typeof fullSchema>;

export default function SitePlantVisitClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const { data: company, isLoading: isCompanyLoading } = useSWR<CompanyDashboard>(selectedCompanyId ? `/api/companies/${selectedCompanyId}` : null, fetcher);
  const { data: visitData, isLoading: isDataLoading, mutate } = useSWR<SitePlantVisit>(
      selectedCompanyId ? `/api/discussions/site-visit/${selectedCompanyId}` : null,
      fetcher
  );

  const companies = getCompaniesByRole(user);

  const form = useForm<FullFormValues>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      companyId: '',
      visitDate: new Date(),
      careTeam: [],
      plantVisited: '',
      locationDetails: '',
      personnel: [],
    }
  });
  
  const { fields: personnelFields, append: appendPersonnel, remove: removePersonnel, update: updatePersonnel } = useFieldArray({ control: form.control, name: "personnel" });


  useEffect(() => {
    if (visitData) {
      form.reset({
        ...visitData,
        visitDate: visitData.visitDate ? new Date(visitData.visitDate) : null,
      });
    } else if (selectedCompanyId) {
       form.reset({
        companyId: selectedCompanyId,
        visitDate: new Date(),
        careTeam: [],
        plantVisited: '',
        locationDetails: '',
        personnel: [],
       })
    }
  }, [visitData, selectedCompanyId, form]);

  const handleSave = async (data: FullFormValues) => {
    if (!selectedCompanyId) return;
    
    try {
        await fetch(`/api/discussions/site-visit/${selectedCompanyId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        mutate();
        toast({ title: 'Success', description: 'Site/Plant visit details have been saved.' });
    } catch (e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save data.' });
    }
  };

  const isLoading = isAuthLoading || (selectedCompanyId && isDataLoading);
  
  const handleGo = () => {
    const companyId = form.getValues('companyId');
    if (companyId) {
        setSelectedCompanyId(companyId);
    }
  };

  return (
    <>
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Site / Plant Visit</h1>
        <Button variant="outline" onClick={() => setIsDocsModalOpen(true)}>
          <FileIcon className="mr-2 h-4 w-4" /> Documents
        </Button>
      </header>
       <FormProvider {...form}>
         <form onSubmit={form.handleSubmit(handleSave)}>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                      <FormItem className="flex-1">
                          <FormLabel>Company Name</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select a company" /></SelectTrigger></FormControl>
                              <SelectContent>
                                  {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          <FormMessage />
                      </FormItem>
                  )}
              />
              <Button type="button" className="self-end" onClick={handleGo} disabled={!form.getValues('companyId')}>Go</Button>
            </CardContent>
          </Card>

           {selectedCompanyId && (
              isLoading ? (
                <Skeleton className="h-96 w-full" />
              ) : (
                 <Tabs defaultValue="plant-visit-details">
                    <TabsList>
                        <TabsTrigger value="plant-visit-details">Plant Visit Details</TabsTrigger>
                        <TabsTrigger value="other-details">Other Details</TabsTrigger>
                    </TabsList>
                    <TabsContent value="plant-visit-details">
                        <Card>
                             <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                 <div className="space-y-4">
                                     <FormField control={form.control} name="visitDate" render={({ field }) => (<FormItem><FormLabel>Date of Plant Visit*</FormLabel><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Select Date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                                     <FormField control={form.control} name="careTeam" render={({ field }) => ( <FormItem><FormLabel>CARE Team*</FormLabel><Select onValueChange={field.onChange} value={Array.isArray(field.value) ? field.value[0] : ''}><SelectTrigger><SelectValue placeholder="Select Name" /></SelectTrigger><SelectContent><SelectItem value="Taha G">Taha G</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                                     <FormField control={form.control} name="plantVisited" render={({ field }) => ( <FormItem><FormLabel>Plant Visited*</FormLabel><Input {...field} /></FormItem>)}/>
                                     <FormField control={form.control} name="locationDetails" render={({ field }) => ( <FormItem><FormLabel>Location of the plant*</FormLabel><Input {...field} /></FormItem>)}/>
                                 </div>
                                  <div className="space-y-2">
                                     <Label>Client Personnel Interacted*</Label>
                                     <EditablePersonnelTable fields={personnelFields} append={appendPersonnel} remove={removePersonnel} update={updatePersonnel} />
                                 </div>
                             </CardContent>
                        </Card>
                    </TabsContent>
                     <TabsContent value="other-details">
                       <SitePlantVisitOtherDetails />
                    </TabsContent>
                 </Tabs>
              )
           )}
           
            <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => toast({title: "Placeholder"})}>SD Approval for Waiver</Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" onClick={() => setIsEmailModalOpen(true)}>Email to Client</Button>
                <Button type="button" onClick={() => toast({title: "Placeholder"})}>Mark as Complete</Button>
            </div>
         </form>
       </FormProvider>
    </div>
    <DocumentsModal isOpen={isDocsModalOpen} onClose={() => setIsDocsModalOpen(false)} title="Site/Plant Visit Documents" />
    {visitData && user && company && (
       <SitePlantVisitEmailModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} visitData={form.getValues()} company={company} analyst={user} />
    )}
    </>
  );
}


function EditablePersonnelTable({ fields, append, remove, update }: any) {
  const [newRow, setNewRow] = useState<Partial<SiteVisitPersonnel>>({});
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
    <div className="border rounded-md">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead className="w-24">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell>
                        <Input value={newRow.name || ''} onChange={e => setNewRow(p => ({...p, name: e.target.value}))} placeholder="Enter Name" />
                    </TableCell>
                    <TableCell>
                        <Input value={newRow.designation || ''} onChange={e => setNewRow(p => ({...p, designation: e.target.value}))} placeholder="Enter Designation" />
                    </TableCell>
                    <TableCell className="flex gap-1">
                        <Button variant="ghost" size="icon" type="button" onClick={editingIndex !== null ? handleUpdate : handleAddNew}><Check className="h-4 w-4 text-green-500" /></Button>
                        <Button variant="ghost" size="icon" type="button" onClick={() => {setEditingIndex(null); setNewRow({})}}><RefreshCw className="h-4 w-4 text-blue-500" /></Button>
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
