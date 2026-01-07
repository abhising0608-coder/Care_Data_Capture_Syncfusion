'use client';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditorFeedbackView } from '@/components/due-diligence/auditor-feedback-view';
import { BankerFeedbackView } from '@/components/due-diligence/banker-feedback-view';
import { DTFeedbackView } from '@/components/due-diligence/dt-feedback-view';
import { IPAFeedbackView } from '@/components/due-diligence/ipa-feedback-view';
import ManagementDiscussionPage from '../management-discussion/page';
import ThirdPartyCheckPage from '../third-party-check/page';
import AuditCommitteeMeetingPage from '../audit-committee-meeting/page';
import SiteVisitPage from '../site-visit/page';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { RatingNote } from '@/lib/definitions';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useWorkflow } from '@/context/workflow-context';
import { useToast } from '@/hooks/use-toast';


const tabsConfig = [
    { value: 'auditor', label: 'Auditor Feedback', Component: AuditorFeedbackView },
    { value: 'banker', label: 'Banker Feedback', Component: BankerFeedbackView },
    { value: 'dt', label: 'DT Feedback', Component: DTFeedbackView },
    { value: 'ipa', label: 'IPA Feedback', Component: IPAFeedbackView },
    { value: 'management', label: 'Management Discussion', Component: ManagementDiscussionPage },
    { value: 'third-party', label: 'Third Party Check', Component: ThirdPartyCheckPage },
    { value: 'audit-committee', label: 'Audit Committee Meeting', Component: AuditCommitteeMeetingPage },
    { value: 'site-visit', label: 'Site / Plant Visit', Component: SiteVisitPage },
];

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DueDiligencePage() {
    const params = useParams();
    const router = useRouter();
    const { completeStep } = useWorkflow();
    const { toast } = useToast();
    const ratingCycleId = params.ratingCycleId as string;
    
    const { data: note, isLoading } = useSWR<RatingNote>(
      ratingCycleId ? `/api/notes/${ratingCycleId}` : null, 
      fetcher
    );

    const handleComplete = () => {
        // Here you would add validation logic to ensure all mandatory DD items are complete.
        completeStep('due-diligence');
        toast({
            title: 'Due Diligence Complete',
            description: 'The due diligence step has been marked as complete.',
        });
        router.push(`/manage-instrument/${ratingCycleId}`);
    }


    return (
        <div className="space-y-6">
             <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Due Diligence</h1>
                    <p className="text-muted-foreground">Complete all required due diligence activities for the rating cycle.</p>
                </div>
                <Button onClick={handleComplete}>
                    <Save className="mr-2 h-4 w-4" />
                    Save & Mark as Complete
                </Button>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Company Context</CardTitle>
                    <CardDescription>All due diligence activities will be performed for the company selected in the workflow.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-8 w-1/2" />
                    ) : (
                        <div className="text-lg font-semibold text-primary">
                            {note?.companyName || `Company ID: ${ratingCycleId}`}
                        </div>
                    )}
                </CardContent>
            </Card>

             <Tabs defaultValue="auditor" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
                    {tabsConfig.map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                    ))}
                </TabsList>

                 {tabsConfig.map(tab => (
                    <TabsContent key={tab.value} value={tab.value}>
                        <div className="mt-4">
                           <tab.Component companyId={note?.companyId || ratingCycleId} isEmbedded={true} />
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
