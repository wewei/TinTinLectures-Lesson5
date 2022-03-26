import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import { ALL_CANISTER_IDS } from "../AppMeta";

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
    <Dialog open={open} onClose={onCancel} fullWidth>
      <DialogTitle>Add a new followee</DialogTitle>
      <DialogContent>
        <DialogContentText>Canister Id:</DialogContentText>
        <Autocomplete
          options={ALL_CANISTER_IDS}
          onChange={(e, newValue) => setCanisterId(newValue ?? "")}
          renderInput={(params) => (
            <TextField {...params} fullWidth variant="standard" />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onConfirm(canisterId)}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
}
