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
  updatePassword,
  User,
  EmailAuthProvider,
} from 'firebase/auth';

const ChangePassword = ({ user }: { user: User }) => {
  const [error, setError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <h4>Change Password</h4>
      {error && <h5 style={{ textAlign: 'center' }}>{error}</h5>}
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          reauthenticateWithCredential(
            user,
            EmailAuthProvider.credential(user?.email || '', currentPassword),
          )
            .then(async () => {
              await updatePassword(user, newPassword)
                .then(() => {
                  setError('Password Changed!');
                  setNewPassword('');
                  setCurrentPassword('');
                })
                .catch((err) => {
                  setError(`An error occurred: ${err.code}`);
                });
            })
            .catch((err) => {
              if (err.code === 'auth/user-mismatch')
                setError('Incorrect password.');
              else setError(err.code);
            });
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              autoFocus
              required
              fullWidth
              name="currentPassword"
              label="Current Password"
              type={showPassword ? 'text' : 'password'}
              id="currentPassword"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
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
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="newPassword"
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              name="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
        </Grid>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Change Password
        </Button>
      </form>
    </div>
  );
};

export default ChangePassword;
