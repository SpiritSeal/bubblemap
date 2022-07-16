import React, { useState, useEffect, useCallback } from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCollide,
  Simulation,
  SimulationNodeDatum,
  SimulationLinkDatum,
} from 'd3-force';
import {
  TransformWrapper,
  TransformComponent,
} from '@kokarn/react-zoom-pan-pinch';
import './MindMap.css';
import Bubble from './Bubble';
import BubbleLink from './BubbleLink';
import { MindMap, node } from '../../types';

const width = window.innerWidth;
const height = window.innerHeight;

export const useD3 = (
  forceUpdate: () => void,
  nodes: (SimulationNodeDatum & node)[],
  links: SimulationLinkDatum<SimulationNodeDatum & node>[]
) => {
  const [simulation, setSimulation] = useState<Simulation<
    SimulationNodeDatum & node,
    undefined
  > | null>(null);

  useEffect(() => {
    const newSim = forceSimulation(nodes)
      .force('collide', forceCollide(15))
      .force('link', forceLink(links))
      .force('charge', forceManyBody().strength(-100));

    newSim.nodes()[0].fx = width / 2;
    newSim.nodes()[0].fy = height / 2;

    setSimulation(newSim);
  }, []);

  if (simulation) {
    simulation.on('tick', () => {
      forceUpdate();
    });

    simulation.alphaTarget(0);
    simulation.alphaDecay(0.005);
    simulation.alphaMin(0.01);
    simulation.tick(0);
  }
  return { simulation };
};

// eslint-disable-next-line react/prop-types
const MindMapSimulation = ({
  data,
  addNode,
  deleteNode,
  updateNode,
}: {
  data: MindMap;
  addNode: (node: node) => void;
  deleteNode: (node: node) => void;
  updateNode: (oldNode: node, newNode: node) => void;
}) => {
  const [, updateState] = useState({});
  const forceUpdate = useCallback(() => updateState({}), []);

  const links: { source: number; target: number }[] = data.nodes.map(
    (dataNode, i) => ({
      source: dataNode.parent,
      target: i,
    })
  );

  const { simulation } = useD3(forceUpdate, data.nodes, links);

  if (!simulation) return null;

  const nodes: (SimulationNodeDatum & node)[] =
    simulation.nodes() as (SimulationNodeDatum & node)[];
  return (
    <TransformWrapper
      initialScale={1}
      minScale={0.1}
      maxScale={25}
      centerZoomedOut
    >
      <TransformComponent
        wrapperStyle={{
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {nodes.length > 0 && (
          <svg width={width} height={height}>
            {links.map((link) => (
              <BubbleLink
                key={link.target}
                sourceNode={nodes[link.source]}
                targetNode={nodes[link.target]}
              />
            ))}
            {nodes.map((nodeData) => (
              <Bubble
                key={nodeData.index}
                node={nodeData}
                simulation={simulation}
              />
            ))}
          </svg>
        )}
      </TransformComponent>
    </TransformWrapper>
  );
};

export default MindMapSimulation;
