'use client';

import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkflow } from '@/context/workflow-context';

export const workflowSteps = [
  { id: 'due-diligence', name: 'Due Diligence' },
  { id: 'manage-instrument', name: 'Manage Instrument' },
  { id: 'initiate-rating-note', name: 'Initiate Rating Note' },
  { id: 'rating-note', name: 'Generate Rating Note' },
  { id: 'press-release', name: 'Press Release' },
];

export const dueDiligenceSubSteps = [
    { id: 'auditor-feedback', name: 'Auditor Feedback' },
    { id: 'banker-feedback', name: 'Banker Feedback' },
    { id: 'dta-feedback', name: 'DTA Feedback' },
    { id: 'ipa-feedback', name: 'IPA Feedback' },
    { id: 'management-discussion', name: 'Management Discussion' },
    { id: 'third-party-check', name: 'Third Party Check' },
    { id: 'audit-committee-meeting', name: 'Audit Committee Meeting' },
    { id: 'site-plant-visit', name: 'Site / Plant Visit' },
]

export function WorkflowStepper() {
  const pathname = usePathname();
  const params = useParams();
  const { completedSteps } = useWorkflow();
  const ratingCycleId = params.ratingCycleId as string;

  const getStepIdFromPath = () => {
    if (pathname.includes('/due-diligence')) return 'due-diligence';
    if (pathname.includes('/manage-instrument')) return 'manage-instrument';
    if (pathname.includes('/notes/new')) return 'initiate-rating-note';
    if (pathname.startsWith('/rating-note/')) return 'rating-note';
    if (pathname.startsWith('/press-release/')) return 'press-release';
    return '';
  }

  const currentStepId = getStepIdFromPath();
  const currentSubStepId = dueDiligenceSubSteps.find(s => pathname.includes(s.id))?.id;

  const getStepHref = (stepId: string) => {
      if (!ratingCycleId) return '#';
      if (stepId === 'initiate-rating-note') {
        return `/notes/new/${ratingCycleId}`;
      }
       if (stepId === 'rating-note') {
        return `/rating-note/${ratingCycleId}`;
      }
       if (stepId === 'press-release') {
        return `/press-release/${ratingCycleId}`;
      }
      if (stepId === 'due-diligence') {
        return `/due-diligence/auditor-feedback/${ratingCycleId}`;
      }
      return `/${stepId}/${ratingCycleId}`;
  }

  return (
    <nav aria-label="Progress" className="space-y-4">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {workflowSteps.map((step) => {
          const isCompleted = completedSteps.includes(step.id as any);
          const isCurrent = step.id === currentStepId;

          let status: 'complete' | 'current' | 'upcoming' = 'upcoming';
          if (isCompleted) status = 'complete';
          if (isCurrent) status = 'current';
          
           const stepClasses = cn(
            "group flex flex-col border-l-4 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
            {
              "border-green-600 hover:border-green-800": status === 'complete',
              "border-primary": status === 'current',
              "border-border hover:border-gray-300": status === 'upcoming'
            }
          );
          
           const mainTextClasses = cn("text-sm font-medium", {
            "text-green-600 group-hover:text-green-800": status === 'complete',
            "text-primary": status === 'current',
            "text-muted-foreground group-hover:text-foreground": status === 'upcoming',
          });

          const subTextClasses = cn("text-sm font-medium", { "text-muted-foreground": true });

          return (
            <li key={step.name} className="md:flex-1">
              <Link
                  href={getStepHref(step.id)}
                  className={stepClasses}
                  aria-current={status === 'current' ? 'step' : undefined}
                >
                <span className="flex items-center">
                  {status === 'complete' && <Check className="h-4 w-4 mr-2 text-green-600" />}
                  <span className={mainTextClasses}>{step.name}</span>
                </span>
                <span className={subTextClasses}>
                    {status === 'complete' && 'Completed'}
                    {status === 'current' && 'In Progress'}
                    {status === 'upcoming' && 'Not Started'}
                  </span>
                </Link>
            </li>
          )
        })}
      </ol>
      {currentStepId === 'due-diligence' && (
        <div className="pl-4 md:pl-0">
             <ol role="list" className="flex items-center space-x-4 border-l-2 border-primary pl-4 ml-4 md:ml-[calc(14.2%)] md:border-l-0 md:border-t-2 md:pt-2">
                {dueDiligenceSubSteps.map(subStep => {
                    const isSubStepCurrent = subStep.id === currentSubStepId;
                    return (
                        <li key={subStep.id}>
                            <Link href={`/due-diligence/${subStep.id}/${ratingCycleId}`} className={cn(
                                "text-xs font-medium transition-colors",
                                isSubStepCurrent ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}>
                                {subStep.name}
                            </Link>
                        </li>
                    )
                })}
            </ol>
        </div>
      )}
    </nav>
  );
}
