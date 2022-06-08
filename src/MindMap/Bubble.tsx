/* eslint-disable no-param-reassign */
import React from 'react';
import { Simulation, SimulationNodeDatum } from 'd3-force';

const Bubble = ({
  node,
  simulation,
}: {
  node: SimulationNodeDatum;
  simulation: Simulation<d3.SimulationNodeDatum, undefined>;
}) => {
  const a = 1;
  return (
    <div
      style={{
        transform: `translate(${node?.x || 0}px, ${node?.y || 0}px)`,
      }}
    >
      <button
        type="button"
        onClick={() => {
          node.fx = (node?.x || 0) + 10;
          node.x = node.fx;
          node.fx = null;
        }}
      >
        {node.index}
      </button>
    </div>
  );
};

export default Bubble;
