'use client';

import { Button } from "@/components/ui/button";
import { useWorkflow } from "@/context/workflow-context";
import { ArrowRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function DueDiligencePage() {
  const router = useRouter();
  const params = useParams();
  const { completeStep } = useWorkflow();
  const ratingCycleId = params.ratingCycleId as string;

  const handleSubmit = () => {
    // TODO: Add actual data saving logic
    completeStep('due-diligence');
    router.push(`/manage-instrument/${ratingCycleId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Due Diligence</h1>
        <p className="text-muted-foreground">
          Step 3: Complete due diligence checklist. (Placeholder)
        </p>
      </div>

      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        <p>This is a placeholder for the Due Diligence screen.</p>
        <p>A form or checklist for due diligence items would be displayed here.</p>
      </div>
      
       <div className="flex justify-end gap-4">
          <Button type="button" onClick={handleSubmit}>
            Save & Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
      </div>
    </div>
  );
}
