/* eslint-disable no-param-reassign */
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3-force';
import './MindMap.css';
import Bubble from './Bubble';

const width = window.innerWidth;
const height = window.innerHeight;

function getData() {
  const data: {
    nodes: {
      text: string;
      id: number;
      parent: number;
      root: boolean;
    }[];
    links: {
      source: number;
      target: number;
    }[];
  } = {
    nodes: Array.from({ length: 10 }, (_, i) => ({
      text: `Text in bubble ${i}!`,
      id: i,
      parent: Math.floor(Math.random() * i),
      root: i === 0,
    })),
    links: [],
  };

  data.links = data.nodes.map((node, i) => ({
    source: node.parent,
    target: i,
  }));

  return data;
}

export const useD3 = (forceUpdate: any) => {
  const data = getData();

  const [simulation, setSimulation] = React.useState<d3.Simulation<
    d3.SimulationNodeDatum,
    undefined
  > | null>(null);

  useEffect(() => {
    setSimulation(
      d3
        .forceSimulation(data.nodes as any)
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('x', d3.forceX())
        .force('y', d3.forceY())
    );
  }, []);

  if (simulation) {
    simulation.on('tick', () => {
      forceUpdate();
    });

    simulation.alphaTarget(0.9);
  }
  return { simulation };
};

// eslint-disable-next-line react/prop-types
const MindMap = () => {
  const [, updateState] = React.useState({});
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const { simulation } = useD3(forceUpdate);
  if (!simulation) return null;

  return (
    <div>
      {simulation.nodes().map((node) => (
        <Bubble key={node.index} node={node} simulation={simulation} />
      ))}
    </div>
  );
};

export default MindMap;
