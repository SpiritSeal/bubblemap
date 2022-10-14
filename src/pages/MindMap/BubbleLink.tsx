import React from 'react';
import { SimulationNodeDatum } from 'd3-force';
import { useTheme } from '@mui/material';

const BubbleLink = ({
  sourceNode,
  targetNode,
}: {
  sourceNode: SimulationNodeDatum;
  targetNode: SimulationNodeDatum;
}) => {
  const theme = useTheme();

  return (
    <line
      x1={sourceNode.x}
      y1={sourceNode.y}
      x2={targetNode?.x || 0}
      y2={targetNode?.y || 0}
      stroke={theme.palette.primary.dark}
      strokeWidth={3}
    />
  );
};
export default BubbleLink;
