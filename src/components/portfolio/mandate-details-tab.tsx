
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Check, Edit, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { mockMandateData } from '@/lib/mock-data';
import type { Mandate } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const mandateSchema = z.object({
  financialYear: z.string().optional(),
  financialResult: z.string().optional(),
  quarterlyResult: z.string().optional(),
  yearEndDate: z.date().optional(),
});

interface MandateDetailsTabProps {
  ratingCycleId: string;
}

export function MandateDetailsTab({ ratingCycleId }: MandateDetailsTabProps) {
  const { toast } = useToast();
  const router = useRouter();
  // In a real app, you would fetch mandate data based on ratingCycleId
  const { data: mandates, isLoading } = useSWR<Mandate[]>('mandates', () => Promise.resolve(mockMandateData));

  const form = useForm<z.infer<typeof mandateSchema>>({
    resolver: zodResolver(mandateSchema),
    defaultValues: {
      financialYear: '',
      financialResult: '',
      quarterlyResult: '',
    },
  });

  const handleExecute = () => {
    toast({
      title: "Executing Workflow",
      description: "Redirecting to the activities page.",
    });
    router.push(`/portfolio/activities/${ratingCycleId}`);
  };

  return (
    <FormProvider {...form}>
      <form className="space-y-6">
        <div className="p-4 border rounded-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField name="financialYear" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Financial Year</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                        <SelectTrigger><SelectValue placeholder="- Select Financial Year -" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="2023-2024">2023-2024</SelectItem>
                        <SelectItem value="2024-2025">2024-2025</SelectItem>
                    </SelectContent>
                </Select>
            </FormItem>
          )} />
          <FormField name="financialResult" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Financial Result</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                        <SelectTrigger><SelectValue placeholder="- Select -" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="provisional">Provisional</SelectItem>
                        <SelectItem value="audited">Audited</SelectItem>
                        <SelectItem value="abridged">Abridged</SelectItem>
                        <SelectItem value="project_stage">Project stage</SelectItem>
                        <SelectItem value="not_required">Not required</SelectItem>
                    </SelectContent>
                </Select>
            </FormItem>
          )} />
          <FormField name="quarterlyResult" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Quarterly Result</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                        <SelectTrigger><SelectValue placeholder="- Select -" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="q1">Q1FY-Q1FY</SelectItem>
                        <SelectItem value="h1">H1FY-H1FY</SelectItem>
                        <SelectItem value="9m">9MFY-9MFY</SelectItem>
                        <SelectItem value="not_required">Not required</SelectItem>
                    </SelectContent>
                </Select>
            </FormItem>
          )} />
          <FormField name="yearEndDate" control={form.control} render={({ field }) => (
            <FormItem className="flex flex-col">
                <FormLabel>Year End Date</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                        <FormControl>
                            <Button variant="outline" className={cn("font-normal", !field.value && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, 'dd-MM-yyyy') : '- DD-MM-YYYY -'}
                            </Button>
                        </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent>
                </Popover>
            </FormItem>
          )} />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Mandate Details</h3>
            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs">A</div>
                    <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs">G</div>
                </div>
              <Button variant="link" className="text-xs p-0 h-auto">Collapse All</Button>
              <Button variant="link" className="text-xs p-0 h-auto">Expand All</Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-10"><Checkbox /></TableHead>
                  <TableHead>Mandate Id</TableHead>
                  <TableHead>Target Date</TableHead>
                  <TableHead>Primary Analyst</TableHead>
                  <TableHead>Rating Cycle</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
            <Accordion type="multiple" defaultValue={mandates?.map(m => m.mandateId)} className="w-full">
              {mandates?.map((mandate) => (
                <AccordionItem value={mandate.mandateId} key={mandate.mandateId} className="border-b">
                  <AccordionTrigger className="p-0 hover:no-underline">
                    <TableRow className="w-full hover:bg-transparent">
                      <TableCell className="w-10"><Checkbox defaultChecked={mandate.isSelected} /></TableCell>
                      <TableCell>{mandate.mandateId}</TableCell>
                      <TableCell><div className="flex items-center gap-2"><Input className="w-32" type="text" defaultValue={mandate.targetDate} /><CalendarIcon className="h-4 w-4 text-muted-foreground" /></div></TableCell>
                      <TableCell><Select defaultValue={mandate.primaryAnalyst}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Amit Varma">Amit Varma</SelectItem></SelectContent></Select></TableCell>
                      <TableCell><Select defaultValue={mandate.ratingCycle}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Initial">Initial</SelectItem><SelectItem value="Surveillance">Surveillance</SelectItem></SelectContent></Select></TableCell>
                    </TableRow>
                  </AccordionTrigger>
                  <AccordionContent className="bg-muted/20">
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10"></TableHead>
                                <TableHead>Instrument ID</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Sub Category</TableHead>
                                <TableHead>Instrument Name</TableHead>
                                <TableHead>Instrument Amt.</TableHead>
                                <TableHead>Enhance/Reduction</TableHead>
                                <TableHead>Total INS Amt. Size</TableHead>
                                <TableHead>Agenda Type</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {mandate.instruments.map((inst) => (
                                <TableRow key={inst.instrumentId}>
                                    <TableCell><Checkbox defaultChecked={inst.isSelected} /></TableCell>
                                    <TableCell>{inst.instrumentId}</TableCell>
                                    <TableCell>{inst.category}</TableCell>
                                    <TableCell>{inst.subCategory}</TableCell>
                                    <TableCell>{inst.instrumentName}</TableCell>
                                    <TableCell>{inst.instrumentAmt}</TableCell>
                                    <TableCell><Input type="number" defaultValue={inst.enhanceReduce} /></TableCell>
                                    <TableCell>{inst.totalInstrumentSize}</TableCell>
                                    <TableCell><Select defaultValue={inst.agendaType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Surveillance">Surveillance</SelectItem></SelectContent></Select></TableCell>
                                     <TableCell className="flex gap-1">
                                        <Button variant="ghost" size="icon"><Check className="h-4 w-4 text-green-500" /></Button>
                                        <Button variant="ghost" size="icon"><RefreshCw className="h-4 w-4 text-blue-500" /></Button>
                                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4 text-yellow-500" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="button" onClick={handleExecute}>Execute</Button>
        </div>
      </form>
    </FormProvider>
  );
}
