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
        <Typography variant="h6">About</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">
          This is a mind map editor designed and built by Saketh Reddy and Eric
          Podol.
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
          If you have any questions or suggestions, feel free to contact us at{' '}
          <a
            href="mailto:
            support@bubblemap.app
          "
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
            'Add Child Node to Selected Node'
          )}
          {mapEntry(
            // Double space 'or' statements using &nbsp&nbsp
            '<kbd>Delete</kbd>&nbsp&nbspor&nbsp&nbsp<kbd>Backspace</kbd>',
            'Delete Selected Node'
          )}
          {mapEntry(
            // Enter -> Edit Node Text
            '<kbd>Enter</kbd>',
            'Edit Selected Node Text'
          )}
        </TableBody>
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={2}>
              <Typography variant="h6">Node Selection Manipulation</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mapEntry('<kbd>Up</kbd>', 'Select Parent Node')}
          {mapEntry('<kbd>Down</kbd>', 'Select Child Node')}
          {mapEntry(
            '<kbd>Left</kbd>',
            'Select Next Sibling Node (Counter-Clockwise)'
          )}
          {mapEntry('<kbd>Right</kbd>', 'Select Next Sibling Node (Clockwise)')}
          {/* 'Move selection to root" is '0' or 'ctrl'+'up */}
          {mapEntry(
            '<kbd>0</kbd>&nbsp&nbspor&nbsp&nbsp<kbd>Ctrl</kbd> + <kbd>Up</kbd>',
            'Select Root Node'
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
        {/* Space, 'l', or 'ctrl+l' map to Lock Node */}
        <TableBody>
          {mapEntry(
            '<kbd>Space</kbd>&nbsp&nbspor&nbsp&nbsp<kbd>L</kbd>',
            'Lock Node'
          )}
          {/* Reset Pan and Zoom back to Default */}
          {mapEntry(
            '<kbd>Home</kbd>&nbsp&nbspor&nbsp&nbsp<kbd>Ctrl</kbd> + <kbd>0</kbd>',
            'Reset Pan and Zoom'
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
            'Toggle Idea Generation Panel'
          )}
          {/* Manually Regenerate Ideas (ctrl+shift+enter) */}
          {mapEntry(
            '<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Enter</kbd>',
            'Manually Regenerate Ideas'
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
              <Typography variant="h6">Mouse-Node Interactions</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mapEntry('Left Click Node', 'Select Node')}
          {mapEntry('Drag Node', 'Move Node')}
          {mapEntry('Right Click Node', 'Open Context Menu')}
          {/* Double Click */}
          {mapEntry('Double Click Node', 'Edit Node Text')}
          {/* Control Click */}
          {mapEntry(
            '<kbd>Ctrl</kbd> + Left Click Node',
            'Add Child Node to Selected Node'
          )}
          {/* Shift Click */}
          {mapEntry('<kbd>Shift</kbd> + Left Click Node', 'Lock Node Position')}
          {/* Alt Click */}
          {mapEntry('<kbd>Alt</kbd> + Left Click Node', 'Delete Node')}
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

  // const mouseShortcutsPanel = (
  //   // table displaying an icon, the mouse actions, and corresponding shortcuts side by side
  //   <TableContainer component={Paper}>
  //     <Table>
  //       <TableHead>
  //         <TableRow>
  //           <TableCell align="center">Icon</TableCell>
  //           <TableCell align="center">Action</TableCell>
  //           <TableCell align="center">Effect</TableCell>
  //         </TableRow>
  //       </TableHead>
  //       <TableBody>
  //         <TableRow>
  //           <TableCell align="center">
  //             {/* <DragHandle fontSize={iconSize} /> */}
  //           </TableCell>
  //           <TableCell align="center">Left Click Node</TableCell>
  //           <TableCell align="center">Select Node</TableCell>
  //         </TableRow>
  //         <TableRow>
  //           <TableCell align="center">
  //             {/* <DragHandle fontSize={iconSize} /> */}
  //           </TableCell>
  //           <TableCell align="center">Drag Node</TableCell>
  //           <TableCell align="center">Move Node</TableCell>
  //         </TableRow>
  //         <TableRow>
  //           <TableCell align="center">
  //             {/* <DragHandleIcon fontSize={iconSize} /> */}
  //           </TableCell>
  //           <TableCell align="center">Right Click Node</TableCell>
  //           <TableCell align="center">Open Node Menu</TableCell>
  //         </TableRow>
  //         <TableRow>
  //           <TableCell align="center">
  //             {/* <DragHandleIcon fontSize={iconSize} /> */}
  //           </TableCell>
  //           <TableCell align="center">Double Click Node</TableCell>
  //           <TableCell align="center">Edit Node</TableCell>
  //         </TableRow>
  //         <TableRow>
  //           <TableCell align="center">
  //             {/* <DragHandleIcon fontSize={iconSize} /> */}
  //           </TableCell>
  //           <TableCell align="center">Control + Click Node</TableCell>
  //           <TableCell align="center">Add Child Node</TableCell>
  //         </TableRow>
  //         <TableRow>
  //           <TableCell align="center">
  //             {/* <DragHandleIcon fontSize={iconSize} /> */}
  //           </TableCell>
  //           <TableCell align="center">Shift + Click Node</TableCell>
  //           <TableCell align="center">Lock Node</TableCell>
  //         </TableRow>
  //         <TableRow>
  //           <TableCell align="center">
  //             {/* <DragHandleIcon fontSize={iconSize} /> */}
  //           </TableCell>
  //           <TableCell align="center">Alt + Click Node</TableCell>
  //           <TableCell align="center">Delete Node</TableCell>
  //         </TableRow>
  //         {/* End */}
  //       </TableBody>
  //     </Table>
  //   </TableContainer>
  // );

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
