'use client';

import { useParams, useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Step1Form } from '@/components/initiate-rating-note/step-1-form';
import { Step2Form } from '@/components/initiate-rating-note/step-2-form';
import { Step3Form } from '@/components/initiate-rating-note/step-3-form';
import { Step4Form } from '@/components/initiate-rating-note/step-4-form';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useWorkflow } from '@/context/workflow-context';
import { ArrowRight } from 'lucide-react';

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
  const firestore = useFirestore();
  const { completeStep } = useWorkflow();

  const methods = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      step1: { companyId: '', templateId: '' },
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
        ratingCommitteeType: '',
        analystRemarks: '',
      }
    },
  });

  const onSubmit = async (data: any) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to create a note.',
      });
      return;
    }
    
    const companyId = ratingCycleId;
    const noteName = `${companyId} Surveillance Note`;

    const notePayload = {
      noteName,
      companyId: companyId,
      templateId: methods.getValues('step1.templateId'),
      analysts: [user.uid],
      status: 'In Progress',
      financialApproach: methods.getValues('step3.financialApproach'),
      financialYearFrom: methods.getValues('step3.financialYearFrom'),
      financialYearTo: methods.getValues('step3.financialYearTo'),
      currencyDenomination: methods.getValues('step3.currencyDenomination'),
      scale: methods.getValues('step3.scale'),
      applicableCriteria: methods.getValues('step3.applicableCriteria'),
      ratingCommitteeType: methods.getValues('step4.ratingCommitteeType'),
      analystRemarks: methods.getValues('step4.analystRemarks'),
      createdAt: serverTimestamp(),
      lastModified: serverTimestamp(),
      createdBy: user.uid,
      rcmDate: null,
      sections: {},
    };

    try {
      const notesCollection = collection(firestore, 'ratingNotes');
      const docRef = await addDoc(notesCollection, notePayload);
      toast({
        title: 'Success!',
        description: `Rating note for ${companyId} has been initiated.`,
      });
      completeStep('initiate-rating-note');
      router.push(`/rating-note/${docRef.id}`);
    } catch (error) {
       console.error("Firestore error:", error);
      toast({
        variant: 'destructive',
        title: 'Firestore Error',
        description: 'Failed to create the rating note.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Initiate New Rating Note
        </h1>
        <p className="text-muted-foreground">
          Step 4: Confirm details to formally initiate the rating note.
        </p>
      </header>
      
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="mt-8">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-8">
            <Step1Form />
            <Step4Form />
          </div>

          <div className="flex justify-end mt-8">
             <Button type="submit">
                Initiate and Proceed to Rating Note
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
