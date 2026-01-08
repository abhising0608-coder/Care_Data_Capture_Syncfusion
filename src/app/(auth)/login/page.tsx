'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { Role } from '@/lib/definitions';
import { useAuth } from '@/context/auth-context';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const roleUserMap: Record<string, Role> = {
    'analyst@careedge.com': 'RATING_ANALYST',
    'group.head@careedge.com': 'GROUP_HEAD',
    'qc@careedge.com': 'QC',
    'cc@careedge.com': 'RATING_COMMITTEE'
};


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setUserRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      // This is a simplified "login". The actual user state is managed by the AuthProvider.
      const validUsers: Record<string, string> = {
          'analyst@careedge.com': 'password',
          'group.head@careedge.com': 'password',
          'qc@careedge.com': 'password',
          'cc@careedge.com': 'password',
      };

      const userEmail = data.email.toLowerCase();
      
      if (validUsers[userEmail] === data.password) {
        
        const role: Role | undefined = roleUserMap[userEmail];
        
        if(setUserRole && role) {
            setUserRole(role);

            toast({
              title: 'Login Successful',
              description: `Redirecting to the company listing page as ${role.replace('_', ' ')}.`,
            });
            router.push('/dashboard');
        } else {
            throw new Error('Role not found for this user.');
        }

      } else {
        throw new Error('Invalid email or password.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
        <div className="absolute top-8 left-8">
            <img src="/assets/logo/careedge-logo.png" alt="CareEdge Logo" style={{ height: '40px', objectFit: 'contain', maxWidth: '100%' }} />
        </div>
        <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
            Enter your email below to login to your account
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register('email')}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
                <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="ml-auto inline-block text-sm underline">
                    Forgot your password?
                </a>
                </div>
                <Input id="password" type="password" {...register('password')} />
                 {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
            </Button>
            </form>
        </CardContent>
        </Card>
    </>
  );
}
