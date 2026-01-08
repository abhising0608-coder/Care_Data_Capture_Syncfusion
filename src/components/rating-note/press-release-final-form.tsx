
'use client';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { Info, Save, ChevronDown, Send, Eye } from 'lucide-react';
import useSWR from 'swr';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { RatingNote, RatingInstrument, NoteStatus } from '@/lib/definitions';
import { Skeleton } from '../ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';


interface PressReleaseFinalFormProps {
  note: RatingNote;
  onAction: (action: string, payload?: any) => void;
}

const prSchema = z.object({
  annexureNote: z.string().optional(),
  unsupportedRatingNote: z.string().optional(),
  absenceDocsNote: z.string().optional(),
  rationaleDrivers: z.string().optional(),
});

type PRFormValues = z.infer<typeof prSchema>;
type Action = 'send-to-gh' | 'send-to-rh' | 'send-to-qc' | 'send-to-auditor' | 'send-to-editor' | 'send-to-client' | 'save-pr-draft' | 'preview';


const fetcher = (url: string) => fetch(url).then(res => res.json());

const getNextActions = (status: NoteStatus): Action[] => {
    switch (status) {
        case 'PR Generation Pending':
        case 'Draft':
        case 'Rework Requested (GH)':
        case 'Rework Requested (RH)':
        case 'Rework Requested (QC)':
        case 'Rework Requested (Auditor)':
        case 'Rework Requested (Editor)':
             return ['send-to-gh'];
        case 'GH Approved':
            return ['send-to-rh'];
        case 'RH Approved':
            return ['send-to-qc'];
        case 'QC Approved':
            return ['send-to-auditor', 'send-to-client'];
        case 'Auditor Approved':
             return ['send-to-editor', 'send-to-client'];
        case 'Editor Approved':
            return ['send-to-client'];
        default:
            return [];
    }
};

const actionDisplayNames: Record<Action, string> = {
    'save-pr-draft': 'Save Draft',
    'send-to-gh': 'Send to GH',
    'send-to-rh': 'Send to RH',
    'send-to-qc': 'Send to QC',
    'send-to-auditor': 'Send to Auditor',
    'send-to-editor': 'Send to Editor',
    'send-to-client': 'Send to Client',
    'preview': 'Save & Preview',
};


const InfoField = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-2 items-center gap-4">
        <Label className="text-right text-sm text-muted-foreground">{label}</Label>
        <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">{value || <span className="text-xs italic">N/A</span>}</div>
    </div>
);

export function PressReleaseFinalForm({ note, onAction }: PressReleaseFinalFormProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { data: instruments, isLoading } = useSWR<RatingInstrument[]>(
    note.companyId ? `/api/instruments/${note.companyId}` : null,
    fetcher
  );

  const form = useForm<PRFormValues>({
    resolver: zodResolver(prSchema),
    defaultValues: {
        annexureNote: note.prContent ? JSON.parse(note.prContent).annexureNote : '*Issuer did not cooperate; based on best available information.',
        unsupportedRatingNote: note.prContent ? JSON.parse(note.prContent).unsupportedRatingNote : 'Unsupported rating does not factor in the explicit credit enhancement.',
        absenceDocsNote: note.prContent ? JSON.parse(note.prContent).absenceDocsNote : 'Rating in the absence of the pending steps/documents',
        rationaleDrivers: note.prContent ? JSON.parse(note.prContent).rationaleDrivers : '',
    },
  });

  const handleCancelClick = () => {
    if (form.formState.isDirty) {
      setIsAlertOpen(true);
    } else {
      // onCancel();
    }
  };

  const handleFormSubmit = (action: Action) => {
    const formData = form.getValues();
    onAction(action, { prContent: JSON.stringify(formData) });
  };
  
  const nextActions = getNextActions(note.status);

  const MainTable = () => {
      if (isLoading) return <Skeleton className="w-full h-32" />
      return (
          <div className="rounded-md border">
              <Table>
                  <TableHeader className="bg-muted/50">
                      <TableRow>
                          <TableHead>Attribute ID</TableHead>
                          <TableHead>Facilities/Instruments</TableHead>
                          <TableHead className="text-right">Amount (in Crores)</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Rating Action</TableHead>
                      </TableRow>
                  </TableHeader>
                   <TableBody>
                        {instruments?.map(inst => (
                            <TableRow key={inst.id}>
                                <TableCell>{inst.instrumentId}</TableCell>
                                <TableCell>{inst.instrument}</TableCell>
                                <TableCell className="text-right">{(inst.instrumentSize / 100).toFixed(2)}</TableCell>
                                <TableCell>{inst.cycleHistory[0]?.rating || 'N/A'}</TableCell>
                                <TableCell>{inst.cycleHistory[0]?.ratingAction || 'N/A'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
              </Table>
          </div>
      )
  }

  return (
    <>
      <Card className="mt-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Prepare Press Release</CardTitle>
            <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => alert('Placeholder for Upload E-Sign')}>Upload E-sign</Button>
                <Button type="button" variant="outline" onClick={handleCancelClick}>Cancel</Button>
            </div>
          </div>
          
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="grid grid-cols-2 gap-4 p-4 border rounded-md">
                <InfoField label="Company Name" value={note.companyName} />
                <InfoField label="Date" value={format(new Date(), 'dd-MMM-yyyy')} />
                <InfoField label="Trust / SPV Name" value="N/A" />
                <InfoField label="Originator Name" value="N/A" />
           </div>

           <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">Main Table</h3>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                        <TooltipContent>Tooltip for Main Table</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
              </div>
              <MainTable />
           </div>

            <FormProvider {...form}>
                <form className="space-y-6">
                    <FormField
                        control={form.control}
                        name="annexureNote"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Details of Instruments/Facilities in Annexure-1</FormLabel>
                                <FormControl>
                                    <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div>
                        <h3 className="font-semibold mb-2">Unsupported Rating Table</h3>
                         <FormField
                            control={form.control}
                            name="unsupportedRatingNote"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <div>
                         <FormField
                            control={form.control}
                            name="absenceDocsNote"
                            render={({ field }) => (
                                <FormItem>
                                     <FormLabel>Rating in the Absence of the Pending Steps/Documents</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">Rationale and key rating drivers</h3>
                         <FormField
                            control={form.control}
                            name="rationaleDrivers"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea {...field} className="min-h-32" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => handleFormSubmit('save-pr-draft')}>
                            <Save className="mr-2 h-4 w-4" /> Save Draft
                        </Button>
                        <Button type="button" onClick={() => handleFormSubmit('preview')}>
                            <Eye className="mr-2 h-4 w-4" /> Save & Preview
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button>
                                    <Send className="mr-2 h-4 w-4" /> Send To <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {nextActions.map(action => (
                                    <DropdownMenuItem key={action} onClick={() => handleFormSubmit(action)}>
                                        {actionDisplayNames[action]}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </form>
            </FormProvider>

        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
            <AlertDialogDescription>
              Any unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, stay</AlertDialogCancel>
            <AlertDialogAction onClick={() => {}}>Yes, cancel</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
