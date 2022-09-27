/*eslint-disable*/
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Lightbulb from '@mui/icons-material/Lightbulb';
import MapIcon from '@mui/icons-material/Map';
import HomeIcon from '@mui/icons-material/Home';
import BrowseGalleryIcon from '@mui/icons-material/BrowseGallery';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import InfoIcon from '@mui/icons-material/Info';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HelpIcon from '@mui/icons-material/Help';

import { useFunctions } from 'reactfire';
import { httpsCallable } from 'firebase/functions';

// Import css file
import './TemporaryDrawer.css';

export default function TemporaryDrawer() {
  const functions = useFunctions();

  const testAI = () => {
    httpsCallable(
      functions,
      'ai'
    )({ data: 'trees' }).then((result) => {
      // eslint-disable-next-line no-console
      console.log(result);
    });
  };

  const [state, setState] = React.useState({
    left: false,
  });

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

  const generateListElement = (text: string, icon: any, onClick: any) => (
    <ListItem key={text} disablePadding>
      <ListItemButton onClick={onClick}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={text} />
      </ListItemButton>
    </ListItem>
  );
  const list = () => (
    <Box
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {generateListElement('Home', <HomeIcon />, () => {})}
        {generateListElement('My Mind Maps', <MapIcon />, () => {})}
        {generateListElement('Recents', <BrowseGalleryIcon />, () => {})}
        {generateListElement('Trash', <DeleteSweepIcon />, () => {})}
      </List>
      <Divider />
      <List>
        {generateListElement('Test AI', <Lightbulb />, testAI)}
        {generateListElement('Cool Stats', <QueryStatsIcon />, () => {})}
      </List>
      <List sx={{ position: 'absolute', bottom: 0, width: '100%' }}>
        {/* Move Help to Main Screen, in it's own separate button */}
        {/* {generateListElement('Help', <HelpIcon />, () => {})} */}
        {generateListElement('About', <InfoIcon />, () => {})}
        {generateListElement('Settings', <SettingsIcon />, () => {})}
        {generateListElement('Profile', <AccountCircleIcon />, () => {})}
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
