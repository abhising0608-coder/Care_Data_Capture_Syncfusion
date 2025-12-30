'use client';
import { Bell, LogOut } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { CKCRequest, Role } from '@/lib/definitions';
import { useAuth } from '@/firebase';
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

export function AppHeader() {
  const { data: pendingRequests } = useSWR<CKCRequest[]>('/api/requests?status=PENDING', fetcher);
  const { user, setUserRole } = useAuth();
  const router = useRouter();

  const newRequestCount = pendingRequests?.length || 0;
  const userInitials = user?.displayName?.split(' ').map(n => n[0]).join('') || 'U';

  const handleLogout = () => {
    // In a real app, this would call a Firebase signOut method.
    // For this prototype, we just redirect to the login page.
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
        {user && (
          <Select value={user.role} onValueChange={(value) => setUserRole && setUserRole(value as Role)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RATING_ANALYST">Rating Analyst</SelectItem>
              <SelectItem value="GROUP_HEAD">Group Head</SelectItem>
              <SelectItem value="QC">Quality Control</SelectItem>
              <SelectItem value="RATING_COMMITTEE">Rating Committee</SelectItem>
              <SelectItem value="CKC_ANALYST">CKC Analyst</SelectItem>
              <SelectItem value="CKC_CHECKER">CKC Checker</SelectItem>
              <SelectItem value="CKC_ADMIN">CKC Admin</SelectItem>
            </SelectContent>
          </Select>
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
