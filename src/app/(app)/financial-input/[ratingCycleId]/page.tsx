
'use client';

import { Button } from "@/components/ui/button";
import { useWorkflow } from "@/context/workflow-context";
import { ArrowRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function FinancialInputPage() {
  const router = useRouter();
  const params = useParams();
  const { completeStep } = useWorkflow();
  const ratingCycleId = params.ratingCycleId as string;

  const handleProceed = () => {
    completeStep('financial-input');
    router.push(`/operational-input/${ratingCycleId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Financial Input</h1>
        <p className="text-muted-foreground">
          Proceed to the next step to enter operational data.
        </p>
      </div>

      <div className="flex justify-end gap-4">
          <Button type="button" onClick={handleProceed}>
            Proceed
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
      </div>
    </div>
  );
}
