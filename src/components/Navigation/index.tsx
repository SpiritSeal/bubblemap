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
import { useAuth, useSigninCheck } from 'reactfire';
import {
  AccountCircle,
  BubbleChart,
  DarkMode,
  Home,
  LightMode,
  Logout,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

import ThemeContext from '../../contexts/MUITheme';

const Navigation = () => {
  const auth = useAuth();
  const signinCheck = useSigninCheck().data;

  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const toggleTheme = useContext(ThemeContext);

  const [anchorEl, setAnchorEl] = useState<
    (EventTarget & HTMLButtonElement) | null
  >(null);
  const open = Boolean(anchorEl);

  return (
    <div style={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <ButtonBase onClick={() => navigate('/')}>
            <img
              src={`${process.env.PUBLIC_URL}/assets/logos/Mind Map Logo.svg`}
              height="50"
              width="50"
              alt="Mind Map Logo"
            />
            <strong> Mind Map</strong>
          </ButtonBase>
          {/* <NavBarItems /> */}
          <div style={{ marginLeft: 'auto', marginRight: 0 }}>
            <IconButton
              style={{ marginInline: 10 }}
              onClick={() => toggleTheme()}
            >
              {theme.palette.mode === 'dark' ? <LightMode /> : <DarkMode />}
            </IconButton>
            {signinCheck.user && (
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
                      navigate('.');
                      auth.signOut().then(() => {
                        window.location.reload();
                      });
                    }}
                  >
                    <Logout /> Sign out
                  </MenuItem>
                </Menu>
              </>
            )}
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
