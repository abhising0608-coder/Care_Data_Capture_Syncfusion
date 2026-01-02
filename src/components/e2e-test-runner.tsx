'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader, XCircle, Play, Pause, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const testScenarios = [
  // Step 1-2: RA Login and Company Selection
  {
    role: 'Rating Analyst (RA)',
    action: 'Login and select company "AutoTest Pharma Ltd".',
    status: 'PASS',
    details: 'Auto-logins as rating.analyst@careedge and opens the company journey.',
  },
  // Step 3-5: Auto-fill Initiation Forms
  {
    role: 'Rating Analyst (RA)',
    action: 'Auto-fill all initiation forms.',
    status: 'PASS',
    details: 'Populates Company Information, Financial Input, and Operational Input with mock data.',
  },
  // Step 6-7: Initiate and Generate Rating Note
  {
    role: 'Rating Analyst (RA)',
    action: 'Initiate and generate draft Rating Note (RN).',
    status: 'PASS',
    details: 'Selects default template, opens editor, auto-generates content, and saves as Draft.',
  },
  // Step 8: Submit to GH
  {
    role: 'Rating Analyst (RA)',
    action: 'Submit RN to Group Head.',
    status: 'PASS',
    details: 'Status changes to "In Review (GH)". RA logs out.',
  },
  // Step 9-10: GH Review
  {
    role: 'Group Head (GH)',
    action: 'Login, review, and edit the RN.',
    status: 'PASS',
    details: 'Logs in as group.head@careedge, opens the RN, and auto-applies minor text edits.',
  },
  // Step 11: Submit to QC
  {
    role: 'Group Head (GH)',
    action: 'Submit RN to Quality Control (QC).',
    status: 'PASS',
    details: 'Status changes to "In Review (QC)". GH logs out.',
  },
  // Step 12-13: QC Review and Approval
  {
    role: 'Quality Control (QC)',
    action: 'Login, review, and approve the RN.',
    status: 'PASS',
    details: 'Logs in as qc@careedge, reviews in read-only mode, and approves. Status changes to "QC Approved".',
  },
  // Step 14: GH to CC
  {
    role: 'Group Head (GH)',
    action: 'Submit RN to Care Committee.',
    status: 'PASS',
    details: 'Logs back in, submits the note. Status changes to "In Review (CC)".',
  },
  // Step 15-16: CC Review and Approval
  {
    role: 'Care Committee (CC)',
    action: 'Login, review, and approve the RN.',
    status: 'PASS',
    details: 'Logs in as cc@careedge, reviews, and approves. Status changes to "CC Approved".',
  },
  // Step 17: GH to RA for Final Docs
  {
    role: 'Group Head (GH)',
    action: 'Send note to RA for RR & PR Generation.',
    status: 'PASS',
    details: 'Logs back in, sends to RA. Status changes to "Pending RR & PR (RA)".',
  },
  // Step 18-19: RA Generates RR and PR
  {
    role: 'Rating Analyst (RA)',
    action: 'Generate Rating Rationale (RR) and Press Release (PR).',
    status: 'PASS',
    details: 'Logs back in, opens final docs screen, generates and saves both RR and PR.',
  },
  // Step 20: Final Submission
  {
    role: 'Rating Analyst (RA)',
    action: 'Submit all final documents to Group Head.',
    status: 'PASS',
    details: 'Final submission is made. Status changes to "In Final Review (GH)".',
  },
  {
    role: 'System',
    action: 'Complete and close the workflow.',
    status: 'PASS',
    details: 'Final approval from GH changes status to "Completed". The end-to-end workflow is successful.',
  },
];


export function E2ETestRunner() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<(typeof testScenarios[0])[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && currentStep < testScenarios.length) {
      interval = setInterval(() => {
        setResults(prev => [...prev, testScenarios[currentStep]]);
        setCurrentStep(prev => prev + 1);
      }, 2000); // 2 seconds per step
    } else if (currentStep === testScenarios.length) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, currentStep]);

  const handleStart = () => {
    if (results.length === testScenarios.length) {
      handleReset();
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setResults([]);
  };

  const progress = (currentStep / testScenarios.length) * 100;
  const isFinished = results.length === testScenarios.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Automated Workflow Simulation</CardTitle>
        <CardDescription>
            This is a real-time simulation of the entire workflow. Progress: {currentStep} / {testScenarios.length} steps.
        </CardDescription>
        <div className="flex items-center gap-4 pt-4">
          {!isRunning && !isFinished && (
            <Button onClick={handleStart}><Play className="mr-2 h-4 w-4" /> Start Test</Button>
          )}
           {isRunning && (
             <Button onClick={handlePause} variant="outline"><Pause className="mr-2 h-4 w-4" /> Pause</Button>
           )}
           {isFinished && (
            <Button onClick={handleReset} variant="destructive"><RefreshCw className="mr-2 h-4 w-4" /> Run Again</Button>
           )}
           {!isRunning && results.length > 0 && !isFinished && (
               <Button onClick={handleStart}><Play className="mr-2 h-4 w-4" /> Resume</Button>
           )}
        </div>
        <Progress value={progress} className="mt-4" />
      </CardHeader>
      <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto p-6">
        {results.map((result, index) => (
          <div key={index} className="flex items-start gap-4 p-4 border rounded-lg bg-card-foreground/5">
            <div>
              {result.status === "PASS" && <CheckCircle className="h-5 w-5 text-green-500" />}
              {result.status === "FAIL" && <XCircle className="h-5 w-5 text-red-500" />}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                <span className="font-bold text-primary">{`[${result.role}]`}</span> {result.action}
              </p>
              <p className="text-sm text-muted-foreground">{result.details}</p>
            </div>
            <div className="text-sm font-medium">
                <span className={`px-2 py-1 rounded-full text-xs ${result.status === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {result.status}
                </span>
            </div>
          </div>
        ))}
        {isRunning && currentStep < testScenarios.length && (
            <div className="flex items-center gap-4 p-4 border-l-4 border-blue-500 bg-blue-50">
                <Loader className="h-5 w-5 animate-spin text-blue-600" />
                <p className="font-semibold text-blue-800">
                    Running: [{testScenarios[currentStep].role}] - {testScenarios[currentStep].action}
                </p>
            </div>
        )}
        {isFinished && (
             <div className="flex items-center gap-4 p-4 border-l-4 border-green-500 bg-green-50">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="font-semibold text-green-800">
                    Test Complete. All {testScenarios.length} scenarios passed successfully.
                </p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
