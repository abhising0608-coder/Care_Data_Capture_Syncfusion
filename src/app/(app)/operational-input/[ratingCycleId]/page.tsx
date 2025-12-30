'use client';

import { Suspense, useMemo, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { JsonSchemaForm } from '@/components/operational-input/json-schema-form';
import { pharmaSchema } from '@/lib/schemas/sectorial-schemas/pharma-schema';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkflow } from '@/context/workflow-context';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const FormLoadingSkeleton = () => (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
               <div className="flex justify-end gap-4 mt-8">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
               </div>
            </CardContent>
        </Card>
    </div>
);


export default function OperationalInputFlowPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const { completeStep } = useWorkflow();

    const ratingCycleId = params.ratingCycleId as string;
    const schema = pharmaSchema; // Only using Pharma schema as per requirements
    const dataKey = 'sectorial_operational_data';

    const { data: operationalInputData, isLoading: isOperationalInputLoading, mutate } = useSWR(ratingCycleId ? `/api/operational-input/${ratingCycleId}` : null, fetcher);

    useEffect(() => {
        if (!ratingCycleId) {
            router.replace('/dashboard');
        }
    }, [ratingCycleId, router]);

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

            toast({
                title: 'Data Saved',
                description: `Operational data has been saved successfully.`,
            });
            
            completeStep('operational-input');
            router.push(`/financial-input/${ratingCycleId}`);
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
        <div className="flex min-h-screen w-full flex-col">
            <div className="flex flex-col sm:gap-4">
                 <header>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Operational Data Input</h1>
                    <p className="text-muted-foreground">Step 2: Enter sector-specific operational data. Only Pharma is required.</p>
                </header>
                <main className="mt-6">
                    <Suspense fallback={<FormLoadingSkeleton />}>
                        {isOperationalInputLoading ? (
                            <FormLoadingSkeleton />
                        ) : (
                            <JsonSchemaForm
                                key={ratingCycleId}
                                schema={schema}
                                schemaType="form"
                                onSubmit={handleSubmit}
                                onCancel={() => router.back()}
                                requestId={ratingCycleId!}
                                dataKey={dataKey}
                                isLastStep={false} // This is not the last step in the new flow
                                submitButtonText="Save & Continue to Next Step"
                            />
                        )}
                    </Suspense>
                </main>
            </div>
        </div>
    );
}
