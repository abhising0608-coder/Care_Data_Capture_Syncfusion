
'use client';

import { useState } from 'react';
import { useRouter }from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from "date-fns";
import { Calendar as CalendarIcon, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getCompaniesByRole } from '@/lib/mock-data';
import { useAuth } from '@/firebase';


const incStatusSchema = z.object({
    companyId: z.string().min(1, "Company is required."),
    condition: z.string().optional(),
    ratingToBeDoneDate: z.date().nullable(),
    remarks: z.string().optional(),
});

type IncStatusFormValues = z.infer<typeof incStatusSchema>;


export default function UpdateIncStatusPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, isLoading: isAuthLoading } = useAuth();
    const companies = getCompaniesByRole(user);

    const form = useForm<IncStatusFormValues>({
        resolver: zodResolver(incStatusSchema),
        defaultValues: {
            companyId: '',
            condition: 'Condition from CART DB', // Prefilled
            ratingToBeDoneDate: null,
            remarks: '',
        }
    });

    const onSubmit = (data: IncStatusFormValues) => {
        console.log(data);
        toast({
            title: 'Success',
            description: 'INC status has been updated.',
        });
        router.back();
    };

    return (
        <FormProvider {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <header>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Update INC Status</h1>
                    <p className="text-muted-foreground">
                        View and update the INC status for the selected company.
                    </p>
                </header>

                <Card>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="companyId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                 <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a company" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                     {isAuthLoading ? (
                                                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                                                    ) : (
                                                        companies.map((company) => (
                                                            <SelectItem key={company.id} value={company.id}>
                                                                {company.companyName}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="condition"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Select Condition</FormLabel>
                                            <FormControl>
                                                <Input {...field} readOnly disabled />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="ratingToBeDoneDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Rating to be Done Date</FormLabel>
                                             <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                            {field.value ? format(field.value, "PPP") : <span>Select Date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value ?? undefined} onSelect={field.onChange} />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                             {/* Right Column */}
                            <div className="space-y-2">
                                 <FormField
                                    control={form.control}
                                    name="remarks"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Remarks</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter remarks here..."
                                                    className="h-full min-h-[220px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                 <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit"><Save className="mr-2 h-4 w-4" /> Save</Button>
                </div>
            </form>
        </FormProvider>
    );
}
