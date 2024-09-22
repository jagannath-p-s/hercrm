// components/childcomponents/ActiveToggleDialog.jsx

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ActiveToggleDialog = ({
  isOpen,
  onClose,
  dialogType,
  staffName,
  newUserId,
  setNewUserId,
  onConfirmDeactivate,
  onConfirmActivate,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {dialogType === "deactivate" ? "Deactivate Staff" : "Activate Staff"}
          </DialogTitle>
        </DialogHeader>
        {dialogType === "deactivate" ? (
          <>
            <DialogDescription>
              This will remove {staffName}'s biometric data from the machine, and they will not be able to log in. Do you want to proceed?
            </DialogDescription>
            <DialogFooter>
              <Button onClick={() => onClose(false)}>Cancel</Button>
              <Button variant="destructive" onClick={onConfirmDeactivate}>
                Deactivate
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogDescription>
              Please enter the new User ID to activate {staffName}.
            </DialogDescription>
            <Input
              placeholder="User ID"
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
              className="mb-4"
            />
            <DialogFooter>
              <Button onClick={() => onClose(false)}>Cancel</Button>
              <Button onClick={onConfirmActivate}>Activate</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ActiveToggleDialog;
