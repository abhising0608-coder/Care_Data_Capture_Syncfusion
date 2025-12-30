'use client';

import { usePathname } from 'next/navigation';
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
  GitFork,
  PenSquare,
  Building,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  }
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, setUserRole } = useAuth();


  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
            <GitFork className="w-8 h-8 text-primary" />
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-tight text-foreground">
                CareEdge
              </span>
            </div>
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
              >
                <a href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <div className='p-2 space-y-2'>
              <span className='text-xs text-muted-foreground'>Simulate Role:</span>
              <Select value={user.role} onValueChange={(value) => setUserRole(value as Role)}>
                  <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="CKC_ANALYST">CKC Analyst</SelectItem>
                      <SelectItem value="CKC_CHECKER">CKC Checker</SelectItem>
                      <SelectItem value="CKC_ADMIN">CKC Admin</SelectItem>
                      <SelectItem value="RATING_ANALYST">Rating Analyst</SelectItem>
                      <SelectItem value="GROUP_HEAD">Group Head</SelectItem>
                  </SelectContent>
              </Select>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
