'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Edit, Save } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { CkcMandateDetails } from '@/lib/definitions';


const fetcher = (url: string) => fetch(url).then(res => res.json());

const mandateSchema = z.object({
  industry: z.string().min(1, 'Industry is required'),
  subIndustry: z.string().min(1, 'Sub-Industry is required'),
  sector: z.string().min(1, 'Sector is required'),
});

type MandateFormValues = z.infer<typeof mandateSchema>;

const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="flex justify-between items-center py-2 px-3 border-b last:border-b-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium">{value || 'Prefilled'}</span>
  </div>
);

interface MandateDetailsFormProps {
    requestId: string;
}

export function MandateDetailsForm({ requestId }: MandateDetailsFormProps) {
  const { data, isLoading } = useSWR<CkcMandateDetails>(
    requestId ? `/api/ckc/requests/${requestId}/mandate-details` : null,
    fetcher
  );

  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const form = useForm<MandateFormValues>({
    resolver: zodResolver(mandateSchema),
    defaultValues: {
      industry: '',
      subIndustry: '',
      sector: '',
    },
  });

  useEffect(() => {
    if (data?.companyInfo) {
      form.reset({
        industry: data.companyInfo.industry,
        subIndustry: data.companyInfo.subIndustry,
        sector: data.companyInfo.sector,
      });
    }
  }, [data, form]);
  
  const handleSave = (formData: MandateFormValues) => {
    console.log("Saving mandate details:", formData);
    toast({
        title: "Information Saved",
        description: "Industry, Sub-Industry, and Sector have been updated."
    });
    setIsEditing(false);
  };

  if (isLoading || !data) {
    return (
        <div className="grid md:grid-cols-2 gap-6 pt-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    )
  }

  const { mandateInfo, companyInfo } = data;

  return (
    <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSave)}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <Card>
                    <CardHeader><CardTitle>Mandate Information</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <InfoRow label="Mandate ID" value={mandateInfo.mandateId} />
                        <InfoRow label="Mandate Type" value={mandateInfo.mandateType} />
                        <InfoRow label="Mandate Date" value={mandateInfo.mandateDate} />
                        <InfoRow label="Received Date" value={mandateInfo.receivedDate} />
                        <InfoRow label="Region / Branch" value={mandateInfo.regionBranch} />
                        <InfoRow label="BD Name" value={mandateInfo.bdName} />
                        <InfoRow label="Rating GH Name" value={mandateInfo.ratingGhName} />
                        <InfoRow label="Vertical" value={mandateInfo.vertical} />
                    </CardContent>
                </Card>
                 <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <InfoRow label="Address" value={companyInfo.address} />
                            <InfoRow label="City" value={companyInfo.city} />
                            <InfoRow label="Zipcode" value={companyInfo.zipcode} />
                            <InfoRow label="State" value={companyInfo.state} />
                            <InfoRow label="Country" value={companyInfo.country} />
                            <InfoRow label="Instrument" value={companyInfo.instrument} />
                            <InfoRow label="Instrument Size" value={companyInfo.instrumentSize} />
                             {isEditing ? (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="industry"
                                        render={({ field }) => (
                                            <FormItem className="grid grid-cols-2 items-center px-3 py-2 border-b">
                                                <span className="text-sm text-muted-foreground">Industry</span>
                                                 <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                                        <SelectItem value="Services">Services</SelectItem>
                                                        <SelectItem value="Finance">Finance</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="subIndustry"
                                        render={({ field }) => (
                                            <FormItem className="grid grid-cols-2 items-center px-3 py-2 border-b">
                                                <span className="text-sm text-muted-foreground">Sub-Industry</span>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Automotive">Automotive</SelectItem>
                                                        <SelectItem value="Chemicals">Chemicals</SelectItem>
                                                        <SelectItem value="IT Services">IT Services</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="sector"
                                        render={({ field }) => (
                                             <FormItem className="grid grid-cols-2 items-center px-3 py-2">
                                                <span className="text-sm text-muted-foreground">Sector</span>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Auto OEM">Auto OEM</SelectItem>
                                                        <SelectItem value="Petrochemicals">Petrochemicals</SelectItem>
                                                        <SelectItem value="Software Development">Software Development</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </>
                            ) : (
                                <>
                                    <InfoRow label="Industry" value={companyInfo.industry} />
                                    <InfoRow label="Sub-Industry" value={companyInfo.subIndustry} />
                                    <InfoRow label="Sector" value={companyInfo.sector} />
                                </>
                            )}
                        </CardContent>
                    </Card>
                     <div className="flex justify-end gap-2">
                        {isEditing ? (
                            <Button type="submit"><Save className="mr-2 h-4 w-4"/>Save</Button>
                        ) : (
                            <Button type="button" onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4"/>Edit</Button>
                        )}
                    </div>
                </div>
             </div>
        </form>
    </FormProvider>
  );
}