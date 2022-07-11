import React, { useState, useEffect, useCallback } from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCollide,
  Simulation,
  SimulationNodeDatum,
} from 'd3-force';
import {
  TransformWrapper,
  TransformComponent,
} from '@kokarn/react-zoom-pan-pinch';
import './MindMap.css';
import Bubble from './Bubble';
import BubbleLink from './BubbleLink';
import { dataType, nodesType } from '../types';

const width = window.innerWidth;
const height = window.innerHeight;

export const useD3 = (forceUpdate: () => void, data: dataType) => {
  const [simulation, setSimulation] = useState<Simulation<
    SimulationNodeDatum,
    undefined
  > | null>(null);

  useEffect(() => {
    const newSim = forceSimulation(data.nodes as any)
      .force('collide', forceCollide(15))
      .force('link', forceLink(data.links))
      .force('charge', forceManyBody().strength(-100));

    newSim.nodes()[0].fx = width / 2;
    newSim.nodes()[0].fy = height / 2;

    setSimulation(newSim);
  }, []);

  // useEffect(() => {
  //   if (simulation) {
  //     simulation
  //       .nodes(data.nodes as any)
  //       .force('collide', forceCollide(15))
  //       .force('link', forceLink(data.links))
  //       .force('charge', forceManyBody().strength(-100));
  //   }
  // }, [data]);

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
const MindMap = ({ data }: { data: dataType }) => {
  const [newData, setNewData] = useState(data);

  // Timeout function that runs after 5 seconds

  const [, updateState] = useState({});
  const forceUpdate = useCallback(() => updateState({}), []);
  const { links: dataLinks } = data;

  const { simulation } = useD3(forceUpdate, JSON.parse(JSON.stringify(data)));

  if (!simulation) return null;

  const nodes: (SimulationNodeDatum & nodesType)[] =
    simulation.nodes() as (SimulationNodeDatum & nodesType)[];
  return (
    <TransformWrapper
      initialScale={1}
      minScale={0.1}
      maxScale={25}
      centerZoomedOut
    >
      <TransformComponent>
        {nodes.length > 0 && (
          <svg width={width} height={height}>
            {dataLinks.map((link) => (
              <BubbleLink
                key={link.target}
                sourceNode={nodes[link.source]}
                targetNode={nodes[link.target]}
              />
            ))}
            {nodes.map((node) => (
              <Bubble key={node.index} node={node} simulation={simulation} />
            ))}
          </svg>
        )}
      </TransformComponent>
    </TransformWrapper>
  );
};

export default MindMap;
