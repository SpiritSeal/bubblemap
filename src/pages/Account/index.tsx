import React, { SyntheticEvent, useState } from 'react';
import { useUser } from 'reactfire';
import { deleteUser, getIdToken, unlink } from 'firebase/auth';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  Container,
  Divider,
  Typography,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';

import ChangeEmail from './ChangeEmail';
import ChangePassword from './ChangePassword';
import ChangeName from './ChangeName';
import ConfirmationDialog from '../../components/Dialogs/ConfirmationDialog';
import AddAuthMethod from './AddAuthMethod';

const Account = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const expanded = searchParams.get('panel');

  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);

  const handleChange =
    (panel: string) =>
    (e: SyntheticEvent<Element, Event>, isExpanded: boolean) => {
      if (isExpanded) {
        searchParams.set('panel', panel);
      } else {
        searchParams.delete('panel');
      }
      setSearchParams(searchParams);
    };

  const user = useUser().data;
  if (!user) throw new Error('No user defined!');

  return (
    <Container>
      <h1>
        {user.displayName ? `Welcome back, ${user.displayName}` : 'Account'}
        {user.providerData.length === 0 && (
          <>
            {' '}
            <Chip label="Unclaimed" color="warning" />
          </>
        )}
      </h1>
      <Accordion
        expanded={expanded === 'general'}
        onChange={handleChange('general')}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h5" sx={{ width: '33%', flexShrink: 0 }}>
            General settings
          </Typography>
          <Typography
            sx={{
              color: 'text.secondary',
              lineHeight: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {user.providerData.map((a) => a.providerId).includes('password')
              ? 'Change your name, email, or password'
              : 'Change your name or email'}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ChangeName user={user} />
          <Divider />
          <ChangeEmail user={user} />
          {user.providerData.map((a) => a.providerId).includes('password') && (
            <>
              <Divider />
              <ChangePassword user={user} />
            </>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expanded === 'auth-methods'}
        onChange={handleChange('auth-methods')}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h5" sx={{ width: '33%', flexShrink: 0 }}>
            Authentication Methods
          </Typography>
          <Typography
            sx={{
              color: 'text.secondary',
              lineHeight: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Manage the sign in methods for your account
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div>
            <h3>Current Authentication Methods</h3>
            {user.providerData.length < 1 && (
              <h4>
                You have no authentication methods. Add one now to save your
                account.
              </h4>
            )}
            {user.providerData.map((provider) => (
              <div key={provider.providerId}>
                <Chip
                  label={
                    provider.providerId === 'password'
                      ? 'Email/Password'
                      : provider.providerId
                  }
                  sx={{ m: 2 }}
                />
                {provider.email}
                <Button
                  onClick={() => {
                    unlink(user, provider.providerId).then(() => {
                      getIdToken(user, true);
                    });
                  }}
                  sx={{ m: 2 }}
                >
                  Unlink
                </Button>
              </div>
            ))}
            {!(
              user.providerData.map((a) => a.providerId).includes('password') &&
              user.providerData.map((a) => a.providerId).includes('google.com')
            ) && (
              <>
                <h3>Add New Authentication Methods</h3>
                <AddAuthMethod />
              </>
            )}
          </div>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expanded === 'advanced'}
        onChange={handleChange('advanced')}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h5" sx={{ width: '33%', flexShrink: 0 }}>
            Advanced
          </Typography>
          <Typography
            sx={{
              color: 'text.secondary',
              lineHeight: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Delete your account
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            color: 'text.secondary',
            lineHeight: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ConfirmationDialog
            approveButtonText="Delete Account"
            description="Are you sure you want to permanently delete your account?"
            isOpen={deleteAccountDialogOpen}
            onApprove={() => {
              deleteUser(user)
                .then()
                .catch((err) => {
                  console.error(err);
                });
            }}
            onReject={() => {
              setDeleteAccountDialogOpen(false);
            }}
            rejectButtonText="Cancel"
            suggestedAction="reject"
            title="Delete Account?"
          />
          <Button
            variant="outlined"
            color="error"
            size="large"
            onClick={() => {
              setDeleteAccountDialogOpen(true);
            }}
          >
            Delete Account
          </Button>
        </AccordionDetails>
      </Accordion>
    </Container>
  );
};

export default Account;
