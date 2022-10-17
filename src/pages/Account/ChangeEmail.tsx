import React, { useState } from 'react';
import {
  Button,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  reauthenticateWithCredential,
  updateEmail,
  User,
  EmailAuthProvider,
} from 'firebase/auth';

const ChangeEmail = ({ user }: { user: User }) => {
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <h4>Change Email</h4>
      {error && <h5 style={{ textAlign: 'center' }}>{error}</h5>}

      <form
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();
          reauthenticateWithCredential(
            user,
            EmailAuthProvider.credential(user?.email || '', password)
          )
            .then(async () => {
              await updateEmail(user, email)
                .then(() => {
                  setError(`Email successfully updated to ${email}`);
                  setEmail('');
                  setPassword('');
                })
                .catch((err) => {
                  if (err.code === 'auth/email-already-in-use')
                    setError('This email is already in use.');
                  else if (err.code === 'auth/invalid-email')
                    setError('Invalid email.');
                  else if (err.code === 'auth/requires-recent-login')
                    setError('Please sign out, then back in, and try again.');
                  else setError(err.code);
                });
            })
            .catch((err) => {
              if (err.code === 'auth/user-mismatch') setError('User mismatch.');
              else if (err.code === 'auth/wrong-password')
                setError('Incorrect password.');
              else setError(err.code);
            });
        }}
      >
        <Grid container spacing={2}>
          {user.email && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Email"
                value={user.email}
                autoComplete="none"
                disabled
              />
            </Grid>
          )}
          <Grid item xs={12} sm={user.email ? 6 : 12}>
            <TextField
              autoFocus
              required
              fullWidth
              name="password"
              label="Current Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((current) => !current)}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="email"
              label="New Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Grid>
        </Grid>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Change Email
        </Button>
      </form>
    </div>
  );
};

export default ChangeEmail;
