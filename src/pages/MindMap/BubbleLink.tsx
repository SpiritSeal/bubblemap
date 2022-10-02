import React from 'react';
import { SimulationNodeDatum } from 'd3-force';

const BubbleLink = ({
  sourceNode,
  targetNode,
}: {
  sourceNode: SimulationNodeDatum;
  targetNode: SimulationNodeDatum;
}) => (
  <line
    x1={sourceNode.x}
    y1={sourceNode.y}
    x2={targetNode?.x || 0}
    y2={targetNode?.y || 0}
    stroke="black"
    fontSize={100}
  />
);

export default BubbleLink;
