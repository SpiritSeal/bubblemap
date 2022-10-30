import React from 'react';
import { Box, Button, Container, styled, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth, useFirestore, useSigninCheck } from 'reactfire';
import { signInAnonymously, UserCredential } from 'firebase/auth';
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { MindMap } from '../../types';

const HomePage = () => {
  const auth = useAuth();
  const firestore = useFirestore();
  const navigate = useNavigate();
  const signInCheck = useSigninCheck().data;

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
    width: 250,
    height: 250,
    marginBottom: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      margin: 50,
      marginRight: theme.spacing(8),
      width: 350,
      height: 350,
    },
  }));

  const mindmapsCollection = collection(firestore, 'mindmaps');

  const createMindMap = (title: string, user: UserCredential) => {
    const newDocData: MindMap = {
      metadata: {
        createdAt: serverTimestamp() as Timestamp,
        createdBy: user.user.uid,
        updatedAt: serverTimestamp() as Timestamp,
        updatedBy: user.user.uid,
        everUpdatedBy: [user.user.uid],
      },
      nodes: [
        {
          parent: 0,
          text: title,
          id: 0,
        },
      ],
      permissions: {
        owner: user.user.uid,
        canPublicEdit: false,
        isPublic: false,
      },
      title,
    };
    addDoc(mindmapsCollection, newDocData).then((newDoc) => {
      navigate(`/mindmaps/${newDoc.id}`);
    });
  };

  return (
    <div>
      <Box sx={{ pt: 0 }}>
        <Content maxWidth="md">
          <Logo
            src={`${process.env.PUBLIC_URL}/assets/logos/Bubble Map Logo.png`}
            alt="Bubble Map Logo"
          />
          <div>
            <Title>Bubble Map</Title>
            <Typography
              variant="h4"
              component="p"
              color="inherit"
              style={{ fontWeight: 'bold' }}
            >
              Free, AI-Assisted
              <br /> <b>Mind Mapping</b>
            </Typography>
            {!signInCheck.user ? (
              <Button
                style={{ marginTop: 10 }}
                onClick={async () => {
                  signInAnonymously(auth).then((user) =>
                    createMindMap('Untitled MindMap', user)
                  );
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
