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

  const handleSubmit = () => {
    // TODO: Add actual data saving logic
    completeStep('financial-input');
    router.push(`/notes/new/${ratingCycleId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Financial Input</h1>
        <p className="text-muted-foreground">
          Step 3: Enter financial data for the company. (Placeholder)
        </p>
      </div>

      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        <p>This is a placeholder for the financial input screen.</p>
        <p>Standard Care Rating financial components for Revenue, EBITDA, Debt, and Key Ratios would be displayed here.</p>
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
