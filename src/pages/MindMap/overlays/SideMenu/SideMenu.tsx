/*eslint-disable*/
import * as React from 'react';
import { Box, Drawer, Button, List, Divider } from '@mui/material';

import {
  Menu,
  Lightbulb,
  Map,
  Home,
  BrowseGallery,
  DeleteSweep,
  Info,
  QueryStats,
  AccountCircle,
  Settings,
} from '@mui/icons-material';

import { useFunctions } from 'reactfire';
import { httpsCallable } from 'firebase/functions';

// Import component dependencies
import DrawerListItem from './DrawerListItem';

// Import css file
import './SideMenu.css';
import SettingsDialog from './SettingsDialog';

export default function SideMenu() {
  const functions = useFunctions();

  /* Drawer SubFunctions */
  // Test AI
  const testAI = () => {
    httpsCallable(
      functions,
      'ai'
    )({ data: 'trees' }).then((result) => {
      // eslint-disable-next-line no-console
      console.log(result);
    });
  };

  /* End Drawer SubFunctions */

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setState({ ...state, left: open });
    };

  const [state, setState] = React.useState({
    left: false,
  });

  // Pref Dialog Functions
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const list = () => (
    <Box
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <DrawerListItem
          text="Home"
          icon={<Home />}
          onClick={() => {
            location.href = '/';
          }}
        />
        <DrawerListItem
          text="My Mind Maps"
          icon={<Map />}
          onClick={() => {
            location.href = '/mindmap';
          }}
        />
        <DrawerListItem
          text="Recents"
          icon={<BrowseGallery />}
          onClick={() => {}}
        />
        <DrawerListItem
          text="Trash"
          icon={<DeleteSweep />}
          onClick={() => {}}
        />
      </List>
      <Divider />
      <List>
        <DrawerListItem text="Test AI" icon={<Lightbulb />} onClick={testAI} />
        <DrawerListItem
          text="Cool Stats"
          icon={<QueryStats />}
          onClick={() => {}}
        />
      </List>

      <List sx={{ position: 'absolute', bottom: 0, width: '100%' }}>
        {/* Move Help to Main Screen, in it's own separate button */}
        {/* <DrawerListItem
          text="Help"
          icon={<Help/>}
          onClick={() => {}}
        /> */}
        <DrawerListItem text="About" icon={<Info />} onClick={() => {}} />
        <DrawerListItem
          text="Preferences"
          icon={<Settings />}
          onClick={handleClickOpen}
        />

        <DrawerListItem
          text="Profile"
          icon={<AccountCircle />}
          onClick={() => {}}
        />
      </List>
    </Box>
  );

  return (
    <div>
      <React.Fragment key="left">
        <Button onClick={toggleDrawer(true)}>
          <Menu className="menu_icon" />
        </Button>
        <Drawer open={state.left} onClose={toggleDrawer(false)}>
          {list()}
        </Drawer>
        <SettingsDialog open={open} setOpen={setOpen} />
      </React.Fragment>
    </div>
  );
}
