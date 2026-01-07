
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm, FormProvider, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useSWR from 'swr';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import type { RatingInstrument, CompanyDashboard, BankerLenderDetail } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, Send, Copy, ArrowLeft, RefreshCw, Pencil, Trash2, Check, X } from 'lucide-react';
import { useMemo } from 'react';


const fetcher = (url: string) => fetch(url).then(res => res.json());

const bankerLenderDetailSchema = z.object({
    id: z.string(),
    bankName: z.string().min(1, 'Bank name is required.'),
    ratedAmount: z.preprocess((val) => Number(String(val)), z.number().min(0, "Rated amount must be positive")),
    currencyType: z.string().min(1, 'Currency is required.'),
    ratedAmountForeign: z.preprocess((val) => val ? Number(String(val)) : undefined, z.number().optional()),
    repaymentTerms: z.string().optional(),
    remarks: z.string().optional(),
    status: z.enum(['Pending', 'Verified by GH']),
});

const formSchema = z.object({
  details: z.array(bankerLenderDetailSchema),
});

type BankerLenderFormValues = z.infer<typeof formSchema>;

const InfoField = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="grid grid-cols-2 items-center gap-2">
        <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
        <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">{value || <span className="text-xs italic">N/A</span>}</div>
    </div>
);


export default function BankerLenderPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [companyId, instrumentId, rcmId] = params.slug as string[];

    const { data: company, isLoading: isCompanyLoading } = useSWR<CompanyDashboard>(`/api/companies/${companyId}`, fetcher);
    const { data: instrument, isLoading: isInstrumentLoading } = useSWR<RatingInstrument>(`/api/instruments/${instrumentId}`, fetcher);
    const { data: initialData, isLoading: isDataLoading } = useSWR<BankerLenderDetail[]>(`/api/instruments/banker-lender/${instrumentId}/${rcmId}`, fetcher);

    const form = useForm<BankerLenderFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            details: [],
        },
    });

    const { control, handleSubmit, reset } = form;
    const { fields, append, remove, update } = useFieldArray({ control, name: "details" });

     useMemo(() => {
        if (initialData) {
            reset({ details: initialData });
        }
    }, [initialData, reset]);

    const watchedDetails = useWatch({ control, name: 'details' });
    const grandTotal = useMemo(() => {
        return watchedDetails?.reduce((acc, curr) => acc + (curr.ratedAmount || 0), 0) || 0;
    }, [watchedDetails]);
    
    const handleSave = async (data: BankerLenderFormValues) => {
        const totalInstrumentAmount = (instrument?.instrumentSize || 0) / 100000; // Convert Lacs to Crores
        if (grandTotal !== totalInstrumentAmount) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: `The total rated amount (${grandTotal.toFixed(2)} Cr) must match the instrument amount (${totalInstrumentAmount.toFixed(2)} Cr).`,
            });
            return;
        }

       try {
           await fetch(`/api/instruments/banker-lender/${instrumentId}/${rcmId}`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ details: data.details }),
           });
           toast({ title: 'Success', description: 'Banker/Lender details have been saved.' });
           router.back();
       } catch (e) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save details.' });
       }
    };
    
    const isLoading = isCompanyLoading || isInstrumentLoading || isDataLoading;

    if (isLoading) {
        return <div className="p-6 space-y-6"><Skeleton className="h-48 w-full" /><Skeleton className="h-64 w-full" /></div>;
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
                <header>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Banker / Lender Details</h1>
                </header>

                <Card>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                        <InfoField label="Company" value={instrument?.client} />
                        <InfoField label="Mandate" value={instrument?.mandateId} />
                        <InfoField label="Tenure" value={instrument?.category} />
                        <InfoField label="Type of Facility" value={`${instrument?.category}, ${instrument?.subCategory}, ${instrument?.instrument}`} />
                        <InfoField label="Current Agenda Type" value={rcmId} />
                        <InfoField label="Amount (In Crore)" value={instrument ? (instrument.instrumentSize / 100000).toFixed(2) : 'N/A'} />
                    </CardContent>
                </Card>

                 <EditableBankerTable fields={fields} append={append} remove={remove} update={update} grandTotal={grandTotal} />

                <div className="flex justify-between items-center">
                    <Button type="button" variant="outline" onClick={() => toast({description: "Not Implemented"})}><Copy className="mr-2 h-4 w-4" /> Copy from Previous Cycle</Button>
                     <div className="flex gap-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Cancel</Button>
                        <Button type="button" variant="outline" onClick={() => toast({description: "Not Implemented"})}><Send className="mr-2 h-4 w-4" /> Send to GH</Button>
                        <Button type="submit"><Save className="mr-2 h-4 w-4" /> Save</Button>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}

