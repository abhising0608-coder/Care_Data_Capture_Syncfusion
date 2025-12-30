'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DetailItem } from '@/lib/definitions';
import { useEffect, useMemo } from 'react';
import type { ColumnDefinition } from './detail-block';
import { Switch } from '../ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: DetailItem) => void;
    columns: ColumnDefinition[];
    defaultValues?: DetailItem;
    title: string;
}

export function DetailModal({ isOpen, onClose, onSave, columns, defaultValues, title }: DetailModalProps) {
    
    const validationSchema = useMemo(() => {
        const schemaShape: any = {};
        columns.forEach(col => {
            let fieldSchema;
            switch(col.type) {
                case 'text':
                    fieldSchema = z.string();
                    if (col.accessor.toLowerCase().includes('email')) {
                        fieldSchema = fieldSchema.email({ message: "Invalid email format." }).optional().or(z.literal(''));
                    } else {
                        fieldSchema = fieldSchema.optional();
                    }
                    if (col.required) {
                        fieldSchema = fieldSchema.min(1, `${col.header} is required.`);
                    }
                    break;
                case 'number':
                    fieldSchema = z.number().optional();
                    break;
                case 'boolean':
                    fieldSchema = z.boolean().optional();
                    break;
                default:
                    fieldSchema = z.any().optional();
            }
             schemaShape[col.accessor] = fieldSchema;
        });
        return z.object(schemaShape);
    }, [columns]);
    
    const form = useForm({
        resolver: zodResolver(validationSchema),
        defaultValues: defaultValues,
    });

    useEffect(() => {
        if (isOpen) {
            form.reset(defaultValues || {});
        }
    }, [isOpen, defaultValues, form]);

    const handleFormSubmit = (data: any) => {
        onSave(data as DetailItem);
    };
    
    const renderInput = (col: ColumnDefinition, field: any) => {
        switch (col.type) {
            case 'boolean':
                return (
                     <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                );
            case 'number':
                 return (
                     <Input
                        {...field}
                        type="number"
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                    />
                );
            case 'text':
            default:
                return (
                     <Input
                        {...field}
                        type={col.type === 'text' ? 'text' : col.type}
                    />
                );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                            {columns.map(col => (
                               <FormField
                                    key={col.accessor}
                                    control={form.control}
                                    name={col.accessor}
                                    render={({ field }) => (
                                        <FormItem className="grid grid-cols-4 items-center gap-4">
                                            <FormLabel className="text-right">{col.header}</FormLabel>
                                            <FormControl className="col-span-3">
                                               {renderInput(col, field)}
                                            </FormControl>
                                            <div className="col-start-2 col-span-3">
                                               <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            ))}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
