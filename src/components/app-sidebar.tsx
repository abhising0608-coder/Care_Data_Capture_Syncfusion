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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubContent,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FileText,
  TestTube2,
  Briefcase,
  Users,
} from 'lucide-react';
import { useAuth } from '@/firebase';

const menuItems = [
  {
    href: '/dashboard',
    label: 'Company Listing Page',
    icon: LayoutDashboard,
  },
  {
    href: '/ckc-requests',
    label: 'CKC Requests',
    icon: FileText,
  },
  {
    id: 'due-diligence',
    label: 'Due Diligence',
    icon: Briefcase,
    subItems: [
        { href: '/due-diligence/dt-feedback', label: 'DT Feedback' },
        { href: '/due-diligence/ipa-feedback', label: 'IPA Feedback' },
        { href: '/due-diligence/management-discussion', label: 'Management Discussion' },
        { href: '/due-diligence/third-party-check', label: 'Third Party Check' },
        { href: '/due-diligence/audit-committee-meeting', label: 'Audit Committee Meeting' },
    ]
  },
   {
    href: '/e2e-test',
    label: 'E2E Test Runner',
    icon: TestTube2,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isSubItemActive = (subItems: any[] | undefined) => {
    if (!subItems) return false;
    return subItems.some(item => pathname.startsWith(item.href));
  };


  return (
    <Sidebar>
      <SidebarHeader className="p-4 flex items-center justify-center">
        <img src="/assets/logo/careedge-logo.png" alt="CareEdge Logo" style={{ height: '40px', objectFit: 'contain', maxWidth: '100%' }} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href || item.id}>
                {item.subItems ? (
                     <SidebarMenuSub>
                        <SidebarMenuButton
                            isActive={pathname.startsWith(`/${item.id}`)}
                            tooltip={{ children: item.label, side: 'right' }}
                            className="justify-start"
                            >
                            <item.icon className="h-4 w-4" />
                            <span className="text-sm">{item.label}</span>
                        </SidebarMenuButton>
                        <SidebarMenuSubContent>
                            {item.subItems.map(subItem => (
                                <SidebarMenuSubButton key={subItem.href} asChild isActive={pathname === subItem.href}>
                                     <a href={subItem.href}>{subItem.label}</a>
                                </SidebarMenuSubButton>
                            ))}
                        </SidebarMenuSubContent>
                    </SidebarMenuSub>
                ) : (
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={{ children: item.label, side: 'right' }}
                        className="justify-start"
                    >
                        <a href={item.href!}>
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm">{item.label}</span>
                        </a>
                    </SidebarMenuButton>
                 )}
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
