import * as React from 'react';
import { styled } from '@mui/material/styles';
import { AppBar, Box, Toolbar, IconButton, Fab } from '@mui/material';
import { Menu, Add, Help, MyLocation } from '@mui/icons-material';
import { SimulationNodeDatum } from 'd3-force';
import { node } from '../../../../types';

const StyledFab = styled(Fab)({
  position: 'absolute',
  zIndex: 1,
  top: -30,
  left: 0,
  right: 0,
  margin: '0 auto',
});

const BottomBar = ({
  handleAddNode,
  selectedNode,
}: {
  handleAddNode: (parentNode: SimulationNodeDatum & node) => void;
  selectedNode: SimulationNodeDatum & node;
}) => (
  <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }}>
    <Toolbar>
      <IconButton color="inherit" aria-label="open drawer">
        <Menu />
      </IconButton>
      <StyledFab
        color="secondary"
        aria-label="add node"
        onClick={() => handleAddNode(selectedNode)}
      >
        <Add />
      </StyledFab>
      <Box sx={{ flexGrow: 1 }} />
      <IconButton color="inherit">
        <MyLocation />
      </IconButton>
      <IconButton color="inherit">
        <Help />
      </IconButton>
    </Toolbar>
  </AppBar>
);

export default BottomBar;
