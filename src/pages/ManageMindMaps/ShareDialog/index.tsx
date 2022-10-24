import React from 'react';
import {
  Button,
  ButtonGroup,
  Chip,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useFirestore, useUser } from 'reactfire';
import { doc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { MindMap, RecursivePartial, WithID } from '../../../types';

const ShareDialog = ({
  mindmap,
  handleClose,
}: {
  mindmap: WithID<MindMap>;
  handleClose: () => void;
}) => {
  const firestore = useFirestore();
  const user = useUser().data;

  const navigate = useNavigate();

  // eslint-disable-next-line no-nested-ternary
  const status = mindmap.permissions.isPublic
    ? mindmap.permissions.canPublicEdit
      ? 'edit'
      : 'view'
    : 'private';

  const updateSharing = (newStatus: 'private' | 'view' | 'edit') => {
    if (!user) return;
    const updatedDocFields: RecursivePartial<MindMap> = {
      metadata: {
        updatedAt: serverTimestamp() as Timestamp,
        updatedBy: user.uid,
      },
      permissions: {
        canPublicEdit: newStatus === 'edit',
        isPublic: newStatus !== 'private',
      },
    };
    setDoc(doc(firestore, 'mindmaps', mindmap.ID), updatedDocFields, {
      merge: true,
    }).then(() => handleClose());
  };

  return (
    <div>
      <DialogTitle>
        Share{' '}
        <Chip
          component="b"
          clickable
          label={mindmap.title}
          onClick={() => navigate(`/mindmaps/${mindmap.ID}`)}
        />
      </DialogTitle>
      <DialogContent>
        <ButtonGroup variant="outlined">
          <Button
            disabled={status === 'private'}
            onClick={() => {
              updateSharing('private');
            }}
          >
            Private
          </Button>
          <Button
            disabled={status === 'view'}
            onClick={() => {
              updateSharing('view');
            }}
          >
            Anyone with the link can view
          </Button>
          <Button
            disabled={status === 'edit'}
            onClick={() => {
              updateSharing('edit');
            }}
          >
            Anyone with the link can edit
          </Button>
        </ButtonGroup>
      </DialogContent>
    </div>
  );
};

export default ShareDialog;
