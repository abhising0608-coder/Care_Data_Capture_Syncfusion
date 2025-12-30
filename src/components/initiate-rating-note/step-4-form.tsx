'use client';

import { useFormContext } from 'react-hook-form';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between py-2 border-b">
    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
    <dd className="text-sm text-foreground text-right">{value}</dd>
  </div>
);

export function Step4Form() {
  const { getValues } = useFormContext();
  const firestore = useFirestore();

  const companiesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'companies');
  }, [firestore]);

  const templatesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'templates');
  }, [firestore]);


  const { data: companies } = useCollection(companiesCollection);
  const { data: templates } = useCollection(templatesCollection);

  const step1 = getValues('step1');
  const step2 = getValues('step2');
  const step3 = getValues('step3');

  const company = companies?.find(c => c.id === step1.companyId);
  const template = templates?.find(t => t.id === step1.templateId);

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-foreground">Review Your Selections</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-medium">Company & Template</h3>
          <dl>
            <InfoRow label="Company Name" value={company?.name || 'N/A'} />
            <InfoRow label="Template" value={template?.name || 'N/A'} />
          </dl>
        </div>
        <div className="space-y-4">
           <h3 className="font-medium">Parameters</h3>
            <dl>
                <InfoRow label="Financial Approach" value={step3.financialApproach} />
                <InfoRow label="Financial Year" value={`${step3.financialYearFrom} - ${step3.financialYearTo}`} />
                <InfoRow label="Currency" value={step3.currencyDenomination} />
                <InfoRow label="Scale" value={step3.scale} />
            </dl>
        </div>
        <div className="space-y-4 md:col-span-2">
            <h3 className="font-medium">Role Clarification Comments</h3>
            <p className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-md">
                {step2.comments || 'No comments provided.'}
            </p>
        </div>
      </div>
    </div>
  );
}
