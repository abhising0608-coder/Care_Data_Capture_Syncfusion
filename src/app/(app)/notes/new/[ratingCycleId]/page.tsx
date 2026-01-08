
'use client';

import { useParams, useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useSWR from 'swr';
import { useEffect } from 'react';

import { Step1Form } from '@/components/initiate-rating-note/step-1-form';
import { Step2Form } from '@/components/initiate-rating-note/step-2-form';
import { Step3Form } from '@/components/initiate-rating-note/step-3-form';
import { Step4Form } from '@/components/initiate-rating-note/step-4-form';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useWorkflow } from '@/context/workflow-context';
import { ArrowRight } from 'lucide-react';
import type { RatingNote, CKCRequest } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

const fetcher = (url: string) => fetch(url).then(res => res.json());


const validationSchema = z.object({
  step1: z.object({
    companyId: z.string().min(1, 'Company is required'),
    templateId: z.string().min(1, 'Template is required'),
  }),
  step2: z.object({
    comments: z.string().optional(),
  }),
  step3: z.object({
    financialApproach: z.string(),
    financialYearFrom: z.number(),
    financialYearTo: z.number(),
    currencyDenomination: z.string(),
    scale: z.string(),
    applicableCriteria: z.array(z.string()).optional(),
  }),
   step4: z.object({
    ratingCommitteeType: z.string().min(1, 'Rating Committee Type is required.'),
    analystRemarks: z.string().optional(),
  })
});

export default function NewRatingNotePage() {
  const router = useRouter();
  const params = useParams();
  const ratingCycleId = params.ratingCycleId as string;
  const { user } = useAuth();
  const { toast } = useToast();
  const { completeStep } = useWorkflow();

  const { data: request, isLoading } = useSWR<CKCRequest>(
    ratingCycleId ? `/api/requests/${ratingCycleId}` : null, 
    fetcher
  );

  const methods = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      step1: { companyId: '', templateId: 'template-001' },
      step2: { comments: '' },
      step3: {
        financialApproach: 'Standalone',
        financialYearFrom: new Date().getFullYear(),
        financialYearTo: new Date().getFullYear() + 1,
        currencyDenomination: 'INR',
        scale: 'Crores',
        applicableCriteria: [],
      },
       step4: {
        ratingCommitteeType: 'standard',
        analystRemarks: '',
      }
    },
  });

  useEffect(() => {
    if (request) {
        methods.setValue('step1.companyId', request.companyId);
        methods.setValue('step3.financialApproach', request.resultType);
    }
  }, [request, methods]);

  const onSubmit = async (data: any) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to create a note.',
      });
      return;
    }
    
    if(!request) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Original request data not found.',
      });
      return;
    }

    const notePayload = {
      id: request.id,
      companyId: request.companyId,
      companyName: request.companyName,
      ratingCycle: request.cycle,
      priority: 'Medium',
      dueDate: 'N/A',
      status: 'Draft',
      currentActor: 'RATING_ANALYST',
      initiatedBy: user.uid,
      ghId: request.groupHead,
      statusHistory: [
        { status: 'Draft', actorId: user.uid, timestamp: new Date().toISOString() }
      ],
      // This is a partial payload; the API will fill in the rest
    };

    try {
      const res = await fetch(`/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notePayload),
      });

      if (!res.ok) {
        throw new Error('Failed to create note');
      }
      
      const newNote = await res.json();
      
      toast({
        title: 'Success!',
        description: `Rating note for ${newNote.companyName} has been initiated.`,
      });
      completeStep('initiate-rating-note');
      router.push(`/rating-note/${newNote.id}`);

    } catch (error) {
       console.error("API error:", error);
      toast({
        variant: 'destructive',
        title: 'API Error',
        description: 'Failed to create the rating note via API.',
      });
    }
  };

  if (isLoading || !request) {
      return (
          <div className="space-y-6">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-96 w-full" />
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Initiate New Rating Note
        </h1>
        <p className="text-muted-foreground">
          Step 5: Confirm details to formally initiate the rating note.
        </p>
      </header>
      
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="mt-8">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-8">
            <Step1Form companyName={request.companyName} />
            <Step4Form />
          </div>

          <div className="flex justify-end mt-8">
             <Button type="submit">
                Initiate and Proceed to Generate Rating Note
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
