'use client';

import { useParams, useRouter } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Save, Mail, ArrowLeft, Download } from 'lucide-react';
import { DTEmailModal } from '@/components/due-diligence/dt-email-modal';
import type { DTFirm, DTContact, QuestionnaireItem, CompanyDashboard } from '@/lib/definitions';
import { useAuth } from '@/firebase';
import { getCompaniesByRole } from '@/lib/mock-data';


const fetcher = (url: string) => fetch(url).then(res => res.json());

const questionnaireSchema = z.array(z.object({
  srNo: z.number(),
  particulars: z.string(),
  remarks: z.string().optional(),
}));

const formSchema = z.object({
  questionnaire: questionnaireSchema,
  summary: z.string().optional(),
});


const defaultQuestionnaire: QuestionnaireItem[] = [
    { srNo: 1, particulars: "Details of defaults by the Company in payment of interest/principal against any of the ISINs during the last three years.", remarks: "" },
    { srNo: 2, particulars: "Details of complaints received from investors and their status thereof during the last three years.", remarks: "" },
    { srNo: 3, particulars: "Any major issues pending with the Company from a compliance perspective.", remarks: "" },
    { srNo: 4, particulars: "Any other issue you would like to share with us?", remarks: "" },
];

export default function DTFeedbackCapturePage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { mutate } = useSWRConfig();
    const { user } = useAuth();
    const [companyId, firmId, contactId] = params.slug || [];

    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    const { data, error, isLoading } = useSWR<{ firm: DTFirm, contact: DTContact }>(
        companyId && firmId && contactId ? `/api/due-diligence/dt-feedback?companyId=${companyId}&firmId=${firmId}&contactId=${contactId}` : null,
        fetcher
    );

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            questionnaire: defaultQuestionnaire,
            summary: '',
        }
    });
    
    const { fields } = useFieldArray({
        control: form.control,
        name: 'questionnaire'
    });

    useEffect(() => {
        if (data?.contact) {
            form.reset({
                questionnaire: data.contact.questionnaire && data.contact.questionnaire.length > 0 ? data.contact.questionnaire : defaultQuestionnaire,
                summary: data.contact.summary || ''
            });
        }
    }, [data, form]);
    
    const handleSave = async (formData: z.infer<typeof formSchema>, isFinal: boolean) => {
        if (isFinal && !formData.summary) {
            toast({ variant: 'destructive', title: 'Error', description: 'Summary is mandatory before marking as complete.' });
            return;
        }

        const newStatus = isFinal ? 'Completed' : 'In Progress';
        
        try {
            await fetch('/api/due-diligence/dt-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyId, firmId, contactId,
                    updates: {
                        questionnaire: formData.questionnaire,
                        summary: formData.summary,
                        status: newStatus,
                    }
                }),
            });
            
            mutate(`/api/due-diligence/dt-feedback?companyId=${companyId}`);
            toast({ title: 'Success', description: `Feedback saved ${isFinal ? 'and marked as complete' : 'as draft'}.` });
            if (isFinal) {
                router.back();
            }
        } catch (e) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save feedback.' });
        }
    };

    const isReadOnly = data?.contact?.status === 'Completed' || (user && user.role !== 'RATING_ANALYST');

    const currentCompany = getCompaniesByRole(user).find(c => c.id === companyId);

    if (isLoading) {
        return (
            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    if (error || !data) {
        return <div>Failed to load data. Please go back and try again.</div>;
    }
    
    const { firm, contact } = data;

    return (
        <div className="space-y-6">
            <header>
                 <div className="flex items-center gap-4 mb-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            DT Feedback Capture: {firm.firmName}
                        </h1>
                        <p className="text-muted-foreground">
                            For: {currentCompany?.companyName} / {contact.name}
                        </p>
                    </div>
                </div>
            </header>

            <FormProvider {...form}>
                <form>
                    <Card>
                        <CardHeader>
                            <CardTitle>Questionnaire</CardTitle>
                            <CardDescription>Fill in the remarks for each particular.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">Sr. No</TableHead>
                                            <TableHead>Particulars</TableHead>
                                            <TableHead>Remarks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fields.map((field, index) => (
                                            <TableRow key={field.id}>
                                                <TableCell>{field.srNo}</TableCell>
                                                <TableCell className="font-medium">{field.particulars}</TableCell>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`questionnaire.${index}.remarks`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Textarea {...field} readOnly={isReadOnly} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                             </div>
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Summary for Rating Note</CardTitle>
                            <CardDescription>
                                Provide a concise summary of the discussion. This is mandatory for completion.
                            </CardDescription>
                        </CardHeader>
                         <CardContent>
                             <FormField
                                control={form.control}
                                name="summary"
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea className="min-h-[150px]" {...field} readOnly={isReadOnly} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                         </CardContent>
                    </Card>
                    
                    <div className="flex justify-end gap-4 mt-8">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />Back
                        </Button>
                        <Button type="button" variant="outline" disabled={isReadOnly} onClick={() => toast({title: "Placeholder", description: "Export to PDF functionality to be implemented."})}>
                            <Download className="mr-2 h-4 w-4" />Export PDF
                        </Button>
                         {!isReadOnly && (
                            <>
                                <Button type="button" variant="outline" onClick={() => setIsEmailModalOpen(true)}>
                                    <Mail className="mr-2 h-4 w-4" />Email to DT
                                </Button>
                                <Button type="button" variant="outline" onClick={form.handleSubmit(data => handleSave(data, false))}>
                                    <Save className="mr-2 h-4 w-4" />Save Draft
                                </Button>
                                <Button type="button" onClick={form.handleSubmit(data => handleSave(data, true))}>
                                    Mark as Complete
                                </Button>
                            </>
                         )}
                    </div>

                </form>
            </FormProvider>

            {/* Email Modal */}
            {currentCompany && (
                 <DTEmailModal
                    isOpen={isEmailModalOpen}
                    onClose={() => setIsEmailModalOpen(false)}
                    firm={firm}
                    contact={contact}
                    company={currentCompany}
                 />
            )}
        </div>
    );
}
