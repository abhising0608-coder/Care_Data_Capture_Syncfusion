'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useSWR, { useSWRConfig } from 'swr';
import { useEffect } from 'react';
import { Save, Mail, FileText, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { Auditor, AuditorDiscussion, AuditorQuestionnaireItem, RatingNote } from '@/lib/definitions';
import { mockAuditorQuestionnaire } from '@/lib/mock-data';


const fetcher = (url: string) => fetch(url).then(res => res.json());

const feedbackSchema = z.object({
  remarks: z.record(z.string()),
  summary: z.string().optional(),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export default function AuditorFeedbackCapturePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const [ratingCycleId, auditorId, discussionId] = params.slug as string[];

  const { data: note, isLoading: isNoteLoading } = useSWR<RatingNote>(`/api/notes/${ratingCycleId}`, fetcher);
  const { data: auditors, isLoading: isAuditorLoading } = useSWR<Auditor[]>(`/api/auditors/${ratingCycleId}`, fetcher);
  const { data: discussion, isLoading: isDiscussionLoading } = useSWR<AuditorDiscussion>(`/api/auditors/${ratingCycleId}/${auditorId}/${discussionId}`, fetcher);
  
  const auditor = auditors?.find(a => a.id === auditorId);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { remarks: {}, summary: '' }
  });

  useEffect(() => {
    if (discussion) {
      form.reset({
        remarks: discussion.feedback || {},
        summary: discussion.summary || ''
      });
    }
  }, [discussion, form]);


  const handleSave = async (data: FeedbackFormValues) => {
    try {
      const payload = { feedback: data.remarks, summary: data.summary, status: 'In Progress' };
      await fetch(`/api/auditors/${ratingCycleId}/${auditorId}/${discussionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      mutate(`/api/auditors/${ratingCycleId}/${auditorId}/${discussionId}`); // Revalidate SWR
      toast({ title: 'Success', description: 'Your feedback has been saved.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save feedback.' });
    }
  };
  
  const handleMarkAsComplete = async () => {
    const data = form.getValues();
     try {
      const payload = { feedback: data.remarks, summary: data.summary, status: 'Completed', minutesCaptured: 'Yes' };
      await fetch(`/api/auditors/${ratingCycleId}/${auditorId}/${discussionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      mutate(`/api/auditors/${ratingCycleId}/${auditorId}/${discussionId}`);
      toast({ title: 'Success', description: 'Feedback marked as complete.' });
      router.back();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to mark as complete.' });
    }
  }
  
  const isLoading = isNoteLoading || isAuditorLoading || isDiscussionLoading;

  if (isLoading) {
    return <div className="p-6"><Skeleton className="h-screen w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{note?.companyName}</h1>
        <p className="text-muted-foreground">{auditor?.firmName} - {discussion?.contactPerson}</p>
      </header>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSave)}>
          <Card>
            <CardContent className="p-0">
                <div className="rounded-t-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-16">Sr. No</TableHead>
                                <TableHead>Particulars</TableHead>
                                <TableHead className="w-1/3">Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                            {mockAuditorQuestionnaire.map((q, index) => (
                                <TableRow key={q.id}>
                                    <TableCell className="text-center">{index + 1}</TableCell>
                                    <TableCell>{q.particulars}</TableCell>
                                    <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`remarks.${q.id}`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Textarea {...field} placeholder="Enter Text" className="min-h-[60px]" />
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
                <div className="p-4 space-y-4 border-x border-b rounded-b-lg">
                    <h3 className="font-semibold">Summary for Rating Note</h3>
                    <FormField
                        control={form.control}
                        name="summary"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea {...field} className="min-h-[120px]" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
          </Card>
           <div className="flex justify-between items-center">
                <div>
                     <Button type="button" variant="outline" onClick={() => toast({description: 'Placeholder'})}><FileText className="mr-2 h-4 w-4"/>Export</Button>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => toast({description: 'Placeholder'})}><Mail className="mr-2 h-4 w-4"/>Email to Auditor</Button>
                    <Button type="submit"><Save className="mr-2 h-4 w-4"/>Save</Button>
                    <Button type="button" variant="outline" onClick={handleMarkAsComplete}>Mark as Complete</Button>
                    <Button type="button" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4"/>Back</Button>
                </div>
            </div>
        </form>
      </FormProvider>
    </div>
  );
}
