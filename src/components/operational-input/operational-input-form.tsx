'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import type { CKCRequest } from '@/lib/definitions';
import { Skeleton } from '../ui/skeleton';

const formSchema = z.object({
  companyName: z.string().min(1, 'Company Name is required.'),
  approach: z.string().min(1, 'Approach is required.'),
  period: z.string().min(1, 'Period is required.'),
  amountScale: z.string().min(1, 'Amount Scale is required.'),
  currency: z.string().min(1, 'Currency is required.'),
});

type OperationalInputFormValues = z.infer<typeof formSchema>;

const currentYear = new Date().getFullYear();
const financialYears = Array.from({ length: 10 }, (_, i) => `${currentYear - i -1}-${(currentYear - i).toString().slice(2)}`);

export function OperationalInputForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('requestId');
  const firestore = useFirestore();

  const [prefilledData, setPrefilledData] = useState<{ companyName: string; approach: string; } | null>(null);

  const requestQuery = useMemoFirebase(() => {
    if (!firestore || !requestId) return null;
    return query(collection(firestore, 'ckc_operational_requests'), where('id', '==', requestId));
  }, [firestore, requestId]);

  const { data: requestData, isLoading: isRequestLoading } = useCollection<CKCRequest>(requestQuery);

  const form = useForm<OperationalInputFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      approach: 'Standalone',
      period: '',
      amountScale: 'Lakhs',
      currency: 'INR',
    },
  });

  useEffect(() => {
    if (requestData && requestData.length > 0) {
      const request = requestData[0];
      const data = {
        companyName: request.companyName,
        approach: request.resultType,
      };
      setPrefilledData(data);
      form.reset({
        companyName: data.companyName,
        approach: data.approach,
        period: '',
        amountScale: 'Lakhs',
        currency: 'INR',
      });
    }
  }, [requestData, form]);

  const onSubmit = (data: OperationalInputFormValues) => {
    console.log('Form Submitted:', data);
    // Here you would save to Firestore in a real scenario
    toast({
      title: 'Configuration Saved',
      description: 'Redirecting to the Basic Info screen...',
    });
    // Placeholder for redirection
    router.push('/operational-input/basic-info');
  };
  
  if (isRequestLoading && requestId) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Initiate Data Entry</CardTitle>
        <CardDescription>
          Select the company and parameters to begin operational data entry.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                        {requestId ? (
                             <Input {...field} readOnly placeholder="Loading company name..." />
                        ) : (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a company" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* In a real app, this would be populated from a Company Master collection */}
                                    <SelectItem value="Reliance Industries">Reliance Industries</SelectItem>
                                    <SelectItem value="Tata Consultancy Services">Tata Consultancy Services</SelectItem>
                                    <SelectItem value="HDFC Bank">HDFC Bank</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="approach"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approach</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an approach" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Standalone">Standalone</SelectItem>
                        <SelectItem value="Consolidated">Consolidated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select financial year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {financialYears.map(fy => (
                            <SelectItem key={fy} value={fy}>{fy}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amountScale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount Scale</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select amount scale" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Hundreds">Hundreds</SelectItem>
                        <SelectItem value="Thousands">Thousands</SelectItem>
                        <SelectItem value="Lakhs">Lakhs</SelectItem>
                        <SelectItem value="Millions">Millions</SelectItem>
                        <SelectItem value="Crores">Crores</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="CAD">CAD ($)</SelectItem>
                        <SelectItem value="SGD">SGD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
