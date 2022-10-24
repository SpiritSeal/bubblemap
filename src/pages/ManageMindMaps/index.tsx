import React, { useState } from 'react';
import {
  Paper,
  Button,
  ButtonGroup,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Dialog,
  Skeleton,
  Chip,
  Snackbar,
} from '@mui/material';
import {
  Add,
  BubbleChart,
  Close,
  Delete,
  DriveFileRenameOutline,
  Link as LinkIcon,
  PersonAdd,
} from '@mui/icons-material';
import {
  useNavigate,
  useSearchParams,
  Link as RouterLink,
} from 'react-router-dom';
import { useFirestore, useFirestoreCollectionData, useUser } from 'reactfire';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import { MindMap, RecursivePartial, WithID } from '../../types';
import ShareDialog from './ShareDialog';
import ConfirmationDialog from '../../components/Dialogs/ConfirmationDialog';

const ManageMindMaps = () => {
  const user = useUser().data;
  if (!user) throw new Error('No User Authenticated!');
  const firestore = useFirestore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openShareDialog, setOpenShareDialog] = useState<MindMap | null>(null);
  const [openDeleteMindMapConfirmation, setOpenDeleteMindMapConfirmation] =
    useState<string | null>(null);

  const mindmapsCollection = collection(firestore, 'mindmaps');

  let mindmapsQuery = query(
    mindmapsCollection,
    orderBy('metadata.updatedAt', 'desc')
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
      where('permissions.read', 'array-contains', user.uid)
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
        everUpdatedBy: [user.uid],
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
        canPublicEdit: false,
        isPublic: false,
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

  // Snackbar stuff
  interface SnackbarMessage {
    message: string;
    key: number;
  }

  const [snackPack, setSnackPack] = React.useState<readonly SnackbarMessage[]>(
    []
  );
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [messageInfo, setMessageInfo] = React.useState<
    SnackbarMessage | undefined
  >(undefined);

  React.useEffect(() => {
    if (snackPack.length && !messageInfo) {
      // Set a new snack when we don't have an active one
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setSnackbarOpen(true);
    } else if (snackPack.length && messageInfo && snackbarOpen) {
      // Close an active snack when a new one is added
      setSnackbarOpen(false);
    }
  }, [snackPack, messageInfo, snackbarOpen]);

  const handleSnackbarClick = (message: string) => () => {
    setSnackPack((prev) => [...prev, { message, key: new Date().getTime() }]);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSnackbarExited = () => {
    setMessageInfo(undefined);
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
        marginBottom: {
          xs: '.5rem',
          sm: '.5rem',
          md: '.5rem',
          lg: '1rem',
          xl: '2rem',
        },
        marginLeft: {
          xs: '1rem',
          sm: '2rem',
          md: '5rem',
          lg: '10rem',
          xl: '15rem',
        },
        marginRight: {
          xs: '1rem',
          sm: '2rem',
          md: '5rem',
          lg: '10rem',
          xl: '15rem',
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
          startIcon={<Add />}
          variant="contained"
          onClick={() => {
            handleCreateMindMap();
          }}
        >
          New Mind Map
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
      <div
        style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <Dialog
          open={!!openShareDialog}
          onClose={() => setOpenShareDialog(null)}
        >
          {openShareDialog && <ShareDialog mindmap={openShareDialog} />}
        </Dialog>
        {mindmaps.map((mindmap) => (
          <Card
            sx={{ width: '100%', maxWidth: '345px', margin: '1rem' }}
            elevation={2}
            key={mindmap.ID}
          >
            <CardActionArea component={RouterLink} to={mindmap.ID}>
              <CardMedia>
                <BubbleChart
                  sx={{ width: '90%', height: '90%', textAlign: 'center' }}
                />
              </CardMedia>
              <CardContent>
                <Typography
                  gutterBottom
                  variant="h5"
                  component="div"
                  noWrap
                  sx={{ maxWidth: '100%' }}
                >
                  {mindmap.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {mindmap.permissions.owner === user.uid
                    ? 'Owned by you'
                    : 'Shared with you'}
                  <br />
                  {`${mindmap.nodes.length} node${
                    mindmap.nodes.length !== 1 ? 's' : ''
                  }`}
                  {mindmap.metadata.updatedAt ? (
                    <>
                      <br />
                      Last modified{' '}
                      {mindmap.metadata.updatedAt.toDate().toLocaleDateString()}
                    </>
                  ) : (
                    <Skeleton animation="wave" />
                  )}
                </Typography>
              </CardContent>
            </CardActionArea>
            <CardActions
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <IconButton
                type="button"
                onClick={() => {
                  // Open snackbar
                  handleSnackbarClick('Copied to clipboard')();
                  navigator.clipboard.writeText(
                    `${window.location.origin}/mindmaps/${mindmap.ID}`
                  );
                }}
                aria-label="copy link to clipboard"
              >
                <LinkIcon />
              </IconButton>
              <Snackbar
                key="Link copied to clipboard"
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                TransitionProps={{ onExited: handleSnackbarExited }}
                message="Link copied to clipboard"
                // position bottom right
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    sx={{ p: 0.5 }}
                    onClick={handleSnackbarClose}
                  >
                    <Close />
                  </IconButton>
                }
              />
              <IconButton
                type="button"
                onClick={() => {
                  setOpenShareDialog(mindmap);
                }}
                aria-label="open share dialog"
                disabled
              >
                <PersonAdd />
              </IconButton>
              <ConfirmationDialog
                approveButtonText="Delete MindMap"
                description={
                  <>
                    Are you sure you want to <b>permanently delete</b>{' '}
                    <Chip
                      component="b"
                      clickable
                      label={mindmap.title}
                      onClick={() => navigate(`/mindmaps/${mindmap.ID}`)}
                    />
                    ? Deleted MindMaps can not be recovered.
                  </>
                }
                isOpen={openDeleteMindMapConfirmation === mindmap.ID}
                onApprove={() => {
                  deleteDoc(doc(firestore, 'mindmaps', mindmap.ID));
                  setOpenDeleteMindMapConfirmation(null);
                }}
                onReject={() => setOpenDeleteMindMapConfirmation(null)}
                rejectButtonText="Cancel"
                suggestedAction="reject"
                title="Delete MindMap?"
              />
              <IconButton
                type="button"
                disabled={mindmap.permissions.owner !== user.uid}
                onClick={() => {
                  setOpenDeleteMindMapConfirmation(mindmap.ID);
                }}
                aria-label="delete mindmap"
              >
                <Delete />
              </IconButton>
              <IconButton
                type="button"
                onClick={() => {
                  // eslint-disable-next-line no-alert
                  const newTitle = prompt(
                    `What would you like to rename ${mindmap.title} to?`,
                    mindmap.title
                  );
                  if (newTitle) {
                    const updatedDocFields: RecursivePartial<MindMap> = {
                      metadata: {
                        updatedAt: serverTimestamp() as Timestamp,
                        updatedBy: user.uid,
                      },
                      title: newTitle,
                    };
                    setDoc(
                      doc(firestore, 'mindmaps', mindmap.ID),
                      updatedDocFields,
                      {
                        merge: true,
                      }
                    );
                  }
                }}
                aria-label="rename mindmap"
              >
                <DriveFileRenameOutline />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </div>
      {mindmaps.length === 0 && (
        <div style={{ textAlign: 'center', margin: '1rem' }}>
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
