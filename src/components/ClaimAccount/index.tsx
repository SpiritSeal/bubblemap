import React from 'react';
import { Alert, Button, Snackbar, SnackbarOrigin } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFirestore, useFirestoreCollection, useUser } from 'reactfire';
import { collection, query, where } from 'firebase/firestore';

/*
 * User must exist when calling this hook
 * Will return true if the user has mindmaps
 */
export const useDoesUserHaveMindMaps = () => {
  const user = useUser().data;
  if (!user) throw new Error('A user must exist.');
  const firestore = useFirestore();

  const ownedMindmapsQuery = query(
    collection(firestore, 'mindmaps'),
    where('permissions.owner', '==', user.uid)
  );

  const ownedMindmaps = useFirestoreCollection(ownedMindmapsQuery).data;

  return !ownedMindmaps.empty;
};

// eslint-disable-next-line react/require-default-props
const ClaimAccount = ({ location }: { location?: SnackbarOrigin }) => {
  const user = useUser().data;
  if (!user) throw new Error('A user must exist.');
  const navigate = useNavigate();

  const doesUserHaveMindMaps = useDoesUserHaveMindMaps();

  if (doesUserHaveMindMaps && user.isAnonymous)
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

  return null;
};

export default ClaimAccount;
