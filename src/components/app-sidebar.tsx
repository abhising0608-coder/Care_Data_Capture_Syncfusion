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
  FolderOpen
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
    href: '/portfolio',
    label: 'Portfolio',
    icon: Briefcase,
  },
  {
    href: '/ckc-requests',
    label: 'CKC',
    icon: FolderOpen,
  },
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
                                     <a href={subItem.href} className="flex items-center gap-2">
                                        {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                        <span>{subItem.label}</span>
                                     </a>
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
