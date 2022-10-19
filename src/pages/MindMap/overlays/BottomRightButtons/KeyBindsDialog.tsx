import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { getApplicationKeyMap } from 'react-hotkeys';

const KeyBindsDialog = ({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) => {
  // Set a state for the selected tab
  const [selectedTab, setSelectedTab] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const aboutPanel = (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">About</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">
          This is a mind map editor. It is a work in progress.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">
          This project is open source. You can find the source code on{' '}
          <a href="https://github.com/SpiritSeal/mindmap">GitHub</a>.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">
          This project is built with React, TypeScript, and Material-UI.
        </Typography>
      </Grid>
    </Grid>
  );

  const keyMap = getApplicationKeyMap();
  return (
    <Dialog
      // fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}
      scroll="paper"
    >
      <DialogTitle>
        <Tabs value={selectedTab} onChange={handleTabChange} centered>
          <Tab label="About" />
          <Tab label="Mouse Shortcuts" />
          <Tab label="Keyboard Shortcuts" />
        </Tabs>
        {/* Set the title to the name of the selected tab */}
        <Typography variant="h6">
          {
            // eslint-disable-next-line
          selectedTab === 0
              ? 'About'
              : selectedTab === 1
              ? 'Mouse Shortcuts'
              : 'Keyboard Shortcuts'
          }
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {/* <DialogContent> */}
        <DialogContentText>
          {selectedTab === 0 && aboutPanel}
          {selectedTab === 1 && 'test1'}
          {selectedTab === 2 && 'test2'}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          Close
        </Button>
      </DialogActions>
      {/* </Box> */}
    </Dialog>
  );
};

export default KeyBindsDialog;
