'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/firebase';
import type { DTFirm } from '@/lib/definitions';
import { getCompaniesByRole } from '@/lib/mock-data';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DTFeedbackAccordion } from '@/components/due-diligence/dt-feedback-accordion';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface DTFeedbackViewProps {
    companyId?: string;
    isEmbedded?: boolean;
}

export function DTFeedbackView({ companyId: initialCompanyId, isEmbedded = false }: DTFeedbackViewProps) {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>(initialCompanyId || '');
    const [companyToFetch, setCompanyToFetch] = useState<string>(initialCompanyId || '');

    const companies = getCompaniesByRole(user);

    const { data: dtFirms, isLoading: isDtLoading } = useSWR<DTFirm[]>(
        companyToFetch ? `/api/due-diligence/dt-feedback?companyId=${companyToFetch}` : null,
        fetcher
    );

    const handleGoClick = () => {
        setCompanyToFetch(selectedCompanyId);
    };

    const isLoading = isAuthLoading || (companyToFetch && isDtLoading);

    return (
        <div className="space-y-6">
            {!isEmbedded && (
                <header>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">DT Feedback</h1>
                    <p className="text-muted-foreground">Manage Debenture Trustee feedback for a selected company.</p>
                </header>
            )}

            {!initialCompanyId && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Company Selection</CardTitle>
                        <CardDescription>Select a company to view and manage DT feedback.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex w-full max-w-sm items-center space-x-2">
                            <Select onValueChange={setSelectedCompanyId} value={selectedCompanyId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a company" />
                                </SelectTrigger>
                                <SelectContent>
                                    {isAuthLoading ? (
                                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                                    ) : (
                                        companies.map((company) => (
                                            <SelectItem key={company.id} value={company.id}>
                                                {company.companyName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleGoClick} disabled={!selectedCompanyId || isLoading}>
                                GO
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isLoading && (
                <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            )}
            
            {!isLoading && dtFirms && (
                 <DTFeedbackAccordion firms={dtFirms} companyId={companyToFetch} />
            )}

            {!isLoading && companyToFetch && !dtFirms?.length && (
                 <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                        No Debenture Trustee firms found for the selected company.
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
