'use client';

import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DetailItem } from '@/lib/definitions';
import { useEffect } from 'react';

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: DetailItem) => void;
    columns: { accessor: string; header: string }[];
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
                                    <Input
                                        id={col.accessor}
                                        {...register(col.accessor, { required: `${col.header} is required.` })}
                                        className="w-full"
                                    />
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
