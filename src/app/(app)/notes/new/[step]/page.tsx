'use client';

import { useParams, useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Stepper } from '@/components/initiate-rating-note/stepper';
import { Step1Form } from '@/components/initiate-rating-note/step-1-form';
import { Step2Form } from '@/components/initiate-rating-note/step-2-form';
import { Step3Form } from '@/components/initiate-rating-note/step-3-form';
import { Step4Form } from '@/components/initiate-rating-note/step-4-form';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const steps = [
  { id: 'step-1', name: 'Select Company & Template' },
  { id: 'step-2', name: 'Role Clarification' },
  { id: 'step-3', name: 'Define Parameters' },
  { id: 'step-4', name: 'Review & Create' },
];

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
});

export default function NewRatingNotePage() {
  const router = useRouter();
  const params = useParams();
  const currentStep = params.step as string;
  const { user } = useAuth();
  const { toast } = useToast();
  const firestore = useFirestore();

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
    },
  });

  const stepIndex = steps.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    const nextStep = steps[stepIndex + 1];
    if (nextStep) {
      router.push(`/notes/new/${nextStep.id}`);
    }
  };

  const handleBack = () => {
    const prevStep = steps[stepIndex - 1];
    if (prevStep) {
      router.push(`/notes/new/${prevStep.id}`);
    } else {
      router.push('/dashboard'); // Or wherever back from step 1 should go
    }
  };

  const onSubmit = async (data: any) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to create a note.',
      });
      return;
    }
    
    // This is a temporary way to get the company name label, should be improved
    const company = (methods.getValues('step1.companyId') as any)?.label || 'Selected Company';
    const noteName = `${company} Surveillance Note`;

    const notePayload = {
      noteName,
      companyId: methods.getValues('step1.companyId'),
      templateId: methods.getValues('step1.templateId'),
      analysts: [user.uid],
      status: 'In Progress',
      financialApproach: methods.getValues('step3.financialApproach'),
      financialYearFrom: methods.getValues('step3.financialYearFrom'),
      financialYearTo: methods.getValues('step3.financialYearTo'),
      currencyDenomination: methods.getValues('step3.currencyDenomination'),
      scale: methods.getValues('step3.scale'),
      applicableCriteria: methods.getValues('step3.applicableCriteria'),
      createdAt: serverTimestamp(),
      lastModified: serverTimestamp(),
      createdBy: user.uid,
      rcmDate: null,
      sections: {}, // Will be populated later
    };

    try {
      const notesCollection = collection(firestore, 'ratingNotes');
      const docRef = await addDoc(notesCollection, notePayload);
      toast({
        title: 'Success!',
        description: `Rating note for ${company} has been created.`,
      });
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create New Rating Note
        </h1>
        <p className="text-muted-foreground">
          Follow the steps to initiate a new rating note.
        </p>
      </header>
      
      <Stepper steps={steps} currentStep={stepIndex} />

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="mt-8">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            {currentStep === 'step-1' && <Step1Form />}
            {currentStep === 'step-2' && <Step2Form />}
            {currentStep === 'step-3' && <Step3Form />}
            {currentStep === 'step-4' && <Step4Form />}
          </div>

          <div className="flex justify-between mt-8">
            <Button type="button" variant="outline" onClick={handleBack} disabled={stepIndex === 0}>
              Back
            </Button>
            {stepIndex < steps.length - 1 ? (
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button type="submit">
                Create Note and Start
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
