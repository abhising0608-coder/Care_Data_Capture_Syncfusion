'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/auth-context';
import type { IPAFirm } from '@/lib/definitions';
import { getCompaniesByRole } from '@/lib/mock-data';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { IPAFeedbackAccordion } from '@/components/due-diligence/ipa-feedback-accordion';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface IPAFeedbackViewProps {
    companyId?: string;
    isEmbedded?: boolean;
}

export function IPAFeedbackView({ companyId: initialCompanyId, isEmbedded = false }: IPAFeedbackViewProps) {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>(initialCompanyId || '');
    const [companyToFetch, setCompanyToFetch] = useState<string>(initialCompanyId || '');

    const companies = getCompaniesByRole(user);

    const { data: ipaFirms, isLoading: isIpaLoading } = useSWR<IPAFirm[]>(
        companyToFetch ? `/api/due-diligence/ipa-feedback?companyId=${companyToFetch}` : null,
        fetcher
    );

    const handleGoClick = () => {
        setCompanyToFetch(selectedCompanyId);
    };

    const isLoading = isAuthLoading || (companyToFetch && isIpaLoading);

    return (
        <div className="space-y-6">
            {!isEmbedded && (
                <header>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">IPA Feedback</h1>
                    <p className="text-muted-foreground">Manage Issuing and Paying Agent feedback for a selected company.</p>
                </header>
            )}

            {!initialCompanyId && (
                <Card>
                    <CardHeader>
                        <CardTitle>Company Selection</CardTitle>
                        <CardDescription>Select a company to view and manage IPA feedback.</CardDescription>
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
            
            {!isLoading && ipaFirms && (
                 <IPAFeedbackAccordion firms={ipaFirms} companyId={companyToFetch} />
            )}

            {!isLoading && companyToFetch && !ipaFirms?.length && (
                 <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                        No Issuing and Paying Agent firms found for the selected company.
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
