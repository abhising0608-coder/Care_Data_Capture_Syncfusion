'use client';

import { useFormContext } from 'react-hook-form';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function OtherDetailsTab() {
    const { control } = useFormContext();

    return (
         <Card>
            <CardContent className="pt-6 space-y-6">
                <FormField name="productManufactured" control={control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Product manufactured at the plant *</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="installedCapacity" control={control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Installed capacity at the plant *</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField name="otherInfo" control={control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Any other information</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </CardContent>
        </Card>
    );
}
