'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, Trash2, Upload, File as FileIcon } from 'lucide-react';
import { format } from 'date-fns';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import type { DocumentFile } from '@/lib/definitions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';


interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const mockDocuments: DocumentFile[] = [
    { id: 'doc-1', name: 'Document_1.pdf', uploadedAt: new Date().toISOString() },
    { id: 'doc-2', name: 'Document_2.pdf', uploadedAt: new Date().toISOString() },
    { id: 'doc-3', name: 'Document_3.pdf', uploadedAt: new Date().toISOString() },
    { id: 'doc-4', name: 'Document_4.pdf', uploadedAt: new Date().toISOString() },
    { id: 'doc-5', name: 'Document_5.pdf', uploadedAt: new Date().toISOString() },
];

export function DocumentsModal({ isOpen, onClose, title }: DocumentsModalProps) {
    const { toast } = useToast();
    const [documents, setDocuments] = useState(mockDocuments);

    const handleUpload = () => {
        const newDoc: DocumentFile = {
            id: `doc-${documents.length + 1}`,
            name: `Document_${documents.length + 1}.pdf`,
            uploadedAt: new Date().toISOString(),
        };
        setDocuments(prev => [...prev, newDoc]);
        toast({ title: 'Document Uploaded', description: `${newDoc.name} has been uploaded.` });
    };

    const handleDelete = (docId: string) => {
        setDocuments(prev => prev.filter(doc => doc.id !== docId));
        toast({ title: 'Document Deleted', variant: 'destructive' });
    };

    const handleView = (docName: string) => {
        toast({ title: 'Viewing Document', description: `Opening ${docName}...` });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                     <DialogDescription>
                        Manage documents related to this due diligence activity.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="flex justify-end mb-4">
                         <Button onClick={handleUpload}>
                            <Upload className="mr-2 h-4 w-4" /> Upload Document
                        </Button>
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Document Name</TableHead>
                                    <TableHead>Uploaded Date</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {documents.length > 0 ? (
                                    documents.map((doc) => (
                                        <TableRow key={doc.id}>
                                            <TableCell className="font-medium">
                                                <Button variant="link" className="p-0 h-auto" onClick={() => handleView(doc.name)}>
                                                    <FileIcon className="mr-2 h-4 w-4" /> {doc.name}
                                                </Button>
                                            </TableCell>
                                            <TableCell>{format(new Date(doc.uploadedAt), 'dd-MM-yyyy')}</TableCell>
                                            <TableCell className="text-right">
                                                 <Button variant="ghost" size="icon" onClick={() => handleView(doc.name)}><Eye className="h-4 w-4" /></Button>
                                                 <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                         <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>This action will permanently delete the document.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(doc.id)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">No documents uploaded yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                 <DialogFooter>
                    <Button onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}