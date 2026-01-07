'use client';

import { useState } from 'react';
import { Send, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface WaiverRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
}

export function WaiverRequestModal({ isOpen, onClose, onSubmit }: WaiverRequestModalProps) {
    const [reason, setReason] = useState('');

    const handleSubmit = () => {
        if (reason.trim()) {
            onSubmit(reason);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>SD Approval for Waiver</DialogTitle>
                    <DialogDescription>
                        Site visit is mandatory for this case. Provide a reason to request a waiver from the Sector Director.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label htmlFor="reason">Reason for Waiver</Label>
                    <Textarea
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Please provide a clear and concise reason for the waiver request."
                        className="min-h-[120px]"
                    />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="button" onClick={handleSubmit} disabled={!reason.trim()}>
                        <Send className="mr-2 h-4 w-4" /> Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
