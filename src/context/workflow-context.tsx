'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type StepId = 'operational-input' | 'due-diligence' | 'manage-instrument' | 'initiate-rating-note' | 'rating-note' | 'press-release';

interface WorkflowContextType {
  activeCompanyId: string | null;
  completedSteps: StepId[];
  startWorkflow: (companyId: string) => void;
  completeStep: (step: StepId) => void;
  resetWorkflow: () => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const WorkflowProvider = ({ children }: { children: ReactNode }) => {
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([]);

  const startWorkflow = useCallback((companyId: string) => {
    setActiveCompanyId(companyId);
    setCompletedSteps([]); // Reset steps for new workflow
  }, []);

  const completeStep = useCallback((step: StepId) => {
    setCompletedSteps((prevSteps) => {
      const newSteps = new Set([...prevSteps, step]);
      return Array.from(newSteps);
    });
  }, []);

  const resetWorkflow = useCallback(() => {
    setActiveCompanyId(null);
    setCompletedSteps([]);
  }, []);

  const value = {
    activeCompanyId,
    completedSteps,
    startWorkflow,
    completeStep,
    resetWorkflow,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};
