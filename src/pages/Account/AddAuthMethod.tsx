import React, { useState } from 'react';
import { Button, TextField, Divider } from '@mui/material';
import { Google } from '@mui/icons-material';
import { useUser } from 'reactfire';
import {
  sendEmailVerification,
  GoogleAuthProvider,
  linkWithPopup,
  EmailAuthProvider,
  linkWithCredential,
} from 'firebase/auth';

const AddAuthMethod = () => {
  const user = useUser().data;
  if (!user) throw new Error('No User Authenticated!');

  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <div>
      {!user.providerData.map((a) => a.providerId).includes('password') && (
        <form
          noValidate
          style={{ textAlign: 'center' }}
          onSubmit={async (e) => {
            e.preventDefault();
            if (password === confirmPassword) {
              const credential = EmailAuthProvider.credential(email, password);

              await linkWithCredential(user, credential)
                .then(({ user: newUser }) => {
                  if (newUser.email) {
                    const actionCodeSettings = {
                      url: window.location.origin,
                      handleCodeInApp: true,
                    };
                    sendEmailVerification(user, actionCodeSettings);
                  }
                })
                .catch((err) => {
                  if (err.code === 'auth/email-already-in-use') {
                    setError(
                      'An account already exists with this email. Please sign in or reset your password instead.',
                    );
                  } else if (err.code === 'auth/weak-password') {
                    setError('Please enter a stronger password.');
                  } else if (err.code === 'auth/invalid-email') {
                    setError(
                      'This email is invalid. Please enter a valid email.',
                    );
                  } else {
                    setError(
                      'Uh oh. Something went wrong. Please try again later.',
                    );
                  }
                });
            } else {
              setError('Your passwords do not match.');
            }
          }}
        >
          {error && <h3 style={{ textAlign: 'center' }}>{error}</h3>}
          <TextField
            type="email"
            label="Email"
            fullWidth
            sx={{ width: '50%' }}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ paddingBottom: '1rem' }}
          />
          <br />
          <TextField
            type="password"
            label="Password"
            fullWidth
            sx={{ width: '50%' }}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ paddingBottom: '1rem' }}
          />
          <br />
          <TextField
            type="password"
            label="Confirm Password"
            fullWidth
            sx={{ width: '50%' }}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <br />
          <br />
          <Button type="submit" color="primary" variant="contained">
            Add Authentication Method
          </Button>
        </form>
      )}
      {!user.providerData.map((a) => a.providerId).includes('password') &&
        !user.providerData.map((a) => a.providerId).includes('google.com') && (
          <Divider sx={{ marginBlock: 3 }} />
        )}
      {!user.providerData.map((a) => a.providerId).includes('google.com') && (
        <div style={{ textAlign: 'center' }}>
          <Button
            onClick={async () => {
              const provider = new GoogleAuthProvider();
              await linkWithPopup(user, provider);
            }}
            startIcon={<Google />}
            variant="outlined"
            color="inherit"
          >
            Continue with Google
          </Button>
        </div>
      )}
    </div>
  );
};

export default AddAuthMethod;
