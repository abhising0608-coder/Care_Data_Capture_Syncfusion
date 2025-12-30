'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GroupTaggingProps {
    isReadOnly: boolean;
}

export function GroupTagging({ isReadOnly }: GroupTaggingProps) {
    const { control } = useFormContext();

    // Mock data for dropdowns
    const groups = ['Reliance Group', 'Adani Group', 'Tata Group', 'Independent'];
    const combinedApproachGroups = ['Tata Motors + JLR', 'Aditya Birla Fashion + Pantaloons'];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Group Tagging</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                        control={control}
                        name="groupSelection.group"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Group</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={isReadOnly}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a group" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {groups.map(group => (
                                            <SelectItem key={group} value={group}>{group}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={control}
                        name="groupSelection.groupForCombinedApproach"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Group for Combined Approach</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={isReadOnly}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a combined approach group" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {combinedApproachGroups.map(group => (
                                            <SelectItem key={group} value={group}>{group}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
