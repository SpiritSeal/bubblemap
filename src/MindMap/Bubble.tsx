/* eslint-disable no-param-reassign */
import React, { useState } from 'react';
import { Simulation, SimulationNodeDatum } from 'd3-force';
import { useTransformContext } from '@kokarn/react-zoom-pan-pinch';
import { nodesType } from '../types';

const Bubble = ({
  node,
  simulation,
}: {
  node: SimulationNodeDatum & nodesType;
  simulation: Simulation<SimulationNodeDatum, undefined>;
}) => {
  const [panDisabled, setPanDisabled] = useState(false);
  const [mouseDelta] = useState({ x: 0, y: 0 });
  const context = useTransformContext();

  const releaseBubble = () => {
    if (panDisabled) {
      node.x = node?.fx ?? 0;
      node.y = node?.fy ?? 0;
      node.fx = null;
      node.fy = null;
      setPanDisabled(false);
      simulation.alpha(1).restart();
    }
  };
  return (
    <g
      className="bubble"
      transform={`translate(${(node.x ?? 0) - 15} ${(node.y ?? 0) - 15})`}
    >
      <circle
        cx="15"
        cy="15"
        r="15"
        fill={node.root ? 'lightblue' : 'grey'}
        stroke="black"
        strokeWidth="0.5"
        style={
          !node.root
            ? { cursor: panDisabled ? 'grabbing' : 'grab' }
            : { cursor: 'no-drop' }
        }
        onMouseDown={(e) => {
          // console.log(e);
          if (!node.root) {
            setPanDisabled(true);
            // setMouseDelta({
            //   x:
            //     (node.x ?? 0) -
            //     (e.clientX + context.state.positionX) / context.state.scale,
            //   y:
            //     (node.y ?? 0) -
            //     (e.clientY + context.state.positionY) / context.state.scale,
            // });
            // console.log('Set mouse delta', {
            //   x: {
            //     nodeX: node.x,
            //     eX: e.clientX,
            //     state: context.state.positionX,
            //     scale: context.state.scale,
            //   },
            //   // (node.x ?? 0) -
            //   // (e.clientX + context.state.positionX) / context.state.scale,
            //   y:
            //     (node.y ?? 0) -
            //     e.clientY +
            //     context.state.positionY / context.state.scale,
            // });
            node.fx = node.x;
            node.fy = node.y;
          }
          e.stopPropagation();
        }}
        onMouseMove={(e) => {
          if (panDisabled) {
            node.fx =
              (e.clientX - context.state.positionX + mouseDelta.x) /
              context.state.scale;
            node.fy =
              (e.clientY - context.state.positionY + mouseDelta.y) /
              context.state.scale;
            simulation.alpha(1).restart();
          }
        }}
        onMouseUp={() => releaseBubble()}
        onMouseLeave={() => releaseBubble()}
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
          // console.log('clicked', node.index, e.isPropagationStopped());
          e.stopPropagation();
        }}
      />
      <path
        d="M11 2C11 2 18.8225 2.00058 19 2M11 3.02521C11 3.02521 18.8225 3.02579 19 3.02521M11 4C11 4 18.8225 4.00058 19 4"
        stroke="black"
        strokeWidth="0.1"
        strokeLinecap="round"
      />
    </g>
  );
};

export default Bubble;
