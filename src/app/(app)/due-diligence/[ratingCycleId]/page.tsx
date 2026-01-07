'use client';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditorFeedbackView } from '@/components/due-diligence/auditor-feedback-view';
import { BankerFeedbackView } from '@/components/due-diligence/banker-feedback-view';
import { DTFeedbackView } from '@/components/due-diligence/dt-feedback-view';
import { IPAFeedbackView } from '@/components/due-diligence/ipa-feedback-view';
import ManagementDiscussionPage from '../management-discussion/page';
import ThirdPartyCheckPage from '../third-party-check/page';
import AuditCommitteeMeetingPage from '../audit-committee-meeting/page';
import SiteVisitPage from '../site-visit/page';


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

export default function DueDiligencePage() {
    const params = useParams();
    const ratingCycleId = params.ratingCycleId as string;

    return (
        <div className="space-y-6">
             <header>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Due Diligence</h1>
                <p className="text-muted-foreground">Complete all required due diligence activities for the rating cycle.</p>
            </header>
             <Tabs defaultValue="auditor" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
                    {tabsConfig.map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                    ))}
                </TabsList>

                 {tabsConfig.map(tab => (
                    <TabsContent key={tab.value} value={tab.value}>
                        <div className="mt-4">
                           <tab.Component companyId={ratingCycleId} isEmbedded={true} />
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
