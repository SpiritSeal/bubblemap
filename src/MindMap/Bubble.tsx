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
    <>
      <circle
        cx={node.x ?? 0}
        cy={node.y ?? 0}
        r="5"
        stroke="green"
        fill="yellow"
      />
      <text
        x={(node.x ?? 0) - 2.5}
        y={(node.y ?? 0) + 5}
        textLength={5}
        lengthAdjust="spacingAndGlyphs"
      >
        Bubble!
      </text>
    </>

    //   {/* // <div
    // //   style={{
    // //     transform: `translate(${(node?.x || 0) - 500}px, ${node?.y || 0}px)`,
    // //   }}
    // // > */}
    //   {/* Hi!
    //   <button
    //     type="button"
    //     onClick={() => {
    //       node.fx = (node?.x || 0) + 10;
    //       node.x = node.fx;
    //       node.fx = null;
    //     }}
    //   >
    //     {node.index} HI!!!
    //   </button> */}
  );
};

export default Bubble;
