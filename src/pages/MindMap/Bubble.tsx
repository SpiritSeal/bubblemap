import React from 'react';
import { SimulationNodeDatum } from 'd3-force';
import { node as nodeType } from '../../types';

const Bubble = ({
  node,
  selected,
}: {
  node: SimulationNodeDatum & nodeType;
  selected: boolean;
}) => (
  <g
    className="bubble"
    transform={`translate(${(node.x ?? 0) - 15} ${(node.y ?? 0) - 15})`}
  >
    <circle
      cx="15"
      cy="15"
      r="15"
      fill={!node.parent ? 'lightblue' : 'grey'}
      stroke="black"
      strokeWidth="0.5"
      style={
        node.parent
          ? { cursor: selected ? 'grabbing' : 'grab' }
          : { cursor: 'no-drop' }
      }
    />
    <path
      d="M27 24C27 24 23 30 15 30C7 30 3 24 3 24C3 24 7.1318 23 15.0478 23C22.9638 23 27 24 27 24Z"
      fill="white"
      stroke="black"
      strokeWidth="0.5"
    />
    <path
      d="M20 3.00095C20 4.00189 20 5 15 5C10 5 10 4.00189 10 3.00095C9.99999 2 9.99998 1.00379 15 1.00189C20 1 20 2 20 3.00095Z"
      fill="white"
      style={{ cursor: 'pointer' }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    />
    <path
      d="M11 2C11 2 18.8225 2.00058 19 2M11 3.02521C11 3.02521 18.8225 3.02579 19 3.02521M11 4C11 4 18.8225 4.00058 19 4"
      stroke="black"
      strokeWidth="0.2"
      strokeLinecap="round"
    />
  </g>
);

export default Bubble;
