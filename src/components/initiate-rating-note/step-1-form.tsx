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
import { Input } from '../ui/input';

const mockTemplates = [
    { id: 'template-001', name: 'Standard Corporate Rating Template' },
    { id: 'template-002', name: 'Bank Rating Template' },
    { id: 'template-003', name: 'Infrastructure Project Rating Template' },
];


export function Step1Form({ companyName }: { companyName: string }) {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="step1.companyId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Name</FormLabel>
            <FormControl>
                <Input value={companyName} readOnly disabled />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="step1.templateId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Template</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockTemplates?.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
