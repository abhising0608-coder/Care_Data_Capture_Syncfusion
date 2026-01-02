'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Loader, Play, Pause, RefreshCw, AlertTriangle, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Role } from '@/lib/definitions';

const testScenarios = [
  // Initiation by Rating Analyst
  { role: 'RATING_ANALYST', action: 'Log in and navigate to Dashboard', status: 'pending', duration: 1000 },
  { role: 'RATING_ANALYST', action: 'Start new workflow for AutoTest Pharma Ltd.', status: 'pending', duration: 1500 },
  { role: 'RATING_ANALYST', action: 'Auto-fill Company Information form', status: 'pending', duration: 2000 },
  { role: 'RATING_ANALYST', action: 'Save and proceed to Operational Input', status: 'pending', duration: 1000 },
  { role: 'RATING_ANALYST', action: 'Auto-fill Operational Input (Pharma)', status: 'pending', duration: 2000 },
  { role: 'RATING_ANALYST', action: 'Save and proceed to Financial Input', status: 'pending', duration: 1000 },
  { role: 'RATING_ANALYST', action: 'Auto-fill Financial Input', status: 'pending', duration: 1500 },
  { role: 'RATING_ANALYST', action: 'Save and proceed to Note Initiation', status: 'pending', duration: 1000 },
  { role: 'RATING_ANALYST', action: 'Initiate Rating Note with default template', status: 'pending', duration: 1500 },
  { role: 'RATING_ANALYST', action: 'Generate draft content in RN Editor', status: 'pending', duration: 1500 },
  { role: 'RATING_ANALYST', action: 'Submit Rating Note to Group Head', status: 'pending', duration: 1000 },
  // Group Head Review
  { role: 'GROUP_HEAD', action: 'Log in as Group Head', status: 'pending', duration: 1000 },
  { role: 'GROUP_HEAD', action: 'Open note from dashboard', status: 'pending', duration: 1000 },
  { role: 'GROUP_HEAD', action: 'Apply minor edits to the document', status: 'pending', duration: 1500 },
  { role: 'GROUP_HEAD', action: 'Submit to QC for review', status: 'pending', duration: 1000 },
  // QC Review
  { role: 'QC', action: 'Log in as QC', status: 'pending', duration: 1000 },
  { role: 'QC', action: 'Open note for review (read-only)', status: 'pending', duration: 1000 },
  { role: 'QC', action: 'Approve note and send back to GH', status: 'pending', duration: 1000 },
  // Group Head to CC
  { role: 'GROUP_HEAD', action: 'Log in as Group Head', status: 'pending', duration: 1000 },
  { role: 'GROUP_HEAD', action: 'Submit QC-Approved note to Care Committee', status: 'pending', duration: 1000 },
  // CC Review
  { role: 'RATING_COMMITTEE', action: 'Log in as Care Committee', status: 'pending', duration: 1000 },
  { role: 'RATING_COMMITTEE', action: 'Open note for review (read-only)', status: 'pending', duration: 1000 },
  { role: 'RATING_COMMITTEE', action: 'Approve note and send back to GH', status: 'pending', duration: 1000 },
  // Final Handoffs
  { role: 'GROUP_HEAD', action: 'Log in as Group Head', status: 'pending', duration: 1000 },
  { role: 'GROUP_HEAD', action: 'Send CC-Approved note to RA for RR/PR generation', status: 'pending', duration: 1000 },
  // Final Docs by RA
  { role: 'RATING_ANALYST', action: 'Log in as Rating Analyst', status: 'pending', duration: 1000 },
  { role: 'RATING_ANALYST', action: 'Generate Rating Rationale (RR)', status: 'pending', duration: 1500 },
  { role: 'RATING_ANALYST', action: 'Generate Press Release (PR)', status: 'pending', duration: 1500 },
  { role: 'RATING_ANALYST', action: 'Submit all final documents to Group Head', status: 'pending', duration: 1000 },
  // Final Approval by GH
  { role: 'GROUP_HEAD', action: 'Log in as Group Head for final review', status: 'pending', duration: 1000 },
  { role: 'GROUP_HEAD', action: 'Perform final review of all documents', status: 'pending', duration: 1500 },
  { role: 'GROUP_HEAD', action: 'Give Final Approval. Workflow Complete.', status: 'pending', duration: 1000 },
];

