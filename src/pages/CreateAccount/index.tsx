import React, { useState } from 'react';
import {
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Paper,
  Divider,
} from '@mui/material';

import { useAuth } from 'reactfire';

import {
  setPersistence,
  indexedDBLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { Link } from 'react-router-dom';
import { Google } from '@mui/icons-material';

const CreateAccount = () => {
  const auth = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Paper
        sx={{
          marginTop: {
            xs: '1rem',
            sm: '1rem',
            md: '2rem',
            lg: '4rem',
            xl: '7rem',
          },
          marginLeft: {
            xs: '1rem',
            sm: '2rem',
            md: '15rem',
            lg: '25rem',
            xl: '35rem',
          },
          marginRight: {
            xs: '1rem',
            sm: '2rem',
            md: '15rem',
            lg: '25rem',
            xl: '35rem',
          },
          padding: {
            xs: '1rem',
            sm: '1rem',
            md: '1rem',
            lg: '2rem',
            xl: '3rem',
          },
        }}
      >
        <form
          noValidate
          style={{ textAlign: 'center' }}
          onSubmit={async (e) => {
            e.preventDefault();
            if (password === confirmPassword) {
              await setPersistence(
                auth,
                rememberMe
                  ? indexedDBLocalPersistence
                  : browserSessionPersistence,
              ).then(async () => {
                await createUserWithEmailAndPassword(auth, email, password)
                  .then(({ user }) => {
                    if (user.email) {
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
              });
            } else {
              setError('Your passwords do not match.');
            }
          }}
        >
          <h1>Create Account</h1>
          <p>
            Welcome! If you do not have an account, please create one here. If
            you already have an account, please{' '}
            <Link to="/signin">sign in instead.</Link>
          </p>
          {error && <h3 style={{ textAlign: 'center' }}>{error}</h3>}
          <TextField
            id="email"
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
            id="password"
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
            id="confirmPassword"
            type="password"
            label="Confirm Password"
            fullWidth
            sx={{ width: '50%' }}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <br />
          <FormControlLabel
            style={{ marginTop: '.5rem' }}
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                name="rememberMe"
                color="primary"
              />
            }
            label="Remember Me"
          />
          <br />
          <Button type="submit" color="primary" variant="contained">
            <p className="m-0">Create Account</p>
          </Button>
        </form>
        <Divider sx={{ marginBlock: 3 }} />
        <div style={{ textAlign: 'center' }}>
          <Button
            onClick={async () => {
              const provider = new GoogleAuthProvider();
              await signInWithPopup(auth, provider);
            }}
            startIcon={<Google />}
            variant="outlined"
            color="inherit"
          >
            Continue with Google
          </Button>
        </div>
      </Paper>
    </div>
  );
};

export default CreateAccount;
