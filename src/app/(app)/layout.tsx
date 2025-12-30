'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { FirebaseClientProvider } from '@/firebase';
import { WorkflowProvider } from '@/context/workflow-context';
import { WorkflowStepper } from '@/components/workflow-stepper';
import { usePathname } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showStepper = /^\/(company-information|operational-input|financial-input|notes\/new|rating-note)\/.+/.test(pathname);

  return (
      <FirebaseClientProvider>
        <WorkflowProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <AppHeader />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
                {showStepper && <WorkflowStepper />}
                <div className={showStepper ? "mt-8" : ""}>
                  {children}
                </div>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </WorkflowProvider>
      </FirebaseClientProvider>
  );
}
