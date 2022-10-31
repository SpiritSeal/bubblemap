import React, { ReactNode } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

const ConfirmationDialog = ({
  isOpen,
  onApprove,
  onReject,
  title,
  description,
  approveButtonText,
  rejectButtonText,
  suggestedAction,
}: {
  isOpen: boolean;
  onApprove: () => void;
  onReject: () => void;
  title: string;
  description: ReactNode;
  approveButtonText: string;
  rejectButtonText: string;
  suggestedAction: 'approve' | 'reject' | undefined;
}) => (
  <Dialog open={isOpen} onClose={onReject}>
    <form
      onSubmit={(e) => {
        onApprove();
        onReject();
        e.preventDefault();
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          variant={suggestedAction === 'reject' ? 'contained' : 'text'}
          onClick={onReject}
          type={suggestedAction === 'reject' ? 'submit' : 'button'}
          autoFocus={suggestedAction === 'reject'}
        >
          {rejectButtonText}
        </Button>
        <Button
          variant={suggestedAction === 'approve' ? 'contained' : 'text'}
          onClick={onApprove}
          type={suggestedAction === 'approve' ? 'submit' : 'button'}
          autoFocus={suggestedAction === 'approve'}
        >
          {approveButtonText}
        </Button>
      </DialogActions>
    </form>
  </Dialog>
);

export default ConfirmationDialog;
