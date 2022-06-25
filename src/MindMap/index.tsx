/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
import React, { useEffect } from 'react';
import * as d3 from 'd3-force';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import './MindMap.css';
import Bubble from './Bubble';
import BubbleLink from './BubbleLink';

const width = window.innerWidth;
const height = window.innerHeight;

interface dataType {
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
}

export const useD3 = (forceUpdate: any, data: dataType) => {
  const [simulation, setSimulation] = React.useState<d3.Simulation<
    d3.SimulationNodeDatum,
    undefined
  > | null>(null);

  useEffect(() => {
    setSimulation(
      d3
        .forceSimulation(data.nodes as any)
        .force('link', d3.forceLink(data.links))
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(width / 2, height / 2))
    );
  }, []);

  if (simulation) {
    simulation.on('tick', () => {
      forceUpdate();
    });

    simulation.alpha(1);
  }
  return { simulation };
};

// eslint-disable-next-line react/prop-types
const MindMap = ({ data }: { data: dataType }) => {
  const [, updateState] = React.useState({});
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const { links: dataLinks } = data;

  const { simulation } = useD3(forceUpdate, JSON.parse(JSON.stringify(data)));
  if (!simulation) return null;

  const nodes = simulation.nodes();

  return (
    <TransformWrapper
      initialScale={1}
      initialPositionX={200}
      initialPositionY={100}
      maxScale={10}
    >
      <TransformComponent>
        {nodes.length > 0 && (
          <svg width={width} height={height}>
            {dataLinks.map((link) => (
              <BubbleLink
                key={link.target}
                link={link}
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
