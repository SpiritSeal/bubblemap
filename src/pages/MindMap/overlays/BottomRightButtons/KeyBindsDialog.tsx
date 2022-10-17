import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

const KeyBindsDialog = ({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) => (
  <Dialog open={open} onClose={handleClose}>
    <DialogTitle>Key Bindings</DialogTitle>
    <DialogContent>
      <DialogContentText>
        To subscribe to this website, please enter your email address here. We
        will send updates occasionally.
      </DialogContentText>
    </DialogContent>
  </Dialog>
);

export default KeyBindsDialog;