type ScenarioStatus = 'pending' | 'running' | 'pass' | 'fail';

export function E2ETestRunner() {
  const [scenarios, setScenarios] = useState(testScenarios.map(s => ({ ...s, status: 'pending' as ScenarioStatus })));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTest = () => {
    resetTest();
    setIsRunning(true);
    setIsTestComplete(false);
  };
  
  const pauseTest = () => {
    setIsRunning(false);
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
    }
  };

  const resumeTest = () => {
    setIsRunning(true);
  }

  const resetTest = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setScenarios(testScenarios.map(s => ({ ...s, status: 'pending' as ScenarioStatus })));
    setIsTestComplete(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
  
  useEffect(() => {
    if (isRunning && currentStep < scenarios.length) {
      // Mark current step as running
      setScenarios(prev => prev.map((s, i) => i === currentStep ? { ...s, status: 'running' } : s));

      const duration = scenarios[currentStep].duration;

      intervalRef.current = setTimeout(() => {
        // Mark current step as pass
        setScenarios(prev => prev.map((s, i) => i === currentStep ? { ...s, status: 'pass' } : s));
        setCurrentStep(prev => prev + 1);
      }, duration);

    } else if (currentStep >= scenarios.length && isRunning) {
      // Test finished
      setIsRunning(false);
      setIsTestComplete(true);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isRunning, currentStep, scenarios.length]);
  
  const getRoleBadgeColor = (role: Role | string) => {
    switch (role) {
      case 'RATING_ANALYST': return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'GROUP_HEAD': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'QC': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'RATING_COMMITTEE': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const StatusIcon = ({ status }: { status: ScenarioStatus }) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Loader className="h-5 w-5 animate-spin text-blue-500" />;
      case 'fail':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'pending':
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };
  
  return (
    <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
            <h3 className="text-lg font-semibold">Test Controls</h3>
            <div className="flex items-center gap-2">
                {!isRunning && !isTestComplete && (
                     <Button onClick={startTest} className="gap-2">
                        <Play className="h-4 w-4" /> Start Test
                    </Button>
                )}
                {isRunning && (
                     <Button onClick={pauseTest} variant="outline" className="gap-2">
                        <Pause className="h-4 w-4" /> Pause
                    </Button>
                )}
                {!isRunning && currentStep > 0 && !isTestComplete && (
                     <Button onClick={resumeTest} className="gap-2">
                        <Play className="h-4 w-4" /> Resume
                    </Button>
                )}
                 <Button onClick={resetTest} variant="destructive" className="gap-2">
                    <RefreshCw className="h-4 w-4" /> Reset
                </Button>
            </div>
        </div>

      <div className="border rounded-lg p-4 space-y-2 max-h-[60vh] overflow-y-auto">
        {scenarios.map((scenario, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between p-3 rounded-md transition-all duration-300",
              scenario.status === 'running' ? 'bg-blue-50' : 'bg-white',
              scenario.status === 'pass' ? 'bg-green-50 opacity-70' : ''
            )}
          >
            <div className="flex items-center gap-4">
              <StatusIcon status={scenario.status} />
              <div className="flex flex-col">
                <p className={cn("font-medium", scenario.status === 'pass' ? 'text-gray-600' : 'text-gray-900')}>
                    {scenario.action}
                </p>
                 <div className="flex items-center gap-2">
                    <span className={cn('px-2 py-0.5 text-xs font-semibold rounded-full border', getRoleBadgeColor(scenario.role))}>
                        {scenario.role.replace(/_/g, ' ')}
                    </span>
                 </div>
              </div>
            </div>
            {scenario.status === 'pass' && <Check className="h-5 w-5 text-green-600" />}
          </div>
        ))}
      </div>

       <div className="flex items-center justify-center p-4 border rounded-lg bg-slate-50 text-lg">
            {isTestComplete ? (
                 <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-6 w-6" />
                    <p className="font-bold">Test Complete: All scenarios passed successfully!</p>
                </div>
            ) : isRunning ? (
                 <div className="flex items-center gap-2 text-blue-600">
                    <Loader className="h-6 w-6 animate-spin" />
                    <p className="font-bold">Test in Progress...</p>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-gray-500">
                    <Play className="h-6 w-6" />
                    <p className="font-bold">Test Paused or Ready to Start</p>
                </div>
            )}
       </div>
    </div>
  );
}
