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
  onReject: () => void;
  title: string;
  description?: ReactNode;
  approveButtonText?: string;
  rejectButtonText?: string;
  suggestedAction?: 'approve' | 'reject' | undefined;
  initialValue?: string;
  updateOnInitialValueChange?: boolean;
  textFieldProps?: TextFieldProps;
}) => {
  const [value, setValue] = useState(initialValue || '');

  useEffect(() => {
    if (updateOnInitialValueChange && initialValue) setValue(initialValue);
  }, [initialValue, updateOnInitialValueChange]);

  const onClose = () => {
    setValue(initialValue || '');
    onReject();
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <form
        onSubmit={(e) => {
          onApprove(value);
          onClose();
          e.preventDefault();
        }}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          {description && <DialogContentText>{description}</DialogContentText>}
          <TextField
            sx={{ m: 2 }}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputProps={{ autoFocus: true }}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...textFieldProps}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant={suggestedAction === 'reject' ? 'contained' : 'text'}
            onClick={() => onClose()}
            type={suggestedAction === 'reject' ? 'submit' : 'button'}
          >
            {rejectButtonText}
          </Button>
          <Button
            variant={suggestedAction === 'approve' ? 'contained' : 'text'}
            onClick={() => onApprove(value)}
            type={suggestedAction === 'approve' ? 'submit' : 'button'}
          >
            {approveButtonText}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TextDialog;
