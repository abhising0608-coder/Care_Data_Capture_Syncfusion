
'use client';

import { Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  File,
  Home,
  LineChart,
  Package,
  PanelLeft,
  PlusCircle,
  Search,
  Settings,
  ShoppingCart,
  Upload,
  Users2,
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  MoreVertical,
  Truck,
  FileSpreadsheet,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

import { JsonSchemaForm } from '@/components/operational-input/json-schema-form';
import { basicInfoSchema } from '@/lib/schemas/basic-info-schema';
import { companyDetailsSchema } from '@/lib/schemas/company-details-schema';
import { commonDetailsSchema } from '@/lib/schemas/common-details-schema';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

export default function OperationalInputFlowPage() {
  const params = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [requestId, activeTab] = params.slug || [];

  const tabs = [
    { id: 'basic-info', label: 'Basic Info', schema: basicInfoSchema },
    { id: 'company-details', label: 'Company Details', schema: companyDetailsSchema },
    { id: 'common-details', label: 'Common Details', schema: commonDetailsSchema },
    { id: 'sectorial-operational-data', label: 'Sectorial Operational Data', schema: {} },
    { id: 'other-details', label: 'Other Details', schema: {} },
  ];

  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
  const currentTab = tabs[currentTabIndex];

  const handleNext = async (data: any) => {
    if (!firestore || !user || !requestId || !currentTab) return;

    try {
      const operationalInputRef = doc(firestore, 'operational_input', requestId);
      await setDoc(operationalInputRef, {
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
        // Last tab, maybe go to a summary page or back to the list
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

  if (!currentTab) {
    // This can happen if the slug is invalid, redirect to the first tab
    if(requestId) {
        router.replace(`/operational-input/${requestId}/${tabs[0].id}`);
    } else {
        router.replace('/ckc-requests');
    }
    return <div>Loading...</div>;
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
          <Tabs value={activeTab}>
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
            <TabsContent value={activeTab}>
                <Suspense fallback={<div>Loading form...</div>}>
                    <JsonSchemaForm
                        key={activeTab} // Ensures re-render on tab change
                        schema={currentTab.schema}
                        onSubmit={handleNext}
                        onCancel={handleBack}
                        requestId={requestId}
                        dataKey={currentTab.id.replace(/-/g, '_')}
                    />
                </Suspense>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
