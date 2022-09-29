// Build a Drawer List Item Component
/*
    <ListItem key={text} disablePadding>
      <ListItemButton onClick={onClick}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={text} />
      </ListItemButton>
    </ListItem>
*/

import React from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SvgIconProps,
} from '@mui/material';

interface DrawerListItemProps {
  text: string;
  // icon is a React Component
  icon: React.ReactElement<SvgIconProps>;
  // onClick is a function that takes no arguments and returns void
  onClick: () => void;
}

const DrawerListItem: React.FC<DrawerListItemProps> = ({
  text,
  icon,
  onClick,
}) => (
  <ListItem key={text} disablePadding>
    <ListItemButton onClick={onClick}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={text} />
    </ListItemButton>
  </ListItem>
);

export default DrawerListItem;
