'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader, XCircle, Play, Pause, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const testScenarios = [
  {
    role: "Rating Analyst (RA)",
    action: "Initiate workflow for an approved request.",
    status: "PASS",
    details: "RA clicks 'Initiate' on an accepted request, starting the 3-step process."
  },
  {
    role: "Rating Analyst (RA)",
    action: "Complete initiation and create Draft note.",
    status: "PASS",
    details: "RA successfully completes Company Info, Operational, and Financial inputs. A new note is created with 'Draft' status."
  },
  {
    role: "Rating Analyst (RA)",
    action: "Submit Draft note to Group Head.",
    status: "PASS",
    details: "Note status changes to 'In Review (GH)'. It disappears from the RA's queue and appears in the GH's queue."
  },
  {
    role: "Group Head (GH)",
    action: "Review note and send back for Rework.",
    status: "PASS",
    details: "GH makes edits (with Track Changes) and sends back. Status changes to 'Rework Requested'. Note returns to RA's queue."
  },
  {
    role: "Rating Analyst (RA)",
    action: "Address rework and re-submit to GH.",
    status: "PASS",
    details: "RA sees tracked changes, makes corrections, and re-submits. Status returns to 'In Review (GH)'."
  },
  {
    role: "Group Head (GH)",
    action: "Submit note to Quality Control (QC).",
    status: "PASS",
    details: "Note status changes to 'In Review (QC)'. GH dashboard shows status as 'Forwarded to QC'."
  },
  {
    role: "Quality Control (QC)",
    action: "Review note and send back to GH.",
    status: "PASS",
    details: "QC finds an issue and sends back. Status becomes 'Rework Requested (GH)'. Note returns to GH's queue."
  },
  {
    role: "Group Head (GH)",
    action: "Correct QC issue and re-submit to QC.",
    status: "PASS",
    details: "GH makes a direct edit and re-submits to QC. Status returns to 'In Review (QC)'."
  },
  {
    role: "Quality Control (QC)",
    action: "Approve note and submit to GH.",
    status: "PASS",
    details: "Note status changes to 'QC Approved'. Note returns to GH's queue."
  },
  {
    role: "Group Head (GH)",
    action: "Submit note to Care Committee (CC).",
    status: "PASS",
    details: "Status changes to 'In Review (CC)'. Note appears on CC's dashboard."
  },
  {
    role: "Care Committee (CC)",
    action: "Approve note and submit to GH.",
    status: "PASS",
    details: "Status changes to 'CC Approved'. Note returns to GH's queue."
  },
  {
    role: "Group Head (GH)",
    action: "Send note to RA for final document generation.",
    status: "PASS",
    details: "Status changes to 'Pending RR & PR (RA)'. Note appears in RA's queue. Main RN is locked."
  },
  {
    role: "Rating Analyst (RA)",
    action: "Generate RR and PR documents.",
    status: "PASS",
    details: "RA accesses the final docs page. RR and PR editors correctly load with templates."
  },
  {
    role: "Rating Analyst (RA)",
    action: "Submit all final documents to GH.",
    status: "PASS",
    details: "Status changes to 'In Final Review (GH)'. Note appears in GH's queue for final approval."
  },
  {
    role: "Group Head (GH)",
    action: "Perform final review and approve.",
    status: "PASS",
    details: "GH reviews all documents and gives final approval."
  },
  {
    role: "System",
    action: "Complete and close the workflow.",
    status: "PASS",
    details: "Note status changes to 'Completed'. The end-to-end workflow is successful."
  }
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
        <CardTitle>Test Automation Dashboard</CardTitle>
        <CardDescription>
            Watch the simulated test run. Current progress: {currentStep} / {testScenarios.length} steps.
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
