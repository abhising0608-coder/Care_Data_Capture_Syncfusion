
'use client';

import { Suspense, useMemo, useEffect, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileSpreadsheet,
  ChevronLeft,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

import { JsonSchemaForm } from '@/components/operational-input/json-schema-form';
import { basicInfoSchema } from '@/lib/schemas/basic-info-schema';
import { companyDetailsSchema } from '@/lib/schemas/company-details-schema';
import { commonDetailsSchema } from '@/lib/schemas/common-details-schema';
import { pharmaSchema } from '@/lib/schemas/sectorial-schemas/pharma-schema';
import { otherDetailsSchema } from '@/lib/schemas/other-details-schema';
import { doc, setDoc } from 'firebase/firestore';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const FormLoadingSkeleton = () => (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Skeleton className="h-9 w-9 sm:hidden" />
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
        </header>
        <main className="grid flex-1 items-start gap-4 px-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="flex items-center">
              <div className="flex gap-1">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
            <Skeleton className="h-[600px] w-full" />
        </main>
    </div>
);


export default function OperationalInputFlowPage() {
    const params = useParams();
    const router = useRouter();
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const [requestId, activeTab] = useMemo(() => {
        const slug = params.slug || [];
        return [slug[0] || null, slug[1] || null];
    }, [params.slug]);

    const operationalInputRef = useMemoFirebase(() => {
        if (!firestore || !requestId) return null;
        return doc(firestore, 'operational_input', requestId);
    }, [firestore, requestId]);

    const { data: operationalInputData, isLoading: isOperationalInputLoading } = useDoc(operationalInputRef);

    const financialSector = useMemo(() => operationalInputData?.initiation?.financialInputSector || 'Pharma', [operationalInputData]);
    
    const tabs = useMemo(() => [
        { id: 'basic-info', label: 'Basic Info', schema: basicInfoSchema, schemaType: 'form' },
        { id: 'company-details', label: 'Company Details', schema: companyDetailsSchema, schemaType: 'form' },
        { id: 'common-details', label: 'Common Details', schema: commonDetailsSchema, schemaType: 'form' },
        { id: 'sectorial-operational-data', label: `${financialSector} Operational Data`, schema: pharmaSchema, schemaType: 'spreadsheet' },
        { id: 'other-details', label: 'Other Details', schema: otherDetailsSchema, schemaType: 'form' },
    ], [financialSector]);

    const currentTabIndex = useMemo(() => {
        if (!activeTab) return -1;
        const index = tabs.findIndex(tab => tab.id === activeTab);
        return index;
    }, [tabs, activeTab]);

    const currentTab = useMemo(() => {
        if (currentTabIndex !== -1) {
            return tabs[currentTabIndex];
        }
        return null;
    }, [tabs, currentTabIndex]);

    useEffect(() => {
        if (!requestId) {
            router.replace('/ckc-requests');
        } else if (requestId && (!activeTab || !tabs.some(t => t.id === activeTab))) {
            router.replace(`/operational-input/${requestId}/${tabs[0].id}`);
        }
    }, [activeTab, tabs, requestId, router]);

    const handleNext = async (data: any) => {
        if (!firestore || !user || !requestId || !currentTab) return;

        try {
            const docRef = doc(firestore, 'operational_input', requestId);
            await setDoc(docRef, {
                [currentTab.id.replace(/-/g, '_')]: data,
                updatedAt: new Date(),
                updatedBy: user.uid,
            }, { merge: true });

            toast({
                title: 'Data Saved',
                description: `${currentTab.label} information has been saved successfully.`,
            });

            const nextTab = tabs[currentTabIndex + 1];
            if (nextTab) {
                router.push(`/operational-input/${requestId}/${nextTab.id}`);
            } else {
                 router.push('/ckc-requests');
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

    const handleBack = () => {
        if (currentTabIndex > 0) {
            const prevTab = tabs[currentTabIndex - 1];
            router.push(`/operational-input/${requestId}/${prevTab.id}`);
        } else {
            router.push('/ckc-requests');
        }
    };

    if (isOperationalInputLoading || !requestId || !operationalInputData) {
        return <FormLoadingSkeleton />;
    }

    return (
        <div className="flex min-h-screen w-full flex-col">
            <div className="flex flex-col sm:gap-4 sm:py-4">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Button size="icon" variant="outline" className="sm:hidden" onClick={() => router.back()}>
                        <ChevronLeft className="h-5 w-5" />
                        <span className="sr-only">Back</span>
                    </Button>
                    
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Operational Data Input</h1>
                        <p className="text-muted-foreground">Request ID: {requestId}</p>
                    </div>
                </header>
                <main className="grid flex-1 items-start gap-4 px-4 sm:px-6 sm:py-0 md:gap-8">
                    <Tabs value={activeTab || ''}>
                        <div className="flex items-center">
                            <TabsList>
                                {tabs.map(tab => (
                                    <TabsTrigger key={tab.id} value={tab.id} asChild>
                                        <Link href={`/operational-input/${requestId}/${tab.id}`}>{tab.label}</Link>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            <div className="ml-auto flex items-center gap-2">
                                <Button size="sm" variant="outline" className="h-7 gap-1 text-sm">
                                    <FileSpreadsheet className="h-3.5 w-3.5" />
                                    <span className="sr-only sm:not-sr-only">Export</span>
                                </Button>
                            </div>
                        </div>
                        {currentTab ? (
                            <TabsContent value={activeTab || ''} forceMount>
                                <Suspense fallback={<FormLoadingSkeleton />}>
                                    <JsonSchemaForm
                                        key={activeTab}
                                        schema={currentTab.schema}
                                        schemaType={currentTab.schemaType as any}
                                        onSubmit={handleNext}
                                        onCancel={handleBack}
                                        requestId={requestId}
                                        dataKey={currentTab.id.replace(/-/g, '_')}
                                        isLastStep={currentTabIndex === tabs.length - 1}
                                    />
                                </Suspense>
                            </TabsContent>
                        ) : (
                           <TabsContent value={activeTab || ''} forceMount>
                               <FormLoadingSkeleton />
                           </TabsContent>
                        )}
                    </Tabs>
                </main>
            </div>
        </div>
    );
}
