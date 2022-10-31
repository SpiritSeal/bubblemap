import React, { ReactNode, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  TextFieldProps,
} from '@mui/material';

const TextDialog = ({
  isOpen,
  onApprove,
  onReject,
  title,
  description,
  approveButtonText,
  rejectButtonText,
  suggestedAction,
  initialValue,
  updateOnInitialValueChange,
  textFieldProps,
}: {
  isOpen: boolean;
  onApprove: (value: string) => void;
  onReject: (value: string) => void;
  title: string;
  description: ReactNode;
  approveButtonText: string;
  rejectButtonText: string;
  suggestedAction: 'approve' | 'reject' | undefined;
  initialValue: string;
  updateOnInitialValueChange: boolean;
  textFieldProps: TextFieldProps;
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (updateOnInitialValueChange) setValue(initialValue);
  }, [initialValue, updateOnInitialValueChange]);

  return (
    <Dialog open={isOpen} onClose={onReject}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
        <TextField
          value={value}
          onChange={(e) => setValue(e.target.value)}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...textFieldProps}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant={suggestedAction === 'reject' ? 'contained' : 'text'}
          onClick={() => onReject(value)}
          autoFocus={suggestedAction === 'reject'}
        >
          {rejectButtonText}
        </Button>
        <Button
          variant={suggestedAction === 'approve' ? 'contained' : 'text'}
          onClick={() => onApprove(value)}
          autoFocus={suggestedAction === 'approve'}
        >
          {approveButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TextDialog;
