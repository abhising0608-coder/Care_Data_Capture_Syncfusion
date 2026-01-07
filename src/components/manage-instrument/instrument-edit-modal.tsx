
'use client';

import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from "date-fns";
import { Calendar as CalendarIcon, Save, Pencil, Trash } from "lucide-react";

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import type { RatingInstrument } from '@/lib/definitions';


const instrumentSchema = z.object({
  id: z.string(),
  mandateId: z.string(),
  ratingAnalyst: z.string().min(1, 'Rating Analyst is required'),
  groupHead: z.string().min(1, 'Group Head is required'),
  category: z.string(),
  subCategory: z.string().min(1, 'Sub Category is required'),
  instrument: z.string().min(1, 'Instrument is required'),
  complexityLevel: z.string().min(1, 'Complexity Level is required'),
  issuanceDate: z.date().nullable(),
  listedStatus: z.string().min(1, 'Listed Status is required'),
  maturityDate: z.date().nullable(),
  bdGroupHead: z.string().min(1, 'BD Group Head is required'),
  instrumentDetail: z.string().optional(),
  placedDate: z.date().nullable(),
  instrumentSize: z.number(),
  instrumentStatus: z.string(),
  couponRate: z.string().optional(),
  remarks: z.string().optional(),
}).refine(data => {
    if ((data.instrument === 'NCD' || data.instrument === 'Bond' || data.instrument === 'CP') && !data.couponRate) {
        return false;
    }
    return true;
}, {
    message: 'Coupon Rate is mandatory for NCD, Bond, and CP instruments.',
    path: ['couponRate']
}).refine(data => {
     if ((data.instrument === 'Term Loan' || data.instrument === 'NCD') && !data.maturityDate) {
        return false;
    }
    return true;
}, {
    message: 'Maturity Date is mandatory for Term Loan and NCD.',
    path: ['maturityDate']
});

type InstrumentFormValues = z.infer<typeof instrumentSchema>;

interface InstrumentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  instrument: RatingInstrument;
  onSave: (data: RatingInstrument) => void;
  allInstruments: RatingInstrument[];
}

