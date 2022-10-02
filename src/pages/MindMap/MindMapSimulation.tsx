/* eslint-disable no-param-reassign */
import React, {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
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
  useTransformContext,
} from '@kokarn/react-zoom-pan-pinch';
import './MindMap.css';
import Bubble from './Bubble';
import BubbleLink from './BubbleLink';
import { MindMap, node } from '../../types';
import Loading from '../../components/Loading';

const MindMapSimulationWithTransform = forwardRef(
  (
    {
      data,
      nodeSelected,
      setNodeSelected,
      // TODO: Implement the following functions: [addNode, deleteNode, updateNode]. Remove relevant eslint-disables when done.
      // eslint-disable-next-line
      addNode,
      // eslint-disable-next-line
      deleteNode,
      // eslint-disable-next-line
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
    },
    ref
  ) => {
    const [simulation, setSimulation] = useState<Simulation<
      SimulationNodeDatum & node,
      undefined
    > | null>(null);
    const [priorDataNodes, setPriorDataNodes] = useState<node[]>();

    const [nodes, setNodes] = useState<(SimulationNodeDatum & node)[]>([]);
    const [links, setLinks] = useState<{ source: number; target: number }[]>(
      []
    );

    const [mouseDelta] = useState({ x: 0, y: 0 });

    const context = useTransformContext();

    useEffect(() => {
      if (JSON.stringify(data.nodes) !== JSON.stringify(priorDataNodes)) {
        const newNodesRaw = JSON.parse(JSON.stringify(data.nodes)) as node[];

        const newNodes: (SimulationNodeDatum & node)[] = [];

        newNodesRaw.forEach((newNode) => {
          if (
            typeof newNode.id === 'number' &&
            typeof newNode.parent === 'number' &&
            typeof newNode.text === 'string'
          ) {
            const oldNode = nodes?.find((o) => o.id === newNode.id) || [];
            if (newNode.id === 0) {
              newNodes.push({
                ...oldNode,
                ...newNode,
                fx: 0,
                fy: 0,
              });
            } else {
              newNodes.push({
                ...oldNode,
                ...newNode,
              });
            }
          }
        });

        const newLinks: { source: number; target: number }[] = newNodes.map(
          (nodeForLink, nodeForLinkIndex) => ({
            source: newNodes.findIndex(
              (item) => item.id === nodeForLink.parent
            ),
            target: nodeForLinkIndex,
          })
        );

        const newSimulation: Simulation<SimulationNodeDatum & node, undefined> =
          forceSimulation()
            .force('collide', forceCollide(15))
            .force(
              'charge',
              forceManyBody().strength(-100)
            ) as unknown as Simulation<SimulationNodeDatum & node, undefined>;

        newSimulation.on('tick', () => {
          setNodes([
            ...(newSimulation.nodes() as (SimulationNodeDatum & node)[]),
          ]);
        });

        setPriorDataNodes(data.nodes);

        newSimulation.nodes(newNodes);

        newSimulation.force(
          'link',
          forceLink(JSON.parse(JSON.stringify(newLinks)))
        );

        newSimulation.alphaTarget(0);
        newSimulation.alphaDecay(0.005);
        newSimulation.alphaMin(0.01);
        newSimulation.tick(1);

        setLinks(newLinks);
        setSimulation(newSimulation);
        newSimulation.restart();
      }
    }, [data.nodes]);

    const releaseBubble = () => {
      if (nodeSelected) {
        if (nodeSelected.id === 0) {
          setNodeSelected(undefined);
        } else {
          nodeSelected.x = nodeSelected?.fx ?? 0;
          nodeSelected.y = nodeSelected?.fy ?? 0;
          nodeSelected.fx = null;
          nodeSelected.fy = null;
          setNodeSelected(undefined);
          simulation?.alpha(1).restart();
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onMouseMove = (e: any) => {
      if (nodeSelected && nodeSelected.id !== 0) {
        nodeSelected.fx =
          (e.clientX - context.state.positionX + mouseDelta.x) /
          context.state.scale;
        nodeSelected.fy =
          (e.clientY - context.state.positionY + mouseDelta.y) /
          context.state.scale;
        simulation?.alpha(1).restart();
      }
    };

    useImperativeHandle(ref, () => ({
      releaseBubble() {
        releaseBubble();
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onMouseMove(e: any) {
        onMouseMove(e);
      },
    }));

    if (simulation === null) return <Loading />;

    if (nodes.length > 0)
      return (
        <svg
          style={{
            overflow: 'visible',
          }}
          onMouseDown={(e) => {
            const x =
              (e.clientX - context.state.positionX + mouseDelta.x) /
              context.state.scale;
            const y =
              (e.clientY - context.state.positionY + mouseDelta.y) /
              context.state.scale;
            const nodeClicked: (SimulationNodeDatum & node) | undefined =
              simulation?.find(x, y, 15);
            if (!nodeClicked) return;
            nodeClicked.fx = nodeClicked.x;
            nodeClicked.fy = nodeClicked.y;
            setNodeSelected(nodeClicked);
            e.stopPropagation();
          }}
          onMouseUp={() => releaseBubble()}
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
  }
);

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const childRef: any = useRef();

  return (
    <div
      onMouseLeave={() => childRef?.current?.releaseBubble()}
      onMouseMove={(e) => childRef?.current?.onMouseMove(e)}
    >
      <TransformWrapper
        initialScale={1}
        minScale={0.1}
        maxScale={25}
        limitToBounds={false}
        // centerZoomedOut
        centerOnInit
        panning={{
          disabled: !!nodeSelected,
        }}
      >
        <TransformComponent
          wrapperStyle={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          // contentClass="no-translate"
        >
          <MindMapSimulationWithTransform
            ref={childRef}
            data={data}
            nodeSelected={nodeSelected}
            setNodeSelected={setNodeSelected}
            addNode={addNode}
            deleteNode={deleteNode}
            updateNode={updateNode}
          />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default MindMapSimulation;
