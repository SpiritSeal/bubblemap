import React, { useState } from 'react';
import {
  Button,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Paper,
  Divider,
} from '@mui/material';
import { Google } from '@mui/icons-material';

import { useAuth } from 'reactfire';

import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  setPersistence,
  indexedDBLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { Link } from 'react-router-dom';

const SignIn = () => {
  const auth = useAuth();

  const [displaySignInForm, setDisplaySignInForm] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        {displaySignInForm && (
          <div>
            <form
              noValidate
              onSubmit={async (e) => {
                e.preventDefault();
                await setPersistence(
                  auth,
                  rememberMe
                    ? indexedDBLocalPersistence
                    : browserSessionPersistence,
                ).then(async () => {
                  await signInWithEmailAndPassword(auth, email, password).catch(
                    (err) => {
                      if (err.code === 'auth/wrong-password') {
                        setError('Wrong Password');
                      } else if (err.code === 'auth/user-not-found') {
                        setError('User not Found');
                      } else if (err.code === 'auth/user-disabled') {
                        setError('This user has been disabled');
                      } else if (err.code === 'auth/invalid-email') {
                        setError('Please enter a valid email');
                      }
                    },
                  );
                });
              }}
            >
              <h1 style={{ textAlign: 'center' }}>Sign In</h1>
              <p style={{ textAlign: 'center' }}>
                Welcome! If you already have registered for an account, please
                sign in here. If you do not have an account, please{' '}
                <Link to="/createaccount">click here to create one.</Link>
              </p>
              {error && <h3 style={{ textAlign: 'center' }}>{error}</h3>}
              <TextField
                id="email"
                type="email"
                label="Email"
                fullWidth
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
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
              <div style={{ float: 'right', paddingTop: 3 }}>
                <Button
                  size="small"
                  onClick={() => {
                    setError(null);
                    setPassword('');
                    setDisplaySignInForm((current) => !current);
                  }}
                >
                  Reset password instead
                </Button>
              </div>
              <Button type="submit" color="primary" variant="contained">
                <p className="m-0">Sign In</p>
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
                Sign In with Google
              </Button>
            </div>
          </div>
        )}
        {!displaySignInForm && (
          <form
            noValidate
            onSubmit={async (e) => {
              e.preventDefault();
              const actionCodeSettings = {
                url: window.location.origin,
                handleCodeInApp: true,
              };
              await sendPasswordResetEmail(auth, email, actionCodeSettings)
                .then(() => {
                  setDisplaySignInForm((current) => !current);
                })
                .catch((err) => {
                  if (err.code === 'auth/user-not-found') {
                    setError('User not Found');
                  } else if (err.code === 'auth/user-disabled') {
                    setError('This user has been disabled');
                  } else if (err.code === 'auth/invalid-email') {
                    setError('Please enter a valid email');
                  } else {
                    console.error(err);
                    setError(`Internal error: ${err.code}`);
                  }
                });
            }}
          >
            <DialogTitle>
              <h2>Reset Password</h2>
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                If you already have an account, but forgot your password, enter
                your email here.
              </DialogContentText>
              {error && <h3 style={{ textAlign: 'center' }}>{error}</h3>}
              <TextField
                id="email"
                type="email"
                label="Email"
                fullWidth
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <br />
              <div style={{ float: 'right', paddingTop: 3 }}>
                <Button
                  size="small"
                  onClick={() => {
                    setError(null);
                    setPassword('');
                    setDisplaySignInForm((current) => !current);
                  }}
                >
                  Sign In instead
                </Button>
              </div>
            </DialogContent>
            <DialogActions>
              <Button type="submit" color="primary" variant="contained">
                <p className="m-0">Reset Password</p>
              </Button>
            </DialogActions>
          </form>
        )}
      </Paper>
    </div>
  );
};

export default SignIn;
