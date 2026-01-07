
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { mockQcUsers } from '@/lib/mock-data';

interface SendToQCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (qcUser: { id: string; name: string }) => void;
}

const formSchema = z.object({
  qcUserId: z.string().min(1, 'Please select a QC user.'),
});

export function SendToQCModal({ isOpen, onClose, onSend }: SendToQCModalProps) {
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const handleSubmit = () => {
    if (selectedUser) {
      onSend(selectedUser);
    } else {
      form.setError('qcUserId', { type: 'manual', message: 'Please select a QC user.' });
    }
  };
  
  const qcUsers = mockQcUsers;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send to QC</DialogTitle>
          <DialogDescription>
            Select a QC team member to send this Press Release for review.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 items-center gap-4 py-4">
          <Label htmlFor="qc-select" className="text-left">Select QC</Label>
          <div className="col-span-2">
            <Select
              onValueChange={(value) => {
                const user = qcUsers.find(u => u.id === value);
                if (user) setSelectedUser(user);
              }}
            >
              <SelectTrigger id="qc-select">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {qcUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.qcUserId && <p className="text-sm text-destructive mt-1">{form.formState.errors.qcUserId.message}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleSubmit}>
            <Send className="mr-2 h-4 w-4" /> Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
