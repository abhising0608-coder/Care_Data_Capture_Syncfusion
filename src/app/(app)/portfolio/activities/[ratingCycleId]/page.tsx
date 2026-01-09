
'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { ActivitiesList } from '@/components/portfolio/activities-list';
import { getNoteById } from '@/lib/mock-data';
import { CompanyInformationTab } from '@/components/portfolio/company-information-tab';
import { MandateDetailsTab } from '@/components/portfolio/mandate-details-tab';

const tabsConfig = [
    { value: 'company-information', label: 'Company Information' },
    { value: 'mandate-details', label: 'Mandate Details' },
    { value: 'information-request', label: 'Information Request' },
    { value: 'document-review', label: 'Document Review' },
    { value: 'activities', label: 'Activities' },
];

export default function PortfolioActivitiesPage() {
    const params = useParams();
    const ratingCycleId = params.ratingCycleId as string;
    
    // In a real app, this would be an API call
    const company = getNoteById(ratingCycleId);
    const companyName = company?.companyName || "Company Not Found";

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{companyName}</h1>
            </header>

            <Tabs defaultValue="mandate-details" className="w-full">
                <TabsList>
                    {tabsConfig.map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                    ))}
                </TabsList>

                
                    <TabsContent value="company-information">
                        <div className="mt-4">
                            <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
                                <CompanyInformationTab ratingCycleId={ratingCycleId} />
                            </Suspense>
                        </div>
                    </TabsContent>
                    <TabsContent value="mandate-details">
                         <div className="mt-4">
                            <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
                                <MandateDetailsTab ratingCycleId={ratingCycleId} />
                            </Suspense>
                        </div>
                    </TabsContent>
                     <TabsContent value="information-request">
                        <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/50 mt-4">
                            <p className="text-muted-foreground">Content for Information Request</p>
                        </div>
                    </TabsContent>
                    <TabsContent value="document-review">
                        <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/50 mt-4">
                            <p className="text-muted-foreground">Content for Document Review</p>
                        </div>
                    </TabsContent>
                    <TabsContent value="activities">
                        <div className="mt-4">
                            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                                <ActivitiesList />
                            </Suspense>
                        </div>
                    </TabsContent>
            </Tabs>
        </div>
    );
}
