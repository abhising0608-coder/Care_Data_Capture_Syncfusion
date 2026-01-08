'use client';
import { Bell, LogOut } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { CKCRequest, Role } from '@/lib/definitions';
import { useAuth } from '@/context/auth-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const roleDisplayNames: Record<Role, string> = {
  RATING_ANALYST: 'Rating Analyst',
  GROUP_HEAD: 'Group Head',
  QC: 'Quality Control',
  RATING_COMMITTEE: 'Rating Committee',
  CKC_ANALYST: 'CKC Analyst',
  CKC_CHECKER: 'CKC Checker',
  CKC_ADMIN: 'CKC Admin',
  RATING_HEAD_SD: 'Rating Head SD',
  SYSTEM: 'System',
  AUDITOR: 'Auditor',
  EDITOR: 'Editor',
};


export function AppHeader() {
  const { data: pendingRequests } = useSWR<CKCRequest[]>('/api/requests?status=PENDING', fetcher);
  const { user, setUserRole } = useAuth();
  const router = useRouter();

  const newRequestCount = pendingRequests?.length || 0;
  const userInitials = user?.displayName?.split(' ').map(n => n[0]).join('') || 'U';

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
         <div className="items-center gap-2 hidden md:flex">
           <h1 className="text-lg font-semibold text-foreground">Rating Note</h1>
         </div>
      </div>

      <div className="flex items-center gap-4">
        {user && user.role && (
          <div className="flex h-10 w-auto items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
            <span>{roleDisplayNames[user.role] || user.role}</span>
          </div>
        )}

        <Button asChild variant="ghost" size="icon" className="rounded-full relative text-muted-foreground">
          <Link href="/ckc-requests">
            <Bell className="h-5 w-5" />
            {newRequestCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0 text-xs">
                {newRequestCount}
              </Badge>
            )}
            <span className="sr-only">Toggle notifications</span>
          </Link>
        </Button>
        
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || ''} />
                        <AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}
