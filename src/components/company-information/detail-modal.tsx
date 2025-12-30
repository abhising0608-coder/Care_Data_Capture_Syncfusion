'use client';

import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DetailItem } from '@/lib/definitions';
import { useEffect } from 'react';
import type { ColumnDefinition } from './detail-block';
import { Switch } from '../ui/switch';

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: DetailItem) => void;
    columns: ColumnDefinition[];
    defaultValues?: DetailItem;
    title: string;
}

export function DetailModal({ isOpen, onClose, onSave, columns, defaultValues, title }: DetailModalProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });

    useEffect(() => {
        if (isOpen) {
            reset(defaultValues || {});
        }
    }, [isOpen, defaultValues, reset]);

    const handleFormSubmit = (data: any) => {
        onSave(data as DetailItem);
    };

    const renderInput = (col: ColumnDefinition) => {
        const fieldProps = {
            id: col.accessor,
            ...register(col.accessor, { required: `${col.header} is required.` }),
        };

        switch (col.type) {
            case 'boolean':
                return (
                    <div className="flex items-center">
                        <Switch
                            id={col.accessor}
                            defaultChecked={defaultValues?.[col.accessor]}
                            onCheckedChange={(checked) => {
                                // @ts-ignore
                                fieldProps.onChange({ target: { value: checked } });
                            }}
                        />
                    </div>
                );
            case 'text':
            case 'number':
            default:
                return (
                     <Input
                        {...fieldProps}
                        type={col.type === 'number' ? 'number' : 'text'}
                        className="w-full"
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
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <div className="grid gap-4 py-4">
                        {columns.map(col => (
                            <div key={col.accessor} className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor={col.accessor} className="text-right">
                                    {col.header}
                                </Label>
                                <div className="col-span-3">
                                   {renderInput(col)}
                                     {errors[col.accessor] && <p className="text-sm text-destructive mt-1">{(errors as any)[col.accessor].message}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
