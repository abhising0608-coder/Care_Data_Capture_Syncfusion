
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Calendar as CalendarIcon, Check, RefreshCw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { cn } from '@/lib/utils';

interface CreateBlankPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (periods: any[]) => void;
}

const periodSchema = z.object({
  docType: z.string().min(1, 'Document Type is required.'),
  period: z.date({ required_error: 'Period is required.' }),
});

type PeriodFormValues = z.infer<typeof periodSchema>;

export function CreateBlankPeriodModal({ isOpen, onClose, onSave }: CreateBlankPeriodModalProps) {
  const [addedPeriods, setAddedPeriods] = useState<any[]>([]);

  const form = useForm<PeriodFormValues>({
    resolver: zodResolver(periodSchema),
    defaultValues: {
      docType: '',
      period: new Date(new Date().getFullYear(), 2, 31), // Default to March 31st of current year
    },
  });

  const { control, handleSubmit, reset } = form;

  const handleAddPeriod = (data: PeriodFormValues) => {
    setAddedPeriods(prev => [...prev, { id: uuidv4(), ...data }]);
    reset({
      docType: '',
      period: new Date(new Date().getFullYear(), 2, 31),
    });
  };
  
  const handleDeletePeriod = (id: string) => {
    setAddedPeriods(prev => prev.filter(p => p.id !== id));
  };
  
  const handleSaveChanges = () => {
    onSave(addedPeriods);
    setAddedPeriods([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Blank Period</DialogTitle>
          <DialogDescription>Add periods for financial data entry.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form>
             <div className="grid grid-cols-1 gap-4 p-4 border rounded-md">
                <div className="grid grid-cols-3 gap-4 items-end">
                    <FormField
                        control={control}
                        name="docType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Document Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Audited">Audited</SelectItem>
                                        <SelectItem value="Provisional">Provisional</SelectItem>
                                        <SelectItem value="Projection">Projection</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="period"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Period</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? format(field.value, "dd-MM-yyyy") : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex gap-2">
                         <Button variant="ghost" size="icon" type="button" onClick={handleSubmit(handleAddPeriod)}><Check className="h-4 w-4 text-green-500" /></Button>
                         <Button variant="ghost" size="icon" type="button" onClick={() => reset()}><RefreshCw className="h-4 w-4 text-blue-500" /></Button>
                    </div>
                </div>
            </div>
          </form>
        </Form>
        
        {addedPeriods.length > 0 && (
            <div className="mt-4 rounded-md border max-h-48 overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Document Type</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead className="w-[50px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {addedPeriods.map(p => (
                            <TableRow key={p.id}>
                                <TableCell>{p.docType}</TableCell>
                                <TableCell>{format(p.period, 'dd-MM-yyyy')}</TableCell>
                                <TableCell>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                             <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This action cannot be undone. This will permanently delete the selected period.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeletePeriod(p.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleSaveChanges} disabled={addedPeriods.length === 0}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
