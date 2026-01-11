

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm, FormProvider, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useSWR, { useSWRConfig } from 'swr';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Save, RefreshCw, Pencil, Trash2, Check, X, ArrowLeft, Copy, Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { RatingInstrument, ISINRecord, CompanyDashboard } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';


const fetcher = (url: string) => fetch(url).then(res => res.json());

const isinSchema = z.object({
    id: z.string(),
    isin: z.string().min(1, "ISIN is required"),
    type: z.enum(['Issued', 'Unissued']),
    status: z.enum(['Active', 'Closed', 'Delete']),
    issueType: z.enum(['Private', 'Public', 'Not Applicable']),
    listedOn: z.enum(['BSE', 'NSE', 'BSE/NSE']),
    issuanceDate: z.date().nullable(),
    couponRate: z.preprocess((val) => Number(String(val)), z.number().optional().nullable()),
    maturityDate: z.date().nullable(),
    redemptionDate: z.date().nullable(),
    issueAmount: z.preprocess((val) => Number(String(val)), z.number().optional().nullable()),
    outstandingAmount: z.preprocess((val) => Number(String(val)), z.number().optional().nullable()),
});

const formSchema = z.object({
  updateReason: z.string().optional(),
  isinRecords: z.array(isinSchema),
});

type IsinFormValues = z.infer<typeof formSchema>;

const InfoField = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="grid grid-cols-2 items-center">
        <Label className="text-muted-foreground">{label}</Label>
        <div>{value}</div>
    </div>
);


export default function IsinUpdatePage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const { mutate } = useSWRConfig();
    const [companyId, instrumentId, rcmId] = params.slug as string[];

    const { data: instrument, isLoading: isInstrumentLoading } = useSWR<RatingInstrument>(`/api/instruments/${instrumentId}`, fetcher);
    const { data: isinData, isLoading: isIsinLoading, mutate: mutateIsin } = useSWR<ISINRecord[]>(`/api/instruments/isin/${companyId}/${instrumentId}/${rcmId}`, fetcher);
    
    const form = useForm<IsinFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            updateReason: '',
            isinRecords: [],
        }
    });

    const { control, handleSubmit, reset } = form;
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "isinRecords",
    });
    
    useEffect(() => {
        if (isinData) {
            reset({
                updateReason: '', // or load from data if available
                isinRecords: isinData.map(d => ({
                    ...d,
                    issuanceDate: d.issuanceDate ? new Date(d.issuanceDate) : null,
                    maturityDate: d.maturityDate ? new Date(d.maturityDate) : null,
                    redemptionDate: d.redemptionDate ? new Date(d.redemptionDate) : null,
                }))
            });
        }
    }, [isinData, reset]);

    const handleSave = async (data: IsinFormValues) => {
       try {
           await fetch(`/api/instruments/isin/${companyId}/${instrumentId}/${rcmId}`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ isinRecords: data.isinRecords }),
           });
           mutateIsin();
           toast({ title: "Success", description: "ISIN records have been saved." });
           router.back();
       } catch (e) {
           toast({ variant: 'destructive', title: "Error", description: "Failed to save ISIN records." });
       }
    };
    
    const isLoading = isInstrumentLoading || isIsinLoading;

    if (isLoading) {
        return <div className="space-y-6"><Skeleton className="h-24 w-full" /><Skeleton className="h-64 w-full" /></div>;
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
                <header>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">ISIN Update</h1>
                </header>

                <Card>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InfoField label="Company" value={instrument?.client} />
                        <InfoField label="Mandate ID" value={instrument?.mandateId} />
                        <InfoField label="Instrument ID" value={instrument?.instrumentId} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Update Reason</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-4">
                             <FormField
                                control={control}
                                name="updateReason"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input {...field} placeholder="Enter reason for ISIN update" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="outline"><Copy className="mr-2 h-4 w-4" /> Copy from Previous Cycle</Button>
                        </div>
                    </CardContent>
                </Card>

                <IsinEditableTable 
                    fields={fields} 
                    append={append}
                    update={update}
                    remove={remove}
                />

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit"><Save className="mr-2 h-4 w-4" /> Save</Button>
                </div>
            </form>
        </FormProvider>
    );
}


interface IsinEditableTableProps {
    fields: any[];
    append: (data: any) => void;
    update: (index: number, data: any) => void;
    remove: (index: number) => void;
}

