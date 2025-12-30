'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '../ui/textarea';

export function Step4Form() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
        <FormField
            control={control}
            name="step4.ratingCommitteeType"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Rating Committee Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a committee type" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="standard">Standard Committee</SelectItem>
                    <SelectItem value="executive">Executive Committee</SelectItem>
                    <SelectItem value="special">Special Committee</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={control}
            name="step4.analystRemarks"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Analyst Remarks (Optional)</FormLabel>
                <FormControl>
                <Textarea
                    placeholder="Enter any remarks for the committee..."
                    className="min-h-[100px]"
                    {...field}
                />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
      />
    </div>
  );
}
