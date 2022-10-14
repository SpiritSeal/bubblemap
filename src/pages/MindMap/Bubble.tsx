import React from 'react';
import { SimulationNodeDatum } from 'd3-force';
import { Divider, Menu, MenuItem, useTheme } from '@mui/material';
import { localNode as nodeType } from '../../types';

const radius = 15;
const lineHeight = 15.5;
// const subLineHeight = 1.7;

function measureWidth(text: string) {
  const context = document.createElement('canvas').getContext('2d');
  if (!context) {
    return 0;
  }
  return context.measureText(text).width;
}

function wordsGenerator(text: string) {
  const wordList = text.split(/\s+/g); // To hyphenate: /\s+|(?<=-)/
  if (!wordList[wordList.length - 1]) wordList.pop();
  if (!wordList[0]) wordList.shift();
  return wordList;
}

const Bubble = ({
  node,
  dragging,
  selected,
  setSelectedNode,
  mouseDown,
  setMouseDown,
  downMouseCoords,
  handleAddNode,
  handleDeleteNode,
  updateNode,
  handleEditNode,
}: {
  node: SimulationNodeDatum & nodeType;
  dragging: boolean;
  selected: boolean;
  setSelectedNode: (node: SimulationNodeDatum & nodeType) => void;
  mouseDown: boolean;
  setMouseDown: (mouseDown: boolean) => void;
  downMouseCoords: { x: number; y: number };
  handleAddNode: () => void;
  handleDeleteNode: () => void;
  updateNode: (oldNode: nodeType, newNode: nodeType) => void;
  handleEditNode: () => void;
}) => {
  const theme = useTheme();

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

  const printOptionAndClose = (e: React.MouseEvent, option: string) => {
    // eslint-disable-next-line no-console
    console.log(option);
    // console.log("node", node.fx, node.fy);
    handleContextMenuClose();
    e.preventDefault();
  };

  const handleInheritedHandles = (e: React.MouseEvent, handle: () => void) => {
    handle();
    handleContextMenuClose();
    e.preventDefault();
  };

  // const handleAddNode = (e?: React.MouseEvent) => {
  //   // eslint-disable-next-line no-alert
  //   const newText = prompt('Enter new text', '');
  //   if (newText) {
  //     addNode({
  //       parent: node.id,
  //       text: newText || '',
  //     });
  //   }
  //   handleContextMenuClose();
  //   e?.preventDefault();
  // };
  // const handleDeleteNode = (e?: React.MouseEvent) => {
  //   // eslint-disable-next-line no-alert
  //   if (window.confirm('Are you sure you want to delete this node?')) {
  //     deleteNode(node);
  //   }
  //   handleContextMenuClose();
  //   e?.preventDefault();
  // };
  // const handleEditNode = (e?: React.MouseEvent) => {
  //   handleContextMenuClose();
  //   // eslint-disable-next-line no-alert
  //   const newText = prompt('Enter new text', node.text);
  //   if (newText) {
  //     updateNode(node, { ...node, text: newText });
  //   }
  //   e?.preventDefault();
  // };
  // Prepare the text
  const { text } = node;

  const words = wordsGenerator(text);
  const targetWidth = Math.sqrt(measureWidth(text.trim()) * lineHeight);

  const getLines = () => {
    // line has properties { text, width }
    let line: { text: string; width: number } = { text: '', width: 0 };
    let lineWidth0 = Infinity;
    const linesTemp = [];
    for (let i = 0, n = words.length; i < n; i += 1) {
      const lineText1 = `${line.text}${line ? ' ' : ''}${words[i]}`;
      const lineWidth1 = measureWidth(lineText1);
      if ((lineWidth0 + lineWidth1) / 2 < targetWidth) {
        // eslint-disable-next-line
        line!.width = lineWidth0 = lineWidth1;
        // eslint-disable-next-line
        line!.text = lineText1;
      } else {
        lineWidth0 = measureWidth(words[i]);
        line = { width: lineWidth0, text: words[i] };
        linesTemp.push(line);
      }
    }
    return linesTemp;
  };

  const lines = getLines();

  const textRadius = () => {
    let tradius = 0;

    for (let i = 0, n = lines.length; i < n; i += 1) {
      const dy = (Math.abs(i - n / 2 + 0.5) + 0.5) * lineHeight;
      const dx = lines[i].width / 2;
      tradius = Math.max(tradius, Math.sqrt(dx ** 2 + dy ** 2));
    }

    return tradius;
  };

  const getStrokeColor = () => {
    if (selected) return theme.palette.secondary.main;
    if (node.id === 0) return theme.palette.primary.main;
    return theme.palette.primary.dark;
  };

  return (
    // <HotKeys handlers={shortcutHandlers}>
    <g
      onContextMenu={handleContextMenu}
      // style={{ cursor: 'context-menu' }}
      transform={`translate(${(node.x ?? 0) - radius} ${
        (node.y ?? 0) - radius
      })`}
      style={
        node.id === 0
          ? { cursor: 'no-drop' }
          : { cursor: dragging ? 'grabbing' : 'grab' }
      }
      // onClick set selectedNode and console.log the node
      onClick={(e) => {
        // prevent duplicate onClick when context menu is open
        if (contextMenu) {
          return;
        }
        if (mouseDown) {
          setMouseDown(false);

          if (
            downMouseCoords.x === e.clientX &&
            downMouseCoords.y === e.clientY
          ) {
            if (e.ctrlKey || e.metaKey) {
              handleInheritedHandles(e, handleAddNode);
            } else if (e.altKey) {
              handleInheritedHandles(e, handleDeleteNode);
            } else {
              setSelectedNode(node);
            }
          }
        }
        e.stopPropagation();
      }}
      onDoubleClick={(e) => {
        // prevent duplicate onClick when context menu is open
        if (contextMenu) {
          return;
        }
        if (e.ctrlKey || e.metaKey || e.altKey) {
          return;
        }
        e.stopPropagation();
        // eslint-disable-next-line no-alert
        const newText = prompt('Enter new text', node.text);
        if (newText) {
          updateNode(node, { ...node, text: newText });
        }
      }}
    >
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
        <MenuItem onClick={(e) => printOptionAndClose(e, 'Lock Node')}>
          {/* ${node.fx !== undefined ? `Lock Node` : `Unlock Node`} */}
          Lock Node
        </MenuItem>
        <Divider />
        <MenuItem onClick={(e) => handleInheritedHandles(e, handleAddNode)}>
          Add Node
        </MenuItem>
        <MenuItem onClick={(e) => handleInheritedHandles(e, handleDeleteNode)}>
          Delete Node
        </MenuItem>
        <MenuItem onClick={(e) => handleInheritedHandles(e, handleEditNode)}>
          Edit Node
        </MenuItem>
      </Menu>
      <circle
        cx={radius}
        cy={radius}
        r={radius}
        fill={
          node.id === 0
            ? theme.palette.primary.dark
            : theme.palette.primary.main
        }
        stroke={getStrokeColor()}
      />
      {/* print the main text in the bubble */}
      {/* main text uses https://observablehq.com/@mbostock/fit-text-to-circle */}
      {text && (
        <text
          transform={`translate(${radius},${
            radius // - 0.5 * 0.5 * 0.5 * 0.5 * radius
          }) scale(${radius / (textRadius() * 1.64)})`}
          fill={theme.palette.primary.contrastText}
        >
          {lines.map((line, i) => (
            <tspan
              // eslint-disable-next-line react/no-array-index-key
              key={`${i}: ${line.text}`}
              x="0"
              y={(i - lines.length / 2 + 1) * lineHeight}
              textAnchor="middle"
            >
              {line.text}
            </tspan>
          ))}
        </text>
      )}
    </g>
    // </HotKeys>
  );
};
export default Bubble;
