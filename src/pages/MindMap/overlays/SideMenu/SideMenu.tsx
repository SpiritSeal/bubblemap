import * as React from 'react';
import { Box, Drawer, List, Divider, Fab } from '@mui/material';

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

// Navigation
import { useNavigate } from 'react-router-dom';

// Import component dependencies
import DrawerListItem from './DrawerListItem';

// Import css file
import './SideMenu.css';
import SettingsDialog from './SettingsDialog';

// SideMenu component accepts 2 props
// 1. active: boolean
// 2. setActive: function that takes a boolean and returns void
const SideMenu = ({
  active,
  setActive,
}: {
  active: boolean;
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const functions = useFunctions();
  const navigate = useNavigate();

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
    (isOpen: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setActive(isOpen);
    };

  // Pref Dialog Functions
  // NOTE: the open and setOpen functions all refer to the preferences dialog, and NOT THE DRAWER!!!
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
            navigate('/');
          }}
        />
        <DrawerListItem
          text="My Mind Maps"
          icon={<Map />}
          onClick={() => {
            navigate('/mindmaps');
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
      <Fab
        onClick={toggleDrawer(true)}
        variant="extended"
        sx={{
          left: -30,
          top: 20,
          position: 'fixed',
        }}
      >
        {/* spacer element */}
        <div style={{ width: 30 }} />
        <Menu className="menu_icon" />
      </Fab>
      <Drawer open={active} onClose={toggleDrawer(false)}>
        {list()}
      </Drawer>
      <SettingsDialog open={open} setOpen={setOpen} />
    </div>
  );
};

export default SideMenu;
