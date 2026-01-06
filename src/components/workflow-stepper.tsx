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
    // Match both /rating-note/[id] and /rating-note/final-documents/[id]
    if (pathname.startsWith('/rating-note/')) return 'rating-note';
    return '';
  }

  const currentStepId = getStepIdFromPath();
  const currentStepIndex = workflowSteps.findIndex(step => step.id === currentStepId);

  const getStepHref = (stepId: string) => {
      if (!ratingCycleId) return '#';
      if (stepId === 'initiate-rating-note') {
        return `/notes/new/${ratingCycleId}`;
      }
       if (stepId === 'rating-note') {
        return `/rating-note/${ratingCycleId}`;
      }
      return `/${stepId}/${ratingCycleId}`;
  }

  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {workflowSteps.map((step, stepIdx) => {
          const isCompleted = completedSteps.includes(step.id) && step.id !== currentStepId;
          const isCurrent = step.id === currentStepId;

          let status: 'complete' | 'current' | 'upcoming' = 'upcoming';
          if (isCompleted) {
            status = 'complete';
          } else if (isCurrent) {
            status = 'current';
          }
          
          const stepClasses = cn(
            "group flex flex-col border-l-4 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
            {
              "border-green-600 hover:border-green-800": status === 'complete',
              "border-primary": status === 'current',
              "border-border hover:border-gray-300": status === 'upcoming'
            }
          );
          
           const mainTextClasses = cn("text-sm font-medium", {
            "text-green-600": status === 'complete',
            "text-primary": status === 'current',
            "text-muted-foreground group-hover:text-foreground": status === 'upcoming',
          });

          const subTextClasses = cn("text-sm font-medium", {
             "text-muted-foreground": true
          });


          return (
            <li key={step.name} className="md:flex-1">
              <Link
                  href={isCompleted ? getStepHref(step.id) : '#'}
                  className={cn(stepClasses, !isCompleted && "pointer-events-none")}
                  aria-current={status === 'current' ? 'step' : undefined}
                >
                <span className="flex items-center">
                  {status === 'complete' && <Check className="h-4 w-4 mr-2 text-green-600" />}
                  <span className={mainTextClasses}>{step.name}</span>
                </span>
                <span className={subTextClasses}>
                    {status === 'complete' && 'Completed'}
                    {status === 'current' && 'Current Step'}
                    {status === 'upcoming' && 'Upcoming'}
                  </span>
                </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  );
}
