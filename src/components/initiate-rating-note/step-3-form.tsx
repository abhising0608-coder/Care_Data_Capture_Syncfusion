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
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

// Mock criteria data
const mockCriteria = [
    { id: 'criteria-001', name: 'Criteria for Rating Manufacturing Companies' },
    { id: 'criteria-002', name: 'Criteria for Rating Service Sector Companies' },
    { id: 'criteria-003', name: 'Criteria for Bank Loans' },
    { id: 'criteria-004', name: 'Parent and Group Support' },
];


export function Step3Form() {
  const { control } = useFormContext();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="step3.financialApproach"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Financial Approach</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select approach" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Standalone">Standalone</SelectItem>
                  <SelectItem value="Consolidated">Consolidated</SelectItem>
                  <SelectItem value="Combined">Combined</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="step3.financialYearFrom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Financial Year From</FormLabel>
              <Select onValueChange={(val) => field.onChange(Number(val))} value={String(field.value)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {years.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="step3.financialYearTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Financial Year To</FormLabel>
               <Select onValueChange={(val) => field.onChange(Number(val))} value={String(field.value)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {years.map(year => <SelectItem key={year} value={String(year + 1)}>{year + 1}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="step3.currencyDenomination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency Denomination</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="INR">INR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="step3.scale"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scale</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scale" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Crores">Crores</SelectItem>
                  <SelectItem value="Millions">Millions</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div>
        <FormLabel>Applicable Criteria</FormLabel>
        <div className="mt-2 grid grid-cols-2 gap-4 rounded-md border p-4">
          {mockCriteria?.map(item => (
            <FormField
              key={item.id}
              control={control}
              name="step3.applicableCriteria"
              render={({ field }) => {
                return (
                  <FormItem
                    key={item.id}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(item.id)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...(field.value || []), item.id])
                            : field.onChange(
                                field.value?.filter(
                                  (value) => value !== item.id
                                )
                              )
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {item.name}
                    </FormLabel>
                  </FormItem>
                )
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
