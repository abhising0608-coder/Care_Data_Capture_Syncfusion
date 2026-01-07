
'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { RatingNote } from '@/lib/definitions';


interface PressReleasePreparationProps {
  note: RatingNote;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const prepSchema = z.object({
  isProvisionalToFinal: z.string().min(1, 'This field is required.'),
  hasCpti: z.string().min(1, 'This field is required.'),
  hasEsgRisks: z.string().min(1, 'This field is required.'),
  hasReitDetails: z.string().min(1, 'This field is required.'),
});

type PrepFormValues = z.infer<typeof prepSchema>;

export function PressReleasePreparation({ note, onSubmit, onCancel }: PressReleasePreparationProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  
  const form = useForm<PrepFormValues>({
    resolver: zodResolver(prepSchema),
    defaultValues: {
      isProvisionalToFinal: '',
      hasCpti: '',
      hasEsgRisks: '',
      hasReitDetails: '',
    },
  });

  const handleCancelClick = () => {
    if (form.formState.isDirty) {
      setIsAlertOpen(true);
    } else {
      onCancel();
    }
  };

  return (
    <>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Prepare Press Release - {note.companyName}</CardTitle>
          <CardDescription>
            Select the following options to configure the correct press release template.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="border rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="isProvisionalToFinal"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-4 border-b md:border-b-0 md:border-r">
                        <FormLabel className="font-normal text-sm">Provisional to Final Rating</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} >
                          <FormControl>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hasEsgRisks"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-4 border-b md:border-b-0">
                        <FormLabel className="font-normal text-sm">Environment, Social, and Governance (ESG) Risks</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} >
                          <FormControl>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2">
                   <FormField
                    control={form.control}
                    name="hasCpti"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-4 border-b md:border-b-0 md:border-r">
                        <FormLabel className="font-normal text-sm">CPTI</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} >
                          <FormControl>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="hasReitDetails"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-4">
                        <FormLabel className="font-normal text-sm">Details about the REIT/InvIT</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} >
                          <FormControl>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={handleCancelClick}>Cancel</Button>
                <Button type="submit">Submit</Button>
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
                        Any changes you've made will be lost. You will be returned to the previous screen.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>No, stay</AlertDialogCancel>
                    <AlertDialogAction onClick={onCancel}>Yes, cancel</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}

