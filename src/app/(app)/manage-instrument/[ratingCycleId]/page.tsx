'use client';

import { Button } from "@/components/ui/button";
import { useWorkflow } from "@/context/workflow-context";
import { Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InstrumentDetailsTab } from "@/components/manage-instrument/instrument-details-tab";
import { PressReleaseHistoryTab } from "@/components/manage-instrument/press-release-history-tab";
import useSWR from 'swr';
import type { RatingNote } from '@/lib/definitions';
import { Skeleton } from "@/components/ui/skeleton";
import { LatestBankDetailsTab } from "@/components/manage-instrument/latest-bank-details-tab";
import { AnnexureVHistoryTab } from "@/components/manage-instrument/annexure-v-history-tab";


const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ManageInstrumentPage() {
  const router = useRouter();
  const params = useParams();
  const { completeStep } = useWorkflow();
  const ratingCycleId = params.ratingCycleId as string;
  const { toast } = useToast();

   const { data: note, isLoading } = useSWR<RatingNote>(
      ratingCycleId ? `/api/notes/${ratingCycleId}` : null, 
      fetcher
    );

  const handleSubmit = () => {
    // TODO: Add actual data saving logic from the forms inside the tabs
    completeStep('manage-instrument');
    toast({
      title: 'Manage Instrument Complete',
      description: 'Step has been marked as complete.',
    });
  };
  
  if (isLoading) {
      return (
          <div className="space-y-6">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-6 w-1/2" />
              <div className="flex justify-end">
                <Skeleton className="h-10 w-48" />
              </div>
              <Skeleton className="h-96 w-full" />
          </div>
      )
  }

  return (
    <div className="space-y-6">
       <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Manage Instrument: {note?.companyName}
            </h1>
            <p className="text-muted-foreground">
              Step 4: Add, modify, and review all instrument details for this rating cycle.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button type="button" onClick={handleSubmit}>
              <Save className="mr-2 h-4 w-4" />
              Save & Mark as Complete
            </Button>
          </div>
      </header>
      
      <Tabs defaultValue="instrument-details">
        <TabsList>
          <TabsTrigger value="instrument-details">Instrument Details</TabsTrigger>
          <TabsTrigger value="latest-bank-details">Latest Bank Details</TabsTrigger>
          <TabsTrigger value="annexure-v-history">Annexure V History</TabsTrigger>
          <TabsTrigger value="press-release-history">Press Release History</TabsTrigger>
        </TabsList>
        <TabsContent value="instrument-details">
          <InstrumentDetailsTab />
        </TabsContent>
        <TabsContent value="latest-bank-details">
          <LatestBankDetailsTab />
        </TabsContent>
         <TabsContent value="annexure-v-history">
          <AnnexureVHistoryTab />
        </TabsContent>
        <TabsContent value="press-release-history">
          <PressReleaseHistoryTab />
        </TabsContent>
      </Tabs>

    </div>
  );
}
