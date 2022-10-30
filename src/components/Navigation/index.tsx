import React, { useState, useContext } from 'react';
import {
  AppBar,
  Button,
  ButtonBase,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  useTheme,
} from '@mui/material';
import { useAuth, useSigninCheck, useUser } from 'reactfire';
import {
  AccountCircle,
  BubbleChart,
  DarkMode,
  Home,
  LightMode,
  Logout,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { deleteUser } from 'firebase/auth';

import ThemeContext from '../../contexts/MUITheme';
import { useDoesUserHaveMindMaps } from '../ClaimAccount';

const AuthMenuItems = () => {
  const auth = useAuth();
  const user = useUser().data;
  if (!user) throw new Error('No user defined!');
  const navigate = useNavigate();
  const location = useLocation();

  const doesUserHaveMindMaps = useDoesUserHaveMindMaps();

  const [anchorEl, setAnchorEl] = useState<
    (EventTarget & HTMLButtonElement) | null
  >(null);
  const open = Boolean(anchorEl);

  if (!doesUserHaveMindMaps && user.isAnonymous)
    return (
      <Button
        size="large"
        variant="outlined"
        onClick={() => {
          deleteUser(user).then(() => {
            navigate('/signin');
          });
        }}
        disabled={location.pathname.startsWith('/signin')}
        color="inherit"
      >
        Sign In
      </Button>
    );

  return (
    <>
      <IconButton
        onClick={(event) => setAnchorEl(event.currentTarget)}
        color="inherit"
        size="large"
      >
        <AccountCircle />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            navigate('/account');
            setAnchorEl(null);
          }}
        >
          <Home /> My Account
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate('/mindmaps');
          }}
        >
          <BubbleChart /> MindMaps
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            navigate('/');
            auth.signOut().then(() => {
              window.location.reload();
            });
          }}
        >
          <Logout /> Sign out
        </MenuItem>
      </Menu>
    </>
  );
};

const Navigation = () => {
  const signinCheck = useSigninCheck().data;

  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const toggleTheme = useContext(ThemeContext);

  return (
    <div style={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <ButtonBase onClick={() => navigate('/')}>
            <img
              src={`${process.env.PUBLIC_URL}/assets/logos/Simple Bubble Map Logo.png`}
              height="50"
              width="50"
              alt="Bubble Map Logo"
              style={{
                padding: theme.spacing(0.5),
                marginRight: theme.spacing(1),
              }}
            />
            <b>Bubble Map</b>
          </ButtonBase>
          {/* <NavBarItems /> */}
          <div style={{ marginLeft: 'auto', marginRight: 0 }}>
            <IconButton
              style={{ marginInline: 10 }}
              onClick={() => toggleTheme()}
            >
              {theme.palette.mode === 'dark' ? <LightMode /> : <DarkMode />}
            </IconButton>
            {signinCheck.user && <AuthMenuItems />}
            {!signinCheck.user && (
              <Button
                size="large"
                variant="outlined"
                onClick={() => navigate('/signin')}
                disabled={location.pathname.startsWith('/signin')}
                color="inherit"
              >
                Sign In
              </Button>
            )}
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Navigation;
