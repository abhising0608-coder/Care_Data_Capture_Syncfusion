'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FileText,
  Database,
  Briefcase,
  PenSquare,
  Building,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Role } from '@/lib/definitions';

const menuItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/ckc-requests',
    label: 'CKC Requests',
    icon: FileText,
  },
    {
    href: '/company-information/RC-001',
    label: 'Company Information',
    icon: Building,
  },
  {
    href: '/financial-input',
    label: 'Financial Input',
    icon: Database,
  },
  {
    href: '/operational-input',
    label: 'Operational Input',
    icon: Briefcase,
  },
  {
    href: '/rating-note',
    label: 'Rating Note',
    icon: PenSquare,
  },
  {
    href: '/notes/new/step-1',
    label: 'Initiate Rating Note',
    icon: PlusCircle,
  }
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, setUserRole } = useAuth();


  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-center p-4">
          <Image src="/careedge-logo.svg" alt="CareEdge Logo" width={150} height={40} />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={{ children: item.label, side: 'right' }}
                className="justify-start h-8"
              >
                <a href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {/* Footer content can go here */}
      </SidebarFooter>
    </Sidebar>
  );
}
