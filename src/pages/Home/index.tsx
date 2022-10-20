import React from 'react';
import { Box, Button, Container, styled, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth, useFirestore, useUser } from 'reactfire';
import { signInAnonymously } from 'firebase/auth';
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
  const user = useUser().data;

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

  const mindmapsCollection = collection(firestore, 'mindmaps');

  const createMindMap = (title: string) => {
    if (!user) return;
    const newDocData: MindMap = {
      metadata: {
        createdAt: serverTimestamp() as Timestamp,
        createdBy: user.uid,
        updatedAt: serverTimestamp() as Timestamp,
        updatedBy: user.uid,
      },
      nodes: [
        {
          parent: 0,
          text: title,
          id: 0,
        },
      ],
      permissions: {
        owner: user.uid,
        delete: [],
        read: [],
        write: [],
      },
      title,
    };
    addDoc(mindmapsCollection, newDocData).then((newDoc) => {
      navigate(newDoc.id);
    });
  };

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
            {!user ? (
              <Button
                style={{ marginTop: 10 }}
                onClick={async () => {
                  signInAnonymously(auth).then(() =>
                    createMindMap('Untitled MindMap')
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
