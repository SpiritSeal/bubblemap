import React from 'react';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

import { MindMap } from '../../../types';

const ShareDialog = ({ mindmap }: { mindmap: MindMap }) => (
  <div>
    <DialogTitle>Share</DialogTitle>
    <DialogContent>
      <DialogContentText>{mindmap.title}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button>Cancel</Button>
      <Button>Subscribe</Button>
    </DialogActions>
  </div>
);

export default ShareDialog;
