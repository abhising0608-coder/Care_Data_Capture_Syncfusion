'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useForm, FormProvider, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Download, Check, X, ShieldQuestion, Send, Edit, Save, ArrowLeft, ArrowRight, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormField, FormItem } from '@/components/ui/form';
import type { CKCRequest, CKCRequestDocument, Role } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { mockUsers } from '@/lib/mock-data';
import { RejectionModal } from '@/components/ckc/rejection-modal';
import { WithdrawalModal } from '@/components/ckc/withdrawal-modal';
import { PastFinancialsTable } from '@/components/ckc/past-financials-table';
import { MandateDetailsForm } from '@/components/ckc/mandate-details-form';
import { useAuth } from '@/firebase';
import { Input } from '@/components/ui/input';

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
    const { user, isLoading: isAuthLoading } = useAuth();
    const userRole = user?.role;
    const isAdmin = userRole === 'CKC_ADMIN';

    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('request-details');

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

    const handleApprove = (data: RequestDetailsFormValues) => {
        console.log("Approved with data:", data);
        toast({
            title: 'Request Approved',
            description: `Request ${request?.id} has been approved and moved to the accepted queue.`,
        });
        router.push('/ckc/requests');
    };

    const handleSubmit = (data: RequestDetailsFormValues) => {
        console.log("Submitting form:", data);
        toast({
            title: 'Request Submitted',
            description: `Request ${request?.id} has been submitted successfully.`,
        });
        router.push('/ckc/requests');
    };
    
     const handleAccept = () => {
        console.log("Accepted request:", request?.id);
        toast({
            title: 'Request Accepted',
            description: `Request ${request?.id} has been moved to your accepted queue.`,
        });
        router.push('/ckc/requests');
    };

    const handleReject = (comments: string) => {
        console.log("Rejecting with comments:", comments);
        toast({
            variant: 'destructive',
            title: 'Request Rejected',
            description: `Request ${request?.id} has been rejected.`,
        });
        setIsRejectionModalOpen(false);
        router.push('/ckc/requests');
    };
    
    const handleHold = () => {
        toast({
            title: 'On Hold',
            description: `Request ${request?.id} has been put on hold.`,
        });
    }

    const handleWithdraw = (reason: string) => {
        console.log("Withdrawing with reason:", reason);
        toast({
            title: 'Request Withdrawn',
            description: `Request ${request?.id} has been withdrawn.`,
        });
        setIsWithdrawalModalOpen(false);
        router.push('/ckc/requests');
    }
    
    if (isLoading || isAuthLoading || !request) {
        return <div className="p-6"><Skeleton className="h-[70vh] w-full" /></div>
    }

    if (error) {
        return <div className="p-6 text-destructive">Failed to load request details.</div>
    }

    const renderFooterButtons = () => {
        if (isAdmin) {
             return (
                <div className="flex justify-end gap-2 mt-6">
                    <Button type="button" onClick={form.handleSubmit(handleSubmit)}>
                        <Save className="mr-2 h-4 w-4" /> Submit
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        <X className="mr-2 h-4 w-4" /> Close
                    </Button>
                </div>
             );
        }

        // Analyst View
        return (
            <div className="flex justify-end gap-2 mt-6">
                <Button type="button" onClick={handleAccept}>Accept</Button>
                <Button type="button" variant="destructive" onClick={() => setIsRejectionModalOpen(true)}>Reject</Button>
                <Button type="button" variant="outline" onClick={handleHold}>Hold</Button>
            </div>
        );
    }
    
    const receivedDocuments = [
        { title: 'AY-2022.Pdf', size: '8 MB', type: 'PDF Document', date: '20 Nov 2024, 09:42 AM', by: 'Rahul Sharma', category: 'Audited' },
        { title: 'PY-2023.Pdf', size: '6 MB', type: 'PDF Document', date: '20 Nov 2024, 09:42 AM', by: 'Kiran Kumar', category: 'Provisional' },
        { title: 'PR-2024.Xlsx', size: '8 MB', type: 'Xlsx Document', date: '20 Nov 2024, 09:42 AM', by: 'Kiran Kumar', category: 'Projection' },
        { title: 'PR-2025.Xlsx', size: '6 MB', type: 'Xlsx Document', date: '20 Nov 2024, 09:42 AM', by: 'Kiran Kumar', category: 'Projection' },
    ];


    return (
        <FormProvider {...form}>
            <form>
                 <div className="space-y-6">
                    <header>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {isAdmin ? 'Request Form' : 'Request Details'}
                        </h1>
                         <p className="text-muted-foreground">{request.companyName}</p>
                    </header>
                    <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="mandate-details">
                        <TabsList>
                            <TabsTrigger value="mandate-details">Mandate Details</TabsTrigger>
                            <TabsTrigger value="request-details">Request Form</TabsTrigger>
                            <TabsTrigger value="documents">Documents</TabsTrigger>
                            <TabsTrigger value="correction">Correction</TabsTrigger>
                            <TabsTrigger value="past-financials">Past Financials</TabsTrigger>
                        </TabsList>
                        <TabsContent value="request-details" className="space-y-6">
                             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{request.companyName}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                            <InfoRow label="Company ID" value={request.companyId} />
                                            <InfoRow label="Dealing Analyst" value={request.analystName || 'N/A'} />
                                            <InfoRow label="Group Head" value={request.groupHead || 'N/A'} />
                                            <InfoRow label="Initiated By" value={request.createdBy} />
                                            <InfoRow label="Name of HO / RO" value={request.hoRoName || 'N/A'} />
                                            <InfoRow label="Rating Cycle" value={request.cycle} />
                                            <InfoRow label="Result Type" value={request.resultType} />
                                            <InfoRow label="MCA Data" value={'No'} />
                                            <InfoRow label="Remarks" value="Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae. Proin tincidunt leo nec est sollicitudin, at porta erat pulvinar." />
                                    </CardContent>
                                </Card>
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
                                                    {isAdmin && <TableHead className="w-[100px]">Is Valid</TableHead>}
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
                                                        {isAdmin && (
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
                                                        )}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                             </div>
                             {isAdmin && (
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
                            )}
                            {renderFooterButtons()}
                        </TabsContent>
                         <TabsContent value="mandate-details">
                            <MandateDetailsForm requestId={requestId} />
                         </TabsContent>
                         <TabsContent value="past-financials">
                           <PastFinancialsTable companyId={request.companyId} />
                        </TabsContent>
                        <TabsContent value="documents">
                           <Card>
                                <CardContent className="space-y-6 pt-6">
                                     <div className="flex items-center justify-between">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>Request Type</Label>
                                                <Input value="Initial" disabled />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Financial Type</Label>
                                                <Input value="Audited" disabled />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Tenure</Label>
                                                <Input value="FY 24-25" disabled />
                                            </div>
                                        </div>
                                         <Button variant="outline" onClick={() => toast({ title: "Placeholder", description: "Document upload modal to be implemented." })}>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload Document
                                        </Button>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Documents Received</h3>
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Document Title</TableHead>
                                                        <TableHead>Size</TableHead>
                                                        <TableHead>File Type</TableHead>
                                                        <TableHead>Received Date</TableHead>
                                                        <TableHead>Uploaded by</TableHead>
                                                        <TableHead>Document Category</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {receivedDocuments.map(doc => (
                                                        <TableRow key={doc.title}>
                                                            <TableCell><Button variant="link" className="p-0 h-auto">{doc.title}</Button></TableCell>
                                                            <TableCell>{doc.size}</TableCell>
                                                            <TableCell>{doc.type}</TableCell>
                                                            <TableCell>{doc.date}</TableCell>
                                                            <TableCell>{doc.by}</TableCell>
                                                            <TableCell>{doc.category}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button type="button" onClick={() => toast({title: "Placeholder", description: "Send for checking logic to be implemented."})}>Submit for Checking</Button>
                                        <Button type="button" onClick={() => toast({title: "Placeholder", description: "Mark as complete logic to be implemented."})}>Mark as Complete</Button>
                                    </div>
                                </CardContent>
                           </Card>
                        </TabsContent>
                        <TabsContent value="correction">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Correction</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center text-muted-foreground p-8">
                                    (Placeholder for Correction Log)
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </form>

            <RejectionModal
                isOpen={isRejectionModalOpen}
                onClose={() => setIsRejectionModalOpen(false)}
                onSubmit={handleReject}
            />
            <WithdrawalModal
                isOpen={isWithdrawalModalOpen}
                onClose={() => setIsWithdrawalModalOpen(false)}
                onSubmit={handleWithdraw}
            />
        </FormProvider>
    );
}
    