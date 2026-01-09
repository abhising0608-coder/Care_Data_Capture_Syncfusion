'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useForm, FormProvider, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormField, FormItem } from '@/components/ui/form';
import type { CKCRequest, CKCRequestDocument } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { mockUsers } from '@/lib/mock-data';


const fetcher = (url: string) => fetch(url).then(res => res.json());

const documentSchema = z.object({
  id: z.string(),
  docType: z.string(),
  year: z.string(),
  fileName: z.string(),
  valid: z.enum(['Yes', 'No']),
});

const requestDetailsSchema = z.object({
  makerId: z.string().optional(),
  checkerId: z.string().optional(),
  allowEditingPreviousYear: z.enum(['Yes', 'No']),
  documents: z.array(documentSchema),
});

type RequestDetailsFormValues = z.infer<typeof requestDetailsSchema>;

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-[150px_1fr] items-start p-3 border-b last:border-b-0">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">{value}</span>
    </div>
);

export default function CKCRequestDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const requestId = params.id as string;

    const { data: request, isLoading, error } = useSWR<CKCRequest>(
        requestId ? `/api/ckc/requests/${requestId}` : null,
        fetcher
    );

    const form = useForm<RequestDetailsFormValues>({
        resolver: zodResolver(requestDetailsSchema),
        defaultValues: {
            allowEditingPreviousYear: 'Yes',
            documents: [],
        },
    });
    
    if (request && form.getValues('documents').length === 0) {
        form.reset({
            ...form.getValues(),
            documents: request.documents,
        });
    }

    const { fields } = useFieldArray({
        control: form.control,
        name: "documents"
    });

    const makers = mockUsers ? Object.values(mockUsers).filter(u => u.role === 'CKC_ANALYST') : [];
    const checkers = mockUsers ? Object.values(mockUsers).filter(u => u.role === 'CKC_CHECKER') : [];

    const handleSubmit = (data: RequestDetailsFormValues) => {
        console.log("Submitted with data:", data);
        toast({
            title: 'Request Assigned',
            description: `Request ${request?.id} has been assigned.`,
        });
        router.push('/ckc/requests');
    };

    
    if (isLoading || !request) {
        return <div className="p-6"><Skeleton className="h-[70vh] w-full" /></div>
    }

    if (error) {
        return <div className="p-6 text-destructive">Failed to load request details.</div>
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                 <div className="space-y-6">
                    <header>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Request Form</h1>
                    </header>
                    <Tabs defaultValue="request-form" className="w-full">
                        <TabsList>
                            <TabsTrigger value="mandate-details">Mandate Details</TabsTrigger>
                            <TabsTrigger value="request-form">Request Form</TabsTrigger>
                            <TabsTrigger value="documents">Documents</TabsTrigger>
                            <TabsTrigger value="correction">Correction</TabsTrigger>
                        </TabsList>
                        <TabsContent value="request-form" className="space-y-6">
                             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>{request.companyName}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                                <InfoRow label="Company ID" value={request.companyId} />
                                                <InfoRow label="Rating Analyst" value={request.analystName || 'N/A'} />
                                                <InfoRow label="Group Head" value={request.groupHead || 'N/A'} />
                                                <InfoRow label="Name of HO / RO" value={request.hoRoName || 'N/A'} />
                                                <InfoRow label="Rating Cycle" value={request.cycle} />
                                                <InfoRow label="Initiator Name" value={request.createdBy} />
                                                <InfoRow label="Document Status" value="Prefilled" />
                                                <InfoRow label="Comments" value="Nam semper, velit non interdum tristique, risus lectus lacinia ligula, id ultrices arcu nisl vitae elit. Duis a turpis nibh." />
                                        </CardContent>
                                    </Card>
                                </div>
                                 {/* Right Column */}
                                 <div>
                                     <Card>
                                        <CardHeader>
                                            <CardTitle>Documents</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Document Type</TableHead>
                                                        <TableHead>Selected Years</TableHead>
                                                        <TableHead>Documents</TableHead>
                                                        <TableHead className="w-[100px]">Is Valid</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {fields.map((doc, index) => (
                                                        <TableRow key={doc.id}>
                                                            <TableCell>{doc.docType}</TableCell>
                                                            <TableCell>{doc.year}</TableCell>
                                                            <TableCell>
                                                                <Button variant="link" className="p-0 h-auto">
                                                                    <Download className="mr-2 h-4 w-4" />
                                                                    {doc.fileName}
                                                                </Button>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Controller
                                                                    control={form.control}
                                                                    name={`documents.${index}.valid`}
                                                                    render={({ field }) => (
                                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                                            <SelectTrigger>
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="Yes">Yes</SelectItem>
                                                                                <SelectItem value="No">No</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    )}
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                 </div>
                             </div>
                              <Card>
                                <CardHeader>
                                    <CardTitle>Assign Case</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                        <FormField
                                            control={form.control}
                                            name="makerId"
                                            render={({ field }) => (
                                                <FormItem className="grid grid-cols-3 items-center">
                                                    <Label>Maker</Label>
                                                    <div className="col-span-2">
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <SelectTrigger><SelectValue placeholder="Select Maker" /></SelectTrigger>
                                                            <SelectContent>
                                                                {makers.map(m => <SelectItem key={m.uid} value={m.uid}>{m.displayName}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="checkerId"
                                            render={({ field }) => (
                                                 <FormItem className="grid grid-cols-3 items-center">
                                                    <Label>Checker</Label>
                                                     <div className="col-span-2">
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <SelectTrigger><SelectValue placeholder="Select Checker" /></SelectTrigger>
                                                            <SelectContent>
                                                            {checkers.map(c => <SelectItem key={c.uid} value={c.uid}>{c.displayName}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                         <Controller
                                            control={form.control}
                                            name="allowEditingPreviousYear"
                                            render={({ field }) => (
                                                 <RadioGroup
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    className="flex items-center space-x-4 col-span-2"
                                                >
                                                    <Label>Allow Editing Previous year</Label>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="Yes" id="yes" />
                                                        <Label htmlFor="yes">Yes</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="No" id="no" />
                                                        <Label htmlFor="no">No</Label>
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        />
                                    </div>
                                    
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-2 mt-6">
                                <Button type="submit">Submit</Button>
                                <Button type="button" variant="outline" onClick={() => router.back()}>Close</Button>
                            </div>
                        </TabsContent>
                        <TabsContent value="mandate-details">
                            <Card>
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    Mandate details will be displayed here.
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="documents">
                            <Card>
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    A list of all documents will be displayed here.
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="correction">
                            <Card>
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    Correction details will be displayed here.
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </form>
        </FormProvider>
    );
}
    