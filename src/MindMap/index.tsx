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
    const newSim = forceSimulation(data.nodes as unknown as undefined)
      .force('collide', forceCollide(15))
      .force('link', forceLink(data.links))
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

  const timeout = setTimeout(() => {
    // console.log('Timeout function');
    setNewData({
      nodes: [
        {
          text: 'Text in bubble 0!',
          id: 0,
          parent: 0,
          root: true,
        },
        {
          text: 'Text in bubble 1!',
          id: 1,
          parent: 0,
          root: false,
        },
        {
          text: 'Text in bubble 2!',
          id: 2,
          parent: 1,
          root: false,
        },
        {
          text: 'Text in bubble 3!',
          id: 3,
          parent: 0,
          root: false,
        },
        {
          text: 'Text in bubble 4!',
          id: 4,
          parent: 3,
          root: false,
        },
        {
          text: 'Text in bubble 5!',
          id: 5,
          parent: 0,
          root: false,
        },
        {
          text: 'Text in bubble 6!',
          id: 6,
          parent: 2,
          root: false,
        },
        {
          text: 'Text in bubble 7!',
          id: 7,
          parent: 1,
          root: false,
        },
        {
          text: 'Text in bubble 8!',
          id: 8,
          parent: 4,
          root: false,
        },
      ],
      links: [
        {
          source: 0,
          target: 0,
        },
        {
          source: 0,
          target: 1,
        },
        {
          source: 1,
          target: 2,
        },
        {
          source: 0,
          target: 3,
        },
        {
          source: 3,
          target: 4,
        },
        {
          source: 0,
          target: 5,
        },
        {
          source: 2,
          target: 6,
        },
        {
          source: 1,
          target: 7,
        },
        {
          source: 4,
          target: 8,
        },
      ],
    });
    simulation.restart();
  }, 5000);
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
