'use client';

import { useParams, useRouter } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { CompanyInfo, Role } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { CompanyMasterInfo } from '@/components/company-information/company-master-info';
import { GroupTagging } from '@/components/company-information/group-tagging';
import { DetailBlock } from '@/components/company-information/detail-block';
import { Save, Ban } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Define a basic schema for validation, can be expanded
const companyInfoSchema = z.object({
    groupSelection: z.object({
        group: z.string().optional(),
        groupForCombinedApproach: z.string().optional(),
    }),
    contactDetails: z.array(z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
        designation: z.string().min(1, "Designation is required"),
        email: z.string().email("Invalid email"),
        phone: z.string().min(1, "Phone is required"),
    })).optional(),
    auditorDetails: z.array(z.any()).optional(),
    bankerDetails: z.array(z.any()).optional(),
    dtDetails: z.array(z.any()).optional(),
    ipaDetails: z.array(z.any()).optional(),
    thirdPartyDetails: z.array(z.any()).optional(),
});


export default function CompanyInformationPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { mutate } = useSWRConfig();
    const { user, isLoading: isAuthLoading } = useAuth();
    const ratingCycleId = params.ratingCycleId as string;

    const { data, error, isLoading } = useSWR<CompanyInfo>(
        ratingCycleId ? `/api/rating-workflow/company-info/${ratingCycleId}` : null,
        fetcher
    );

    const methods = useForm<CompanyInfo>({
        resolver: zodResolver(companyInfoSchema),
        defaultValues: data,
    });

    useEffect(() => {
        if (data) {
            methods.reset(data);
        }
    }, [data, methods]);
    
    const readOnlyRoles: Role[] = ['GROUP_HEAD', 'RATING_HEAD_SD'];
    const isReadOnly = isAuthLoading || !user || readOnlyRoles.includes(user.role);

    const onSubmit = async (formData: CompanyInfo) => {
        const payload = {
            ...data,
            ...formData,
            syncStatus: {
                ...data?.syncStatus,
                source: 'Rating',
                lastUpdatedBy: user?.uid || 'unknown',
                lastUpdatedAt: new Date().toISOString(),
            },
        };

        try {
            await fetch(`/api/rating-workflow/company-info/${ratingCycleId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            mutate(`/api/rating-workflow/company-info/${ratingCycleId}`);
            toast({
                title: 'Success',
                description: 'Company information has been saved.',
            });
        } catch (e) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to save company information.',
            });
        }
    };

    if (isLoading || isAuthLoading) {
        return (
             <div className="p-6 space-y-6">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        )
    }

    if (error || !data) {
        return <div>Failed to load data. Please try again.</div>;
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
                <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                    <header className="flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-sm -mx-8 px-8 py-4 border-b">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Company Information: {data.masterSnapshot.sector}
                            </h1>
                            <p className="text-muted-foreground">
                                Rating Cycle ID: {ratingCycleId}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                 <Ban className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            {!isReadOnly && (
                                <Button type="submit">
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                            )}
                        </div>
                    </header>
                    
                    <CompanyMasterInfo masterSnapshot={data.masterSnapshot} />
                    <GroupTagging isReadOnly={isReadOnly} />

                    <DetailBlock
                        title="Contact Details"
                        data={data.contactDetails}
                        isReadOnly={isReadOnly}
                        fieldName="contactDetails"
                        columns={[
                            { accessor: 'name', header: 'Name' },
                            { accessor: 'designation', header: 'Designation' },
                            { accessor: 'email', header: 'Email' },
                            { accessor: 'phone', header: 'Phone' },
                        ]}
                    />

                    <DetailBlock
                        title="Auditor Details"
                        data={data.auditorDetails}
                        isReadOnly={isReadOnly}
                        fieldName="auditorDetails"
                        columns={[
                            { accessor: 'name', header: 'Auditor Name' },
                            { accessor: 'type', header: 'Type (Statutory/Internal)' },
                            { accessor: 'since', header: 'Auditor Since' },
                        ]}
                    />

                     <DetailBlock
                        title="Banker Details"
                        data={data.bankerDetails}
                        isReadOnly={isReadOnly}
                        fieldName="bankerDetails"
                        columns={[
                            { accessor: 'bankName', header: 'Bank Name' },
                            { accessor: 'facilityType', header: 'Facility Type' },
                            { accessor: 'amount', header: 'Amount (Cr)' },
                        ]}
                    />
                </div>
            </form>
        </FormProvider>
    );
}