function IsinEditableTable({ fields, append, update, remove }: IsinEditableTableProps) {
    const [newRowData, setNewRowData] = useState<Partial<ISINRecord>>({});
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const headers = ["ISIN", "Date of Issuance", "Coupon Rate (%)", "Maturity Date", "Redemption Date", "Issue Amt.", "Outstanding Amt.", "Action"];

    const handleSaveRow = () => {
        if (editingIndex === null) return;
        update(editingIndex!, newRowData);
        setEditingIndex(null);
        setNewRowData({});
    };
    
    const handleAddNewRow = () => {
        append({ ...newRowData, id: uuidv4() });
        setNewRowData({});
    }

    const handleEditRow = (index: number) => {
        setNewRowData(fields[index]);
        setEditingIndex(index);
    }
    
    const renderCell = (field: any, header: string, index: number) => {
        const isEditing = editingIndex === index;
        const data = isEditing ? newRowData : field;
        const fieldName = header.toLowerCase().replace(/ /g, '').replace('(%)', 'rate').replace('ofissuance', 'issuanceDate');
        
        if (isEditing) {
            switch(header) {
                 case "Date of Issuance":
                 case "Maturity Date":
                 case "Redemption Date":
                    return <DateField value={data[fieldName]} onChange={(date: any) => setNewRowData(p => ({...p, [fieldName]: date}))} />;
                default:
                    return <Input value={data[fieldName] || ''} onChange={(e) => setNewRowData(p => ({...p, [fieldName]: e.target.value}))} />;
            }
        }
        
        switch(header) {
            case "Date of Issuance":
            case "Maturity Date":
            case "Redemption Date":
                return data[fieldName] ? format(new Date(data[fieldName]), "dd/MM/yyyy") : '';
            default:
                return data[fieldName];
        }
    };
    
    const renderNewRowCell = (header: string) => {
         const fieldName = header.toLowerCase().replace(/ /g, '').replace('(%)', 'rate').replace('ofissuance', 'issuanceDate');

         if (['Date of Issuance', 'Maturity Date', 'Redemption Date'].includes(header)) {
             return <DateField value={newRowData[fieldName as keyof typeof newRowData]} onChange={(date: any) => setNewRowData(p => ({...p, [fieldName as keyof typeof newRowData]: date}))} />
         }
        
         return <Input value={(newRowData as any)[fieldName] || ''} onChange={(e) => setNewRowData(p => ({...(p as any), [fieldName]: e.target.value}))} />;
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>ISIN Details</CardTitle>
                <Button type="button" variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Export</Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>{headers.map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                {headers.map(h => h !== 'Action' ? (
                                    <TableCell key={`new-${h}`}>{renderNewRowCell(h)}</TableCell>
                                ) : (
                                    <TableCell key="new-action" className="flex gap-1">
                                        <Button variant="ghost" size="icon" type="button" onClick={handleAddNewRow}><Check className="h-4 w-4 text-green-500" /></Button>
                                        <Button variant="ghost" size="icon" type="button" onClick={() => setNewRowData({})}><RefreshCw className="h-4 w-4 text-blue-500" /></Button>
                                    </TableCell>
                                ))}
                            </TableRow>
                             {fields.map((field, index) => (
                                <TableRow key={field.id}>
                                    {headers.map(h => <TableCell key={`${field.id}-${h}`}>{renderCell(field, h, index)}</TableCell>)}
                                    <TableCell className="flex gap-1">
                                        {editingIndex === index ? (
                                          <>
                                            <Button variant="ghost" size="icon" type="button" onClick={handleSaveRow}><Check className="h-4 w-4 text-green-500" /></Button>
                                            <Button variant="ghost" size="icon" type="button" onClick={() => setEditingIndex(null)}><X className="h-4 w-4 text-red-500" /></Button>
                                          </>
                                        ) : (
                                          <>
                                            <Button variant="ghost" size="icon" type="button" onClick={() => handleEditRow(index)}><Pencil className="h-4 w-4 text-blue-500" /></Button>
                                            <Button variant="ghost" size="icon" type="button" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                          </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

const DateField = ({ value, onChange }: { value: Date | null | undefined, onChange: (date: Date | undefined) => void}) => (
    <Popover>
        <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "dd/MM/yyyy") : <span>Pick a date</span>}
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={value || undefined} onSelect={onChange} initialFocus />
        </PopoverContent>
    </Popover>
);

    