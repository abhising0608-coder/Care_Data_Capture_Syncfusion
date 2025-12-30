'use client';

import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkflow } from '@/context/workflow-context';

export const workflowSteps = [
  { id: 'company-information', name: 'Company Information' },
  { id: 'operational-input', name: 'Operational Input' },
  { id: 'financial-input', name: 'Financial Input' },
  { id: 'initiate-rating-note', name: 'Initiate Rating Note' },
  { id: 'rating-note', name: 'Rating Note' },
];

export function WorkflowStepper() {
  const pathname = usePathname();
  const params = useParams();
  const { completedSteps } = useWorkflow();
  const ratingCycleId = params.ratingCycleId as string;

  const getStepIdFromPath = () => {
    if (pathname.includes('/company-information')) return 'company-information';
    if (pathname.includes('/operational-input')) return 'operational-input';
    if (pathname.includes('/financial-input')) return 'financial-input';
    if (pathname.includes('/notes/new')) return 'initiate-rating-note';
    if (pathname.includes('/rating-note')) return 'rating-note';
    return '';
  }

  const currentStepId = getStepIdFromPath();
  const currentStepIndex = workflowSteps.findIndex(step => step.id === currentStepId);

  const getStepHref = (stepId: string) => {
    switch(stepId) {
      case 'company-information': return `/company-information/${ratingCycleId}`;
      case 'operational-input': return `/operational-input/${ratingCycleId}`;
      case 'financial-input': return `/financial-input/${ratingCycleId}`;
      case 'initiate-rating-note': return `/notes/new/${ratingCycleId}`;
      case 'rating-note': return `/rating-note/${ratingCycleId}`; // Assuming note ID is same as cycle ID for now
      default: return '#';
    }
  }

  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {workflowSteps.map((step, stepIdx) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStepId;

          let status: 'complete' | 'current' | 'upcoming' = 'upcoming';
          if (isCompleted) {
            status = 'complete';
          }
          if (isCurrent) {
            status = 'current';
          }

          return (
            <li key={step.name} className="md:flex-1">
              {status === 'complete' ? (
                <Link
                  href={getStepHref(step.id)}
                  className="group flex flex-col border-l-4 border-primary py-2 pl-4 hover:border-primary-dark md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                >
                  <span className="text-sm font-medium text-primary">{step.name}</span>
                  <span className="text-sm font-medium text-muted-foreground">Completed</span>
                </Link>
              ) : status === 'current' ? (
                <Link
                  href={getStepHref(step.id)}
                  className="flex flex-col border-l-4 border-primary py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                  aria-current="step"
                >
                  <span className="text-sm font-medium text-primary">{step.name}</span>
                   <span className="text-sm font-medium text-muted-foreground">Current Step</span>
                </Link>
              ) : (
                <div
                  className="group flex flex-col border-l-4 border-border py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                >
                  <span className="text-sm font-medium text-muted-foreground">{step.name}</span>
                  <span className="text-sm font-medium text-muted-foreground">Upcoming</span>
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  );
}
