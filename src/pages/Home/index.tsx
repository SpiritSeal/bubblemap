import React from 'react';
import { Box, Button, Container, styled, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth, useSigninCheck } from 'reactfire';
import { signInAnonymously } from 'firebase/auth';

const HomePage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const signinCheck = useSigninCheck().data;

  const Content = styled(Container)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(8),
    [theme.breakpoints.up('md')]: {
      paddingTop: theme.spacing(16),
      paddingBottom: theme.spacing(8),
      flexDirection: 'row',
      alignItems: 'flex-start',
      textAlign: 'left',
    },
  }));
  const Title = styled('h1')(({ theme }) => ({
    marginLeft: -12,
    whiteSpace: 'nowrap',
    textIndent: '.7rem',
    fontSize: 28,
    [theme.breakpoints.up('md')]: {
      fontSize: 56,
    },
  }));
  const Logo = styled('img')(({ theme }) => ({
    flexShrink: 0,
    width: 120,
    height: 120,
    marginBottom: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      marginRight: theme.spacing(8),
      width: 195,
      height: 175,
    },
  }));

  return (
    <div>
      <Box sx={{ pt: 0 }}>
        <Content maxWidth="md">
          <Logo
            src={`${process.env.PUBLIC_URL}/assets/logos/Mind Map Logo.svg`}
            alt="MindMap Logo"
          />
          <div>
            <Title>Bubble Map</Title>
            <Typography
              variant="h4"
              component="p"
              color="inherit"
              style={{ fontWeight: 'bold' }}
            >
              An intuitive mind mapping tool for rapid collaborative AI-assisted
              idea generation
            </Typography>
            {!signinCheck.user ? (
              <Button
                style={{ marginTop: 10 }}
                onClick={async () => {
                  signInAnonymously(auth).then(() => navigate('/mindmaps'));
                }}
                variant="contained"
                size="large"
              >
                Create Your First MindMap
              </Button>
            ) : (
              <Button
                style={{ marginTop: 10 }}
                onClick={() => navigate('/mindmaps')}
                variant="contained"
              >
                Browse Your Mindmaps
              </Button>
            )}
          </div>
        </Content>
      </Box>
    </div>
  );
};

export default HomePage;
