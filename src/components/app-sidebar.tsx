'use client';

import React from 'react';
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
  Briefcase,
  Users,
  Building,
  Landmark,
  ShieldCheck,
  UserCheck,
  FilePen,
  FileClock,
  History,
  ShieldX,
  FileSearch,
  Banknote,
  Presentation,
  FolderOpen,
  Settings,
  Shield,
  ScanLine,
  FileOutput,
  FileUp,
  FilePlus,
  BookCopy,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const topMenuItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/portfolio/activities/NOTE-001',
    label: 'Portfolio',
    icon: Briefcase,
  },
];

const ckcAnalystMenuItems = [
    { href: '/ckc/requests', label: 'CKC Requests', icon: FileText },
    { href: '#', label: 'Request Form', icon: FilePen },
    { 
        label: 'OCR', 
        icon: ScanLine,
        subItems: [
            { href: '#', label: 'Financials' },
            { href: '#', label: 'Bank Statement' },
        ]
    },
    { href: '/financial-input/initiate', label: 'Financial Input', icon: FilePlus },
    { href: '/operational-input/requests', label: 'Operational Input', icon: FileUp },
];

const ckcAdminMenuItems = [
  { href: '/ckc/requests', label: 'CKC Requests', icon: FileText },
  { href: '#', label: 'Request Form', icon: FilePen },
  { href: '#', label: 'Blank Period Requests', icon: FileClock },
  {
    label: 'Master',
    icon: Settings,
    subItems: [
      { href: '#', label: 'User Creation' },
      { href: '#', label: 'Role Master' },
      { href: '#', label: 'Team Master' },
    ],
  },
  { href: '#', label: 'Audit Log', icon: History },
  {
    label: 'OCR',
    icon: ScanLine,
    subItems: [
      { href: '#', label: 'Financials' },
      { href: '#', label: 'Bank Statement' },
    ],
  },
  { href: '/financial-input/initiate', label: 'Financial Input', icon: FilePlus },
  { href: '/operational-input/requests', label: 'Operational Input', icon: FileUp },
  { href: '#', label: 'RAR Input', icon: BookCopy },
];

const dueDiligenceMenuItems = [
    { href: '/due-diligence/auditor-feedback', label: 'Auditor Feedback', icon: Users },
    { href: '/due-diligence/banker-feedback', label: 'Banker Feedback', icon: Landmark },
    { href: '/due-diligence/dta-feedback', label: 'DTA Feedback', icon: FileText },
    { href: '/due-diligence/ipa-feedback', label: 'IPA Feedback', icon: FileText },
    { href: '/due-diligence/management-discussion', label: 'Management Discussion', icon: Presentation },
    { href: '/due-diligence/third-party-check', label: 'Third Party Check', icon: ShieldCheck },
    { href: '/due-diligence/audit-committee-meeting', label: 'Audit Committee Meeting', icon: FolderOpen },
    { href: '/due-diligence/site-plant-visit', label: 'Site / Plant Visit', icon: Building },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  const ckcMenuItems = user?.role === 'CKC_ADMIN' ? ckcAdminMenuItems : ckcAnalystMenuItems;

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
          {isClient && topMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href.startsWith('/portfolio') && pathname.startsWith('/portfolio'))}
                tooltip={{ children: item.label, side: 'right' }}
                className="justify-start"
              >
                <a href={item.href!}>
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
           {/* CKC Submenu */}
          {isClient && ['CKC_ADMIN', 'CKC_ANALYST'].includes(user?.role || '') && (
            <SidebarMenuItem>
              <SidebarMenuSub>
                <SidebarMenuButton
                  isActive={pathname.startsWith('/ckc') || pathname.startsWith('/financial-input') || pathname.startsWith('/operational-input/initiate')}
                  tooltip={{ children: 'CKC', side: 'right' }}
                  className="justify-start"
                >
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">CKC</span>
                </SidebarMenuButton>
                <SidebarMenuSubContent>
                  {ckcMenuItems.map((item) =>
                    item.subItems ? (
                      <SidebarMenuSub key={item.label}>
                        <SidebarMenuSubButton
                            isActive={isSubItemActive(item.subItems)}
                        >
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                        </SidebarMenuSubButton>
                        <SidebarMenuSubContent>
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubButton
                              key={subItem.href}
                              asChild
                              isActive={pathname === subItem.href}
                            >
                              <a href={subItem.href}>{subItem.label}</a>
                            </SidebarMenuSubButton>
                          ))}
                        </SidebarMenuSubContent>
                      </SidebarMenuSub>
                    ) : (
                      <SidebarMenuSubButton
                        key={item.href}
                        asChild
                        isActive={pathname.startsWith(item.href)}
                      >
                        <a href={item.href} className="flex items-center gap-2">
                           <item.icon className="h-4 w-4" />
                           <span>{item.label}</span>
                        </a>
                      </SidebarMenuSubButton>
                    )
                  )}
                </SidebarMenuSubContent>
              </SidebarMenuSub>
            </SidebarMenuItem>
          )}

           {isClient && <SidebarMenuItem>
              <SidebarMenuSub>
                <SidebarMenuButton
                  isActive={pathname.startsWith('/due-diligence')}
                  tooltip={{ children: 'Due Diligence', side: 'right' }}
                  className="justify-start"
                >
                  <a href="/due-diligence/auditor-feedback/NOTE-001" className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    <span className="text-sm">Due Diligence</span>
                  </a>
                   <ChevronDown className="h-4 w-4 ml-auto shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </SidebarMenuButton>
                <SidebarMenuSubContent>
                  {dueDiligenceMenuItems.map((item) => (
                      <SidebarMenuSubButton
                        key={item.href}
                        asChild
                        isActive={pathname.startsWith(item.href)}
                      >
                        <a href={item.href} className="flex items-center gap-2">
                           <item.icon className="h-4 w-4" />
                           <span>{item.label}</span>
                        </a>
                      </SidebarMenuSubButton>
                  ))}
                </SidebarMenuSubContent>
              </SidebarMenuSub>
            </SidebarMenuItem>}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {/* Footer content can go here */}
      </SidebarFooter>
    </Sidebar>
  );
}