export function InstrumentEditModal({
  isOpen,
  onClose,
  instrument,
  onSave,
  allInstruments,
}: InstrumentEditModalProps) {
    const form = useForm<InstrumentFormValues>({
        resolver: zodResolver(instrumentSchema),
        defaultValues: {
            ...instrument,
            issuanceDate: instrument.issuanceDate ? new Date(instrument.issuanceDate) : null,
            maturityDate: instrument.maturityDate ? new Date(instrument.maturityDate) : null,
            placedDate: instrument.placedDate ? new Date(instrument.placedDate) : null,
        },
    });

    useEffect(() => {
        form.reset({
            ...instrument,
            issuanceDate: instrument.issuanceDate ? new Date(instrument.issuanceDate) : null,
            maturityDate: instrument.maturityDate ? new Date(instrument.maturityDate) : null,
            placedDate: instrument.placedDate ? new Date(instrument.placedDate) : null,
        });
    }, [instrument, form]);

    const onSubmit = (data: InstrumentFormValues) => {
        onSave({
            ...instrument,
            ...data,
            issuanceDate: data.issuanceDate?.toISOString(),
            maturityDate: data.maturityDate?.toISOString(),
            placedDate: data.placedDate?.toISOString(),
        });
    };
    
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Instrument</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 p-4 border rounded-md">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <FormField name="mandateId" control={form.control} render={({ field }) => ( <FormItem><Label>Mandate ID</Label><Input {...field} readOnly disabled/></FormItem> )}/>
                        <FormField name="category" control={form.control} render={({ field }) => ( <FormItem><Label>Category</Label><Input {...field} readOnly disabled/></FormItem> )}/>
                        <FormField name="subCategory" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Sub Category *</FormLabel><Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Bank Facilities">Bank Facilities</SelectItem></SelectContent></Select><FormMessage/></FormItem> )}/>
                        <FormField name="instrument" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Instrument *</FormLabel><Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Term Loan">Term Loan</SelectItem><SelectItem value="NCD">NCD</SelectItem></SelectContent></Select><FormMessage/></FormItem> )}/>
                        <FormField name="complexityLevel" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Complexity Level *</FormLabel><Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Simple">Simple</SelectItem><SelectItem value="Complex">Complex</SelectItem><SelectItem value="Highly Complex">Highly Complex</SelectItem></SelectContent></Select><FormMessage/></FormItem> )}/>
                        <FormField name="issuanceDate" control={form.control} render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Issuance Date</FormLabel><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Select Date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                        <FormField name="listedStatus" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Listed Status *</FormLabel><Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Listed">Listed</SelectItem><SelectItem value="Unlisted">Unlisted</SelectItem></SelectContent></Select><FormMessage/></FormItem> )}/>
                        <FormField name="maturityDate" control={form.control} render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Maturity Date</FormLabel><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Select Date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                    </div>
                     {/* Right Column */}
                    <div className="space-y-4">
                         <FormField name="ratingAnalyst" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Rating Analyst *</FormLabel><Input {...field} readOnly disabled/></FormItem> )}/>
                         <FormField name="groupHead" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Group Head *</FormLabel><Input {...field} readOnly disabled/></FormItem> )}/>
                         <FormField name="bdGroupHead" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BD Group Head *</FormLabel><Input {...field} readOnly disabled/></FormItem> )}/>
                         <FormField name="instrumentDetail" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Instrument Detail</FormLabel><Input {...field}/></FormItem> )}/>
                         <FormField name="placedDate" control={form.control} render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Placed Date</FormLabel><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Select Date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                         <FormField name="instrumentSize" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Instrument Amount</FormLabel><Input {...field} type="number" readOnly disabled /></FormItem> )}/>
                         <FormField name="instrumentStatus" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Instrument Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Withdrawn">Withdrawn</SelectItem></SelectContent></Select><FormMessage/></FormItem> )}/>
                         <FormField name="couponRate" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Coupon Rate</FormLabel><Input {...field} /></FormItem> )}/>
                    </div>
                     {/* Full Width Remark */}
                     <div className="md:col-span-2">
                        <FormField name="remarks" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Remark</FormLabel><Textarea {...field}/></FormItem> )}/>
                     </div>
                 </div>

                <div className="space-y-2">
                     <h3 className="text-lg font-medium">Instrument Details</h3>
                     <div className="rounded-md border max-h-64 overflow-y-auto">
                        <Table>
                             <TableHeader className="sticky top-0 bg-card">
                                <TableRow>
                                    <TableHead>Category Name</TableHead>
                                    <TableHead>Instrument Amount</TableHead>
                                    <TableHead>Instrument Status</TableHead>
                                    <TableHead>Created by</TableHead>
                                    <TableHead>Created on</TableHead>
                                     <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allInstruments.map(inst => (
                                    <TableRow key={inst.id}>
                                        <TableCell>{inst.category}</TableCell>
                                        <TableCell>{inst.instrumentSize.toLocaleString()}</TableCell>
                                        <TableCell>{inst.instrumentStatus}</TableCell>
                                        <TableCell>System</TableCell>
                                        <TableCell>{new Date(inst.mandateDate).toLocaleString()}</TableCell>
                                        <TableCell>
                                             <Button variant="ghost" size="icon" disabled={inst.id === instrument.id} onClick={() => form.reset({...inst, issuanceDate: inst.issuanceDate ? new Date(inst.issuanceDate) : null, maturityDate: inst.maturityDate ? new Date(inst.maturityDate) : null, placedDate: inst.placedDate ? new Date(inst.placedDate) : null})}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" /> Save
                  </Button>
                </DialogFooter>
            </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
