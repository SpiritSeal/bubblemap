import React from 'react';
import { SimulationNodeDatum } from 'd3-force';
import { Divider, Menu, MenuItem } from '@mui/material';
import { localNode as nodeType } from '../../types';
// import './Bubble.css';

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
  updateNode,
}: {
  node: SimulationNodeDatum & nodeType;
  dragging: boolean;
  selected: boolean;
  setSelectedNode: (node: SimulationNodeDatum & nodeType) => void;
  mouseDown: boolean;
  setMouseDown: (mouseDown: boolean) => void;
  downMouseCoords: { x: number; y: number };
  updateNode: (oldNode: nodeType, newNode: nodeType) => void;
}) => {
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
      // eslint-disable-next-line
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
  const textRadius = function textRadius() {
    let tradius = 0;
    for (let i = 0, n = lines.length; i < n; i += 1) {
      const dy = (Math.abs(i - n / 2 + 0.5) + 0.5) * lineHeight;
      const dx = lines[i].width / 2;
      tradius = Math.max(tradius, Math.sqrt(dx ** 2 + dy ** 2));
    }
    return tradius;
  };

  return (
    <g
      onContextMenu={handleContextMenu}
      // style={{ cursor: 'context-menu' }}
      className="bubble"
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
            // If the menu is open, return
            setSelectedNode(node);
          }
        }
        e.stopPropagation();
      }}
      onDoubleClick={(e) => {
        // prevent duplicate onClick when context menu is open
        if (contextMenu) {
          return;
        }
        console.log(node);
        e.stopPropagation();
        // Edit the node text
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
        <MenuItem onClick={(e) => printOptionAndClose(e, 'Add Node')}>
          Add Node
        </MenuItem>
        <MenuItem onClick={(e) => printOptionAndClose(e, 'Delete Node')}>
          Delete Node
        </MenuItem>
        <MenuItem onClick={(e) => printOptionAndClose(e, 'Edit Node')}>
          Edit Node
        </MenuItem>
      </Menu>
      <circle
        cx={radius}
        cy={radius}
        r={radius}
        fill={node.id === 0 ? 'lightblue' : '#e3eeff'}
        stroke={selected ? 'pink' : 'black'}
        strokeWidth={selected ? '7' : '.5'}
      />
      {/* print the main text in the bubble */}
      {/* main text uses https://observablehq.com/@mbostock/fit-text-to-circle */}
      <text
        transform={`translate(${radius},${
          radius // - 0.5 * 0.5 * 0.5 * 0.5 * radius
        }) scale(${radius / (textRadius() * 1.5)})`}
        // Green
        fill={node.id === 0 ? 'red' : 'darkblue'}
      >
        {lines.map((line, i) => (
          <tspan
            // eslint-disable-next-line react/no-array-index-key
            key={`${i}: ${line.text}`}
            x="0"
            // dy={i === 0 ? '0em' : `${lineHeight}em`}
            y={(i - lines.length / 2 + 1) * lineHeight}
            textAnchor="middle"
          >
            {line.text}
          </tspan>
        ))}
      </text>
    </g>
  );
};
export default Bubble;
