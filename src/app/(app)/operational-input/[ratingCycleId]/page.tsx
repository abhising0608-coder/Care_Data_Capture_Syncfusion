'use client';

import { Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useWorkflow } from '@/context/workflow-context';

import { JsonSchemaForm } from '@/components/operational-input/json-schema-form';
import { pharmaSchema } from '@/lib/schemas/sectorial-schemas/pharma-schema';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const FormLoadingSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-6 border rounded-lg p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    </div>
);

export default function OperationalInputFlowPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading: isAuthLoading } = useAuth();
    const { toast } = useToast();
    const { completeStep, activeCompanyId } = useWorkflow();
    const formRef = useForm();

    const ratingCycleId = params.ratingCycleId as string;
    const schema = pharmaSchema; // Only using Pharma schema as per requirements
    const dataKey = 'sectorial_operational_data';

    const { data: operationalInputData, isLoading: isOperationalInputLoading, mutate } = useSWR(ratingCycleId ? `/api/operational-input/${ratingCycleId}` : null, fetcher);

    if (!ratingCycleId) {
        // This should not happen in the workflow, but it's a good guard clause.
        if (typeof window !== 'undefined') {
            router.replace('/dashboard');
        }
        return null;
    }

    const handleSubmit = async (data: any) => {
        if (!user || !ratingCycleId) return;

        try {
            const payload = {
                ...operationalInputData,
                [dataKey]: data,
                updatedAt: new Date().toISOString(),
                updatedBy: user.uid,
            };
            
            await fetch(`/api/operational-input/${ratingCycleId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            mutate(payload, false);
            completeStep('operational-input');

            toast({
                title: 'Data Saved',
                description: `Operational data has been saved successfully.`,
            });
            
             if (activeCompanyId) {
                router.push(`/due-diligence/${activeCompanyId}`);
            } else {
                router.push('/dashboard');
            }
            
        } catch (error) {
            console.error("Failed to save data:", error);
            toast({
                variant: 'destructive',
                title: 'Error Saving Data',
                description: 'There was a problem saving your changes. Please try again.',
            });
        }
    };
    
    return (
        <div className="space-y-6">
             <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Operational Data Input</h1>
                    <p className="text-muted-foreground">Step 2: Enter sector-specific operational data. Only Pharma is required.</p>
                </div>
                 <Button onClick={formRef.handleSubmit(handleSubmit)}>
                    <Save className="mr-2 h-4 w-4" />
                    Save & Mark as Complete
                </Button>
            </header>
            <main>
                <Suspense fallback={<FormLoadingSkeleton />}>
                    {isOperationalInputLoading || isAuthLoading ? (
                        <FormLoadingSkeleton />
                    ) : (
                        <JsonSchemaForm
                            formInstance={formRef}
                            schema={schema}
                            schemaType="form"
                            onSubmit={handleSubmit}
                            onCancel={() => router.back()}
                            requestId={ratingCycleId!}
                            dataKey={dataKey}
                            isLastStep={false}
                            submitButtonText="" // Button is now rendered outside
                        />
                    )}
                </Suspense>
            </main>
        </div>
    );
}
