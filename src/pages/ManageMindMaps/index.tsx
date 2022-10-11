import React from 'react';
import { Button, ButtonGroup, Paper } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFirestore, useFirestoreCollectionData, useUser } from 'reactfire';
import {
  addDoc,
  collection,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from 'firebase/firestore';
import { MindMap, WithID } from '../../types';

const ManageMindMaps = () => {
  const user = useUser().data;
  if (!user) throw new Error('No User Authenticated!');
  const firestore = useFirestore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const mindmapsCollection = collection(firestore, 'mindmaps');

  let mindmapsQuery = query(
    mindmapsCollection,
    where('permissions.read', 'array-contains', user.uid)
  );

  if (searchParams.get('filter') === 'owned') {
    mindmapsQuery = query(
      mindmapsQuery,
      where('permissions.owner', '==', user.uid)
    );
  }

  if (searchParams.get('filter') === 'shared') {
    mindmapsQuery = query(
      mindmapsQuery,
      where('permissions.owner', '!=', user.uid)
    );
  }

  const mindmaps: WithID<MindMap>[] = useFirestoreCollectionData(
    mindmapsQuery,
    {
      idField: 'ID',
    }
  ).data as WithID<MindMap>[];

  const createMindMap = (title: string) => {
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
        delete: [user.uid],
        read: [user.uid],
        write: [user.uid],
      },
      title,
    };
    addDoc(mindmapsCollection, newDocData).then((newDoc) => {
      navigate(newDoc.id);
    });
  };

  const handleCreateMindMap = () => {
    // eslint-disable-next-line no-alert
    const title = window.prompt('What would you like to ideate upon?')?.trim();
    createMindMap(
      // eslint-disable-next-line
      title === null || title === '' ? 'Untitled Mind Map' : title!
    );
  };

  return (
    <Paper
      sx={{
        marginTop: {
          xs: '.5rem',
          sm: '.5rem',
          md: '1rem',
          lg: '2rem',
          xl: '4rem',
        },
        marginLeft: {
          xs: '1rem',
          sm: '2rem',
          md: '10rem',
          lg: '20rem',
          xl: '30rem',
        },
        marginRight: {
          xs: '1rem',
          sm: '2rem',
          md: '10rem',
          lg: '20rem',
          xl: '30rem',
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
      <div style={{ textAlign: 'center' }}>
        <h1>MindMaps</h1>
        <Button
          variant="contained"
          onClick={() => {
            handleCreateMindMap();
          }}
        >
          Create a Mind Map!
        </Button>
        <br />
        <br />
        <ButtonGroup variant="outlined">
          <Button
            disabled={searchParams.get('filter') === null}
            onClick={() => {
              searchParams.delete('filter');
              setSearchParams(searchParams);
            }}
          >
            All MindMaps
          </Button>
          <Button
            disabled={searchParams.get('filter') === 'owned'}
            onClick={() => {
              searchParams.set('filter', 'owned');
              setSearchParams(searchParams);
            }}
          >
            Your MindMaps
          </Button>
          <Button
            disabled={searchParams.get('filter') === 'shared'}
            onClick={() => {
              searchParams.set('filter', 'shared');
              setSearchParams(searchParams);
            }}
          >
            Shared With You
          </Button>
        </ButtonGroup>
      </div>
      {mindmaps.map((mindmap) => (
        <Button
          key={mindmap.ID}
          onClick={() => {
            navigate(mindmap.ID);
          }}
        >
          {mindmap.title}
        </Button>
      ))}
      {mindmaps.length === 0 && (
        <div style={{ textAlign: 'center' }}>
          <Button
            onClick={() => {
              handleCreateMindMap();
            }}
          >
            You don&apos;t have any MindMaps. Create one now!
          </Button>
        </div>
      )}
    </Paper>
  );
};

export default ManageMindMaps;
