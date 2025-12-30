'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

export function Step2Form() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="step2.comments"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Role Clarification Comments (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter any comments regarding role clarification..."
                className="min-h-[150px]"
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
