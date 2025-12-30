'use client';

import { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2, Check, X } from 'lucide-react';
import { DetailModal } from './detail-modal';
import type { DetailItem } from '@/lib/definitions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export type ColumnDefinition = {
    accessor: string;
    header: string;
    type: 'text' | 'number' | 'boolean' | 'select';
    options?: string[];
    required?: boolean;
};

interface DetailBlockProps {
    title: string;
    isReadOnly: boolean;
    fieldName: string;
    columns: ColumnDefinition[];
}

export function DetailBlock({ title, isReadOnly, fieldName, columns }: DetailBlockProps) {
    const { control, getValues } = useFormContext();
    const { fields, append, update, remove } = useFieldArray({
        control,
        name: fieldName,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleOpenModal = (index: number | null = null) => {
        setEditingIndex(index);
        setIsModalOpen(true);
    };

    const handleSave = (itemData: DetailItem) => {
        if (editingIndex !== null) {
             const updatedItem = {
                ...fields[editingIndex],
                ...itemData,
                lastUpdatedAt: new Date().toISOString(),
                // lastUpdatedBy should be set here from auth context
                pendingSync: (fields[editingIndex] as any).source === 'CRM'
            };
            update(editingIndex, updatedItem);
        } else {
            append({
                ...itemData,
                id: uuidv4(),
                source: 'Rating',
                isDeleted: false,
                lastUpdatedAt: new Date().toISOString(),
                // lastUpdatedBy should be set here
             });
        }
        setIsModalOpen(false);
        setEditingIndex(null);
    };

    const handleDelete = (index: number) => {
        const field: any = fields[index];
        // Instead of removing, we mark as deleted
        if (field.source === 'CRM') {
             update(index, { ...field, isDeleted: true, lastUpdatedAt: new Date().toISOString() });
        } else {
            // if it was added in the Rating system, we can just remove it
            remove(index);
        }
    };

    const activeFields = fields.filter(field => !(field as any).isDeleted);

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>Review and manage {title.toLowerCase()}.</CardDescription>
                    </div>
                    {!isReadOnly && (
                        <Button type="button" variant="outline" size="sm" onClick={() => handleOpenModal()}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columns.map(col => <TableHead key={col.accessor}>{col.header}</TableHead>)}
                                    {!isReadOnly && <TableHead className="w-[100px] text-right">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activeFields.length > 0 ? (
                                    activeFields.map((item, index) => {
                                        // Find the original index in the 'fields' array for correct update/delete
                                        const originalIndex = fields.findIndex(f => f.id === item.id);
                                        return (
                                        <TableRow key={item.id}>
                                            {columns.map(col => (
                                                <TableCell key={`${item.id}-${col.accessor}`}>
                                                    {col.type === 'boolean' || (Array.isArray(col.options) && col.options.every(o => ['Yes', 'No'].includes(o))) ? (
                                                        (item as any)[col.accessor] === true || (item as any)[col.accessor] === 'Yes' ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-muted-foreground" />
                                                    ) : (
                                                        (item as any)[col.accessor]
                                                    )}
                                                </TableCell>
                                            ))}
                                            {!isReadOnly && (
                                                <TableCell className="flex gap-2 justify-end">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(originalIndex)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action will mark the record for deletion. It will be hidden from view but can be recovered if it originated from CRM. Records added here will be permanently deleted.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(originalIndex)}>Continue</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    )})
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length + (isReadOnly ? 0 : 1)} className="h-24 text-center">
                                            No {title.toLowerCase()} found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <DetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                columns={columns}
                defaultValues={editingIndex !== null ? fields[editingIndex] as DetailItem : undefined}
                title={editingIndex !== null ? `Edit ${title}` : `Add New ${title}`}
            />
        </>
    );
}
