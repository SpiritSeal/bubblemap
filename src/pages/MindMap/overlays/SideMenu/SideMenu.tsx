/*eslint-disable*/
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';

import MenuIcon from '@mui/icons-material/Menu';
import Lightbulb from '@mui/icons-material/Lightbulb';
import MapIcon from '@mui/icons-material/Map';
import HomeIcon from '@mui/icons-material/Home';
import BrowseGalleryIcon from '@mui/icons-material/BrowseGallery';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import InfoIcon from '@mui/icons-material/Info';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HelpIcon from '@mui/icons-material/Help';

import { useFunctions } from 'reactfire';
import { httpsCallable } from 'firebase/functions';

// Import component dependencies
import DrawerListItem from './DrawerListItem';
import SettingsButton from './SettingsButton';

// Import css file
import './SideMenu.css';

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

  const list = () => (
    <Box
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <DrawerListItem 
          text="Home" 
          icon={<HomeIcon />} 
          onClick={() => {}} 
        />
        <DrawerListItem
          text="My Mind Maps"
          icon={<MapIcon />}
          onClick={() => {}}
        />
        <DrawerListItem
          text="Recents"
          icon={<BrowseGalleryIcon />}
          onClick={() => {}}
        />
        <DrawerListItem
          text="Trash"
          icon={<DeleteSweepIcon />}
          onClick={() => {}}
        />
      </List>
      <Divider />
      <List>
        <DrawerListItem
          text="Test AI"
          icon={<Lightbulb />}
          onClick={testAI}
        />
        <DrawerListItem
          text="Cool Stats"
          icon={<QueryStatsIcon />}
          onClick={() => {}}
        />
      </List>

      <List sx={{ position: 'absolute', bottom: 0, width: '100%' }}>
        {/* Move Help to Main Screen, in it's own separate button */}
        {/* <DrawerListItem
          text="Help"
          icon={<HelpIcon />}
          onClick={() => {}}
        /> */}
        <DrawerListItem
          text="About"
          icon={<InfoIcon />}
          onClick={() => {}}
        />
        {/* {generateListElement('Settings', <SettingsIcon />, () => {})} */}
        <SettingsButton />
        <DrawerListItem
          text="Profile"
          icon={<AccountCircleIcon />}
          onClick={() => {}}
        />
      </List>
    </Box>
  );

  return (
    <div>
      <React.Fragment key="left">
        <Button onClick={toggleDrawer(true)}>
          <MenuIcon className="menu_icon" />
        </Button>
        <Drawer
          PaperProps={
            {
              // sx: { width: "15%" },
            }
          }
          open={state.left}
          onClose={toggleDrawer(false)}
        >
          {list()}
        </Drawer>
      </React.Fragment>
    </div>
  );
}
