'use client';

import { Button } from "@/components/ui/button";
import { useWorkflow } from "@/context/workflow-context";
import { Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { InstrumentDetailsTab } from "@/components/manage-instrument/instrument-details-tab";
import useSWR from 'swr';
import type { RatingNote } from '@/lib/definitions';
import { Skeleton } from "@/components/ui/skeleton";


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
    // This action is now less relevant as there is no single "save and mark as complete" for the whole section.
    // Each sub-page might have its own save logic.
    // We can keep it to mark the entire "Manage Instrument" step as done.
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
              Add, modify, and review all instrument details for this rating cycle.
            </p>
          </div>
      </header>
      
      {/* The content of the selected sidebar item will be rendered here.
          For now, we default to showing the instrument details.
          In a more advanced setup, this could use a dynamic component based on the URL.
      */}
      <InstrumentDetailsTab />

    </div>
  );
}
