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
  icon: React.ReactElement<SvgIconProps>;
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
