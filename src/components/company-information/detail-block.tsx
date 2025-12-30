'use client';

import { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { DetailModal } from './detail-modal';
import type { DetailItem } from '@/lib/definitions';

interface DetailBlockProps {
    title: string;
    data: DetailItem[];
    isReadOnly: boolean;
    fieldName: string;
    columns: { accessor: string; header: string }[];
}

export function DetailBlock({ title, data, isReadOnly, fieldName, columns }: DetailBlockProps) {
    const { control } = useFormContext();
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
            update(editingIndex, itemData);
        } else {
            append({ ...itemData, id: uuidv4() });
        }
        setIsModalOpen(false);
        setEditingIndex(null);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>Review and manage {title.toLowerCase()}.</CardDescription>
                    </div>
                    {!isReadOnly && (
                        <Button variant="outline" size="sm" onClick={() => handleOpenModal()}>
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
                                    {!isReadOnly && <TableHead className="w-[100px]">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.length > 0 ? (
                                    fields.map((item, index) => (
                                        <TableRow key={item.id}>
                                            {columns.map(col => (
                                                <TableCell key={`${item.id}-${col.accessor}`}>
                                                    {(item as any)[col.accessor]}
                                                </TableCell>
                                            ))}
                                            {!isReadOnly && (
                                                <TableCell className="flex gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(index)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
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
                defaultValues={editingIndex !== null ? fields[editingIndex] as any : {}}
                title={editingIndex !== null ? `Edit ${title}` : `Add New ${title}`}
            />
        </>
    );
}
