import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
// import css file
import './KeyBindsDialog.css';

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
        <Typography variant="body1">
          This is a mind map editor designed and built by Saketh Reddy and Eric
          Podol.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">
          This project is open source. You can find the source code on{' '}
          <a
            href="https://github.com/SpiritSeal/mindmap"
            style={{ color: 'white' }}
          >
            GitHub
          </a>
          .
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">
          If you have any questions or suggestions, feel free to contact us at{' '}
          <a
            href="mailto:
            support@bubblemap.app
          "
            style={{ color: 'white' }}
          >
            support@bubblemap.app
          </a>
          .
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">
          This project is built with React, TypeScript, and Material-UI.
        </Typography>
      </Grid>
    </Grid>
  );

  const mapEntry = (keyCombo: string, value: string) => (
    <TableRow>
      {/* Render the keyCombo as html */}
      <TableCell
        align="center"
        dangerouslySetInnerHTML={{ __html: keyCombo }}
      />
      <TableCell align="center">{value}</TableCell>
    </TableRow>
  );
  const keyShortcutsPanel = (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={2}>
              <Typography variant="h6">Mindmap Data Manipulation</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mapEntry(
            '<kbd>Ctrl</kbd> + <kbd>Enter</kbd>',
            'Add Bubble to Selected Bubble',
          )}
          {mapEntry(
            // Double space 'or' statements using &nbsp&nbsp
            '<kbd>Delete</kbd>&nbsp&nbspor&nbsp&nbsp<kbd>Backspace</kbd>',
            'Delete Selected Bubble',
          )}
          {mapEntry(
            '<kbd>Shift</kbd> + <kbd>Enter</kbd>',
            'Edit Selected Bubble',
          )}
        </TableBody>
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={2}>
              <Typography variant="h6">
                Bubble Selection Manipulation
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mapEntry('<kbd>Up</kbd>', 'Select Parent Bubble')}
          {mapEntry('<kbd>Down</kbd>', 'Select Child Bubble')}
          {mapEntry(
            '<kbd>Left</kbd>',
            'Select Next Sibling Bubble (Counter-Clockwise)',
          )}
          {mapEntry(
            '<kbd>Right</kbd>',
            'Select Next Sibling Bubble (Clockwise)',
          )}
          {/* 'Move selection to root" is '0' or 'ctrl'+'up */}
          {mapEntry(
            '<kbd>0</kbd>&nbsp&nbspor&nbsp&nbsp<kbd>Ctrl</kbd> + <kbd>Up</kbd>',
            'Select Root Bubble',
          )}
        </TableBody>
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={2}>
              <Typography variant="h6">
                Mindmap Physics Simulation and Viewport Manipulation
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        {/* Space, 'l', or 'ctrl+l' map to Lock Bubble */}
        <TableBody>
          {mapEntry(
            '<kbd>Space</kbd>&nbsp&nbspor&nbsp&nbsp<kbd>L</kbd>',
            'Lock Bubble',
          )}
          {/* Reset Pan and Zoom back to Default */}
          {mapEntry(
            '<kbd>Home</kbd>&nbsp&nbspor&nbsp&nbsp<kbd>Ctrl</kbd> + <kbd>0</kbd>',
            'Reset Pan and Zoom',
          )}
        </TableBody>
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={2}>
              <Typography variant="h6">Idea Generation Shortcuts</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Toggle Idea Generation Panel (ctrl+shift+s) */}
          {mapEntry(
            '<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd>',
            'Toggle Idea Generation Panel',
          )}
          {/* Manually Regenerate Ideas (ctrl+shift+enter) */}
          {mapEntry(
            '<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Enter</kbd>',
            'Manually Regenerate Ideas',
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
  const mouseShortcutsPanel = (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={2}>
              <Typography variant="h6">Mouse-Bubble Interactions</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mapEntry('Left Click Bubble', 'Select Bubble')}
          {mapEntry('Drag Bubble', 'Move Bubble')}
          {mapEntry('Right Click Bubble', 'Open Context Menu')}
          {/* Double Click */}
          {mapEntry('Double Click Bubble', 'Edit Bubble Text')}
          {/* Control Click */}
          {mapEntry(
            '<kbd>Ctrl</kbd> + Left Click Bubble',
            'Add Bubble to Selected Bubble',
          )}
          {/* Shift Click */}
          {mapEntry(
            '<kbd>Shift</kbd> + Left Click Bubble',
            'Lock Bubble Position',
          )}
          {/* Alt Click */}
          {mapEntry('<kbd>Alt</kbd> + Left Click Bubble', 'Delete Bubble')}
        </TableBody>
        {/* Mouse-Canvas Interaction */}
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={2}>
              <Typography variant="h6">Mouse-Canvas Interactions</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mapEntry('Drag Canvas', 'Pan Canvas')}
          {mapEntry('Scroll Wheel', 'Zoom Canvas')}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}
      scroll="paper"
      className="help-dialog"
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
      <DialogContent
        dividers
        // Hide scrollbar
      >
        {/* <DialogContent> */}
        <DialogContentText>
          {selectedTab === 0 && aboutPanel}
          {selectedTab === 1 && mouseShortcutsPanel}
          {selectedTab === 2 && keyShortcutsPanel}
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
