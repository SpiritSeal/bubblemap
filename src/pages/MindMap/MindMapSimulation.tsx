/* eslint-disable no-param-reassign */
import React, {
  useState,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
} from 'react';
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
  useTransformContext,
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

const MindMapSimulationWithTransform = ({
  data,
  nodeSelected,
  setNodeSelected,
  addNode,
  deleteNode,
  updateNode,
}: {
  data: MindMap;
  nodeSelected: (SimulationNodeDatum & node) | undefined;
  setNodeSelected: Dispatch<
    SetStateAction<(SimulationNodeDatum & node) | undefined>
  >;
  addNode: (node: node) => void;
  deleteNode: (node: node) => void;
  updateNode: (oldNode: node, newNode: node) => void;
}) => {
  const [, updateState] = useState({});
  const forceUpdate = useCallback(() => updateState({}), []);
  const [mouseDelta] = useState({ x: 0, y: 0 });

  const context = useTransformContext();

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

  const releaseBubble = () => {
    if (nodeSelected) {
      if (nodeSelected.id===0) {
        setNodeSelected(undefined);
      } else {
        nodeSelected.x = nodeSelected?.fx ?? 0;
        nodeSelected.y = nodeSelected?.fy ?? 0;
        nodeSelected.fx = null;
        nodeSelected.fy = null;
        setNodeSelected(undefined);
        simulation.alpha(1).restart();
      }
    }
  };

  if (nodes.length > 0)
    return (
      <svg
        width={width}
        height={height}
        onMouseDown={(e) => {
          const x =
            (e.clientX - context.state.positionX + mouseDelta.x) /
            context.state.scale;
          const y =
            (e.clientY - context.state.positionY + mouseDelta.y) /
            context.state.scale;
          const nodeClicked: (SimulationNodeDatum & node) | undefined =
            simulation.find(x, y, 15);
          if (!nodeClicked) return;
          nodeClicked.fx = nodeClicked.x;
          nodeClicked.fy = nodeClicked.y;
          setNodeSelected(nodeClicked);
        }}
        onMouseMove={(e) => {
          if (nodeSelected && nodeSelected.id!==0) {
            nodeSelected.fx =
              (e.clientX - context.state.positionX + mouseDelta.x) /
              context.state.scale;
            nodeSelected.fy =
              (e.clientY - context.state.positionY + mouseDelta.y) /
              context.state.scale;
            simulation.alpha(1).restart();
          }
        }}
        onMouseUp={() => releaseBubble()}
        onMouseLeave={() => releaseBubble()}
      >
        {links.map((link) => (
          <BubbleLink
            key={link.target}
            sourceNode={nodes[link.source]}
            targetNode={nodes[link.target]}
          />
        ))}
        {nodes.map((nodeData) => (
          <Bubble
            key={nodeData.id}
            node={nodeData}
            selected={nodeSelected === nodeData}
          />
        ))}
      </svg>
    );
  return null;
};

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
  const [nodeSelected, setNodeSelected] = useState<
    (SimulationNodeDatum & node) | undefined
  >(undefined);

  return (
    <TransformWrapper
      initialScale={1}
      minScale={0.1}
      maxScale={25}
      limitToBounds={false}
      // centerZoomedOut
      panning={{
        disabled: !!nodeSelected,
      }}
    >
      <TransformComponent
        wrapperStyle={{
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <MindMapSimulationWithTransform
          data={data}
          nodeSelected={nodeSelected}
          setNodeSelected={setNodeSelected}
          addNode={addNode}
          deleteNode={deleteNode}
          updateNode={updateNode}
        />
      </TransformComponent>
    </TransformWrapper>
  );
};

export default MindMapSimulation;
