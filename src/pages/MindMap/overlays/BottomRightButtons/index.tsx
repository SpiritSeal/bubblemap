import React, { useState } from 'react';
import { CenterFocusStrong, QuestionMark } from '@mui/icons-material';
import { Fab } from '@mui/material';
import KeyBindsDialog from './KeyBindsDialog';

const HelpButton = () => {
  const [isKeyBindsDialogOpen, setIsKeyBindsDialogOpen] = useState(false);

  return (
    <>
      <KeyBindsDialog
        open={isKeyBindsDialogOpen}
        handleClose={() => setIsKeyBindsDialogOpen(false)}
      />
      <Fab
        onClick={() => setIsKeyBindsDialogOpen(true)}
        // variant="extended"
        sx={{
          right: 20,
          bottom: 20,
          position: 'absolute',
        }}
      >
        <QuestionMark />
      </Fab>
    </>
  );
};

const ResetViewportButton = () => {
  // eslint-disable-next-line
  const one = 1;
  return (
    <Fab
      sx={{
        right: 20,
        bottom: 80,
        position: 'absolute',
      }}
      onClick={() => {
        // reset the viewport
      }}
    >
      <CenterFocusStrong />
    </Fab>
  );
};

const BottomRightButtons = ({
  drawerOpen,
  drawerWidth,
}: {
  // State
  drawerOpen: boolean;
  // Drawer width
  drawerWidth: number;
}) => (
  <div
    // if drawerOpen set sx to "transform: translateX(-240.4px); transition: transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms;"
    style={{
      position: 'absolute',
      right: 0,
      bottom: 0,
      // if drawerOpen set sx to "transform: translateX(-240.4px); transition: transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms;"
      transform: drawerOpen
        ? `translateX(-${drawerWidth}px)`
        : 'translateX(0px)',
      // If drawerOpen set sx to "transition: transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms;"
      // Otherwise set sx to "transition: transform 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms;"
      transition: drawerOpen
        ? 'transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms'
        : 'transform 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
    }}
  >
    <HelpButton />
    <ResetViewportButton />
  </div>
);

export default BottomRightButtons;
