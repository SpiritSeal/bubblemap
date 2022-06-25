import React from 'react';
import { Simulation, SimulationNodeDatum } from 'd3-force';

const Bubble = ({
  link,
  sourceNode,
  targetNode,
}: {
  link: {
    source: number;
    target: number;
  };
  sourceNode: SimulationNodeDatum;
  targetNode: SimulationNodeDatum;
}) => (
  <line
    x1={sourceNode.x}
    y1={sourceNode.y}
    x2={targetNode.x}
    y2={targetNode.y}
    stroke="black"
  />
);

export default Bubble;
