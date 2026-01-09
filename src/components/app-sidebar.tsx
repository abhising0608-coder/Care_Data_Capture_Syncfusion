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
  Building,
  Landmark,
  ShieldCheck,
  UserCheck,
  Plane,
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
  BookCopy,
} from 'lucide-react';
import { useAuth } from '@/firebase';
import { Badge } from '@/components/ui/badge';

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
    { href: '#', label: 'Financial Input', icon: FileInput },
    { href: '#', label: 'Operational Input', icon: FileUp },
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
  { href: '#', label: 'Financial Input', icon: FileInput },
  { href: '#', label: 'Operational Input', icon: FileUp },
  { href: '#', label: 'RAR Input', icon: BookCopy },
];

const ratingNoteSubItems = [
    { href: '#', label: 'Rating Note' },
    { href: '/manage-instrument/isin-update/temp-id/temp-id/temp-id', label: 'ISIN' },
    { href: '#', label: 'RAR' },
    { href: '#', label: 'RCM Status' },
    { href: '#', label: 'Delay in Periodic Review' },
    { href: '#', label: 'DMS' },
    { href: '#', label: 'Banker/Lender' },
    { href: '/manage-instrument/update-inc-status', label: 'Update INC Status' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  
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
          {topMenuItems.map((item) => (
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
          {['CKC_ADMIN', 'CKC_ANALYST'].includes(user?.role || '') && (
            <SidebarMenuItem>
              <SidebarMenuSub>
                <SidebarMenuButton
                  isActive={pathname.startsWith('/ckc')}
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
                        isActive={pathname === item.href}
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

          {/* Rating Note Submenu */}
           <SidebarMenuItem>
                <SidebarMenuSub>
                    <SidebarMenuButton
                        isActive={ratingNoteSubItems.some(item => pathname.startsWith(item.href.split('[')[0]))}
                        tooltip={{ children: 'Rating Note', side: 'right' }}
                        className="justify-start"
                        >
                        <FilePen className="h-4 w-4" />
                        <span className="text-sm">Rating Note</span>
                         <Badge className="ml-auto bg-blue-500 text-white">W</Badge>
                    </SidebarMenuButton>
                    <SidebarMenuSubContent>
                        {ratingNoteSubItems.map(subItem => (
                             <SidebarMenuSubButton key={subItem.href} asChild isActive={pathname === subItem.href}>
                                <a href={subItem.href} className="flex items-center gap-2">
                                    <span>{subItem.label}</span>
                                </a>
                            </SidebarMenuSubButton>
                        ))}
                    </SidebarMenuSubContent>
                </SidebarMenuSub>
            </SidebarMenuItem>

            {/* E2E Test Runner */}
            <SidebarMenuItem>
                 <SidebarMenuButton
                        asChild
                        isActive={pathname === '/e2e-test'}
                        tooltip={{ children: 'E2E Test Runner', side: 'right' }}
                        className="justify-start"
                    >
                        <a href='/e2e-test'>
                        <TestTube2 className="h-4 w-4" />
                        <span className="text-sm">E2E Test Runner</span>
                        </a>
                    </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {/* Footer content can go here */}
      </SidebarFooter>
    </Sidebar>
  );
}
