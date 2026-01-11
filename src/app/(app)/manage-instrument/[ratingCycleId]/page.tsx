
'use client';

import { useParams, useRouter } from "next/navigation";
import useSWR from 'swr';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { RatingNote } from '@/lib/definitions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InstrumentDetailsTab } from "@/components/manage-instrument/instrument-details-tab";
import { LatestBankDetailsTab } from "@/components/manage-instrument/latest-bank-details-tab";
import { AnnexureVHistoryTab } from "@/components/manage-instrument/annexure-v-history-tab";
import { PressReleaseHistoryTab } from "@/components/manage-instrument/press-release-history-tab";
import { DMSDocumentHistoryTab } from "@/components/manage-instrument/dms-document-history-tab";


const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ManageInstrumentPage() {
  const router = useRouter();
  const params = useParams();
  const ratingCycleId = params.ratingCycleId as string;

   const { data: note, isLoading } = useSWR<RatingNote>(
      ratingCycleId ? `/api/notes/${ratingCycleId}` : null, 
      fetcher
    );
  
  if (isLoading) {
      return (
          <div className="space-y-6">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-6 w-1/2" />
              <div className="flex justify-end">
                <Skeleton className="h-10 w-48" />
              </div>
              <Skeleton className="h-10 w-full border-b" />
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
              Add, modify, and review all instrument details for this rating cycle.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/manage-instrument/update-inc-status')}>
            Update INC Status
          </Button>
      </header>
      
      <Tabs defaultValue="instrument-details" className="w-full">
        <TabsList>
            <TabsTrigger value="instrument-details">Instrument Details</TabsTrigger>
            <TabsTrigger value="latest-bank-details">Latest Bank Details</TabsTrigger>
            <TabsTrigger value="annexure-v-history">Annexure V History</TabsTrigger>
            <TabsTrigger value="press-release-history">PR Details History</TabsTrigger>
            <TabsTrigger value="dms-document-history">DMS Document History</TabsTrigger>
        </TabsList>
        <TabsContent value="instrument-details" className="mt-4">
            <InstrumentDetailsTab />
        </TabsContent>
        <TabsContent value="latest-bank-details" className="mt-4">
            <LatestBankDetailsTab />
        </TabsContent>
        <TabsContent value="annexure-v-history" className="mt-4">
            <AnnexureVHistoryTab />
        </TabsContent>
        <TabsContent value="press-release-history" className="mt-4">
            <PressReleaseHistoryTab />
        </TabsContent>
        <TabsContent value="dms-document-history" className="mt-4">
            <DMSDocumentHistoryTab />
        </TabsContent>
      </Tabs>

    </div>
  );
}
