
'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { ActivitiesList } from '@/components/portfolio/activities-list';
import { getNoteById } from '@/lib/mock-data';
import { CompanyInformationTab } from '@/components/portfolio/company-information-tab';

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

            <Tabs defaultValue="company-information" className="w-full">
                <TabsList>
                    {tabsConfig.map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                    ))}
                </TabsList>

                {tabsConfig.map(tab => (
                    <TabsContent key={tab.value} value={tab.value}>
                        <div className="mt-4">
                            {tab.value === 'activities' ? (
                                <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                                    <ActivitiesList />
                                </Suspense>
                            ) : tab.value === 'company-information' ? (
                                <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
                                    <CompanyInformationTab ratingCycleId={ratingCycleId} />
                                </Suspense>
                            ) : (
                                <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/50">
                                    <p className="text-muted-foreground">Content for {tab.label}</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
