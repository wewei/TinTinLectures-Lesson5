import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Input,
} from "@mui/material";
import { useState } from "react";

export type FollowDialogProps = {
  onConfirm: (canisterId: string) => void;
  onCancel: () => void;
  open: boolean;
};

export default function FollowDialog({
  onConfirm,
  onCancel,
  open,
}: FollowDialogProps) {
  const [canisterId, setCanisterId] = useState("");
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Add a new followee</DialogTitle>
      <DialogContent>
        <DialogContentText>Canister Id:</DialogContentText>
        <Input
          autoFocus
          value={canisterId}
          onChange={(e) => setCanisterId(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onConfirm(canisterId)}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
}
