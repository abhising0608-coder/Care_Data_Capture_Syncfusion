'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AuthProvider } from '@/hooks/use-auth';
import { FirebaseClientProvider } from '@/firebase';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FirebaseClientProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <AppHeader />
            <main className="flex-1 p-4 bg-background">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </FirebaseClientProvider>
    </AuthProvider>
  );
}
