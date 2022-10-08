import { Menu, MenuItem } from '@mui/material';
import React from 'react';

const ContextMenu = () => {
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null
    );
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };
  return (
    <Menu
      open={contextMenu !== null}
      onClose={handleContextMenuClose}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
    >
      <MenuItem onClick={handleContextMenuClose}>Copy</MenuItem>
      <MenuItem onClick={handleContextMenuClose}>Print</MenuItem>
      <MenuItem onClick={handleContextMenuClose}>Highlight</MenuItem>
      <MenuItem onClick={handleContextMenuClose}>Email</MenuItem>
    </Menu>
  );
};

export default ContextMenu;
