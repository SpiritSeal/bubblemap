import React from 'react';
import { Alert, Button, Snackbar, SnackbarOrigin } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from 'reactfire';

// eslint-disable-next-line react/require-default-props
const ClaimAccount = ({ location }: { location?: SnackbarOrigin }) => {
  const user = useUser().data;
  const navigate = useNavigate();
  return (
    <Snackbar
      open={user?.providerData?.length === 0}
      anchorOrigin={location ?? { horizontal: 'center', vertical: 'bottom' }}
    >
      <Alert
        variant="filled"
        severity="warning"
        color="warning"
        sx={{ width: '100%' }}
        action={
          <Button
            size="small"
            variant="contained"
            color="inherit"
            onClick={() => {
              navigate('/account?panel=auth-methods');
            }}
          >
            Claim Account
          </Button>
        }
      >
        This account is unclaimed! Claim it now to save your MindMaps.
      </Alert>
    </Snackbar>
  );
};

export default ClaimAccount;