function EditableBankerTable({ fields, append, remove, update, grandTotal }: any) {
    const { control } = useForm();
    const [newRowData, setNewRowData] = React.useState<Partial<BankerLenderDetail>>({
      bankName: '', ratedAmount: 0, currencyType: 'INR India', repaymentTerms: '', remarks: ''
    });
    
    const handleAddNew = () => {
      append({ id: uuidv4(), ...newRowData, status: 'Pending' });
      setNewRowData({ bankName: '', ratedAmount: 0, currencyType: 'INR India', repaymentTerms: '', remarks: '' });
    };

    const headers = ["Bank/ Lender Name", "Rated Amount", "Currency Type", "Rated Amount", "Repayment Terms", "Remarks", "Status", "Action"];

    return (
      <Card>
        <CardContent className="p-6">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>{headers.map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow>
                    </TableHeader>
                    <TableBody>
                         <TableRow>
                            <TableCell>
                               <Select onValueChange={(v) => setNewRowData(p => ({...p, bankName: v}))} value={newRowData.bankName}>
                                 <SelectTrigger><SelectValue placeholder="Select Banker" /></SelectTrigger>
                                 <SelectContent><SelectItem value="Kotak Mahindra Bank">Kotak Mahindra Bank</SelectItem><SelectItem value="Standard Chartered Bank">Standard Chartered Bank</SelectItem></SelectContent>
                               </Select>
                            </TableCell>
                            <TableCell><Input type="number" value={newRowData.ratedAmount} onChange={e => setNewRowData(p => ({...p, ratedAmount: parseFloat(e.target.value)}))} /></TableCell>
                             <TableCell>
                                <Select onValueChange={(v) => setNewRowData(p => ({...p, currencyType: v}))} value={newRowData.currencyType}>
                                 <SelectTrigger><SelectValue/></SelectTrigger>
                                 <SelectContent><SelectItem value="INR India">INR India</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent>
                               </Select>
                            </TableCell>
                            <TableCell><Input type="number" value={newRowData.ratedAmountForeign} onChange={e => setNewRowData(p => ({...p, ratedAmountForeign: parseFloat(e.target.value)}))} /></TableCell>
                            <TableCell><Input value={newRowData.repaymentTerms} onChange={e => setNewRowData(p => ({...p, repaymentTerms: e.target.value}))} /></TableCell>
                            <TableCell><Input value={newRowData.remarks} onChange={e => setNewRowData(p => ({...p, remarks: e.target.value}))} /></TableCell>
                            <TableCell />
                             <TableCell className="flex gap-1">
                                <Button variant="ghost" size="icon" type="button" onClick={handleAddNew}><Check className="h-4 w-4 text-green-500" /></Button>
                                <Button variant="ghost" size="icon" type="button" onClick={() => setNewRowData({})}><RefreshCw className="h-4 w-4" /></Button>
                            </TableCell>
                        </TableRow>
                         {fields.map((field: BankerLenderDetail, index: number) => (
                            <TableRow key={field.id}>
                                <TableCell>{field.bankName}</TableCell>
                                <TableCell className="text-right">{field.ratedAmount?.toFixed(2)}</TableCell>
                                <TableCell>{field.currencyType}</TableCell>
                                <TableCell className="text-right">{field.ratedAmountForeign?.toFixed(2) || '0.00'}</TableCell>
                                <TableCell>{field.repaymentTerms}</TableCell>
                                <TableCell>{field.remarks}</TableCell>
                                <TableCell><Badge variant={field.status === 'Verified by GH' ? 'default' : 'secondary'}>{field.status}</Badge></TableCell>
                                <TableCell className="flex gap-1">
                                    <Button variant="ghost" size="icon" type="button" disabled><Pencil className="h-4 w-4 text-muted-foreground" /></Button>
                                    <Button variant="ghost" size="icon" type="button" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                         <TableRow className="bg-muted/50 font-bold">
                            <TableCell>Grand Summaries</TableCell>
                            <TableCell className="text-right">{grandTotal.toFixed(2)}</TableCell>
                            <TableCell colSpan={6}></TableCell>
                         </TableRow>
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    );
}

