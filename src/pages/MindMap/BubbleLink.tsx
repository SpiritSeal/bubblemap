import React from 'react';
import { SimulationNodeDatum } from 'd3-force';

const Bubble = ({
  sourceNode,
  targetNode,
}: {
  sourceNode: SimulationNodeDatum;
  targetNode: SimulationNodeDatum;
}) => (
  <line
    x1={sourceNode.x}
    y1={sourceNode.y}
    x2={targetNode.x}
    y2={targetNode.y}
    stroke="black"
    fontSize={100}
  />
);

export default Bubble;
