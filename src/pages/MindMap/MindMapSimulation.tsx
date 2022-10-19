/* eslint-disable no-param-reassign */
import React, {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useRef,
  forwardRef,
  useImperativeHandle,
  MouseEvent,
} from 'react';
import { GlobalHotKeys } from 'react-hotkeys';
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
import { MindMap, node, WithID } from '../../types';
import Loading from '../../components/Loading';
import BottomBar from './overlays/BottomBar';

const MindMapSimulationWithTransform = forwardRef(
  (
    {
      data,
      dragNodeSelected,
      setDragNodeSelected,
      // TODO: Implement the following functions: [addNode, deleteNode, updateNode]. Remove relevant eslint-disables when done.
      // eslint-disable-next-line
      addNode,
      handleAddNode,
      // eslint-disable-next-line
      deleteNode,
      // eslint-disable-next-line
      updateNode,
      selectedNode,
      setSelectedNode,
    }: {
      data: WithID<MindMap>;
      dragNodeSelected: (SimulationNodeDatum & node) | undefined;
      setDragNodeSelected: Dispatch<
        SetStateAction<(SimulationNodeDatum & node) | undefined>
      >;
      addNode: (node: { parent: number; text: string }) => void;
      handleAddNode: (parentNode?: SimulationNodeDatum & node) => void;
      deleteNode: (node: node) => void;
      updateNode: (oldNode: node, newNode: node) => void;
      selectedNode: SimulationNodeDatum & node;
      setSelectedNode: Dispatch<SetStateAction<SimulationNodeDatum & node>>;
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

    // Create a state to store the lockstates of all the nodes
    const [nodeLockStates, setNodeLockStates] = useState<{
      [key: number]: boolean;
    }>({});
    // lastNodeLockStates is used to store the previous state of nodeLockStates
    const lastNodeLockStates = useRef<{
      [key: number]: boolean;
    }>({});

    // UseEffect Lockstate
    useEffect(() => {
      // Find the difference between the lastNodeLockStates and the current nodeLockStates
      const difference = Object.keys(nodeLockStates).filter(
        (key) =>
          nodeLockStates[Number(key)] !==
          lastNodeLockStates.current[Number(key)]
      );
      // If the difference is not empty, find nodes that now have a lockstate of false
      if (difference.length > 0) {
        const unlockedNodes = difference.filter(
          (key) => nodeLockStates[Number(key)] === false
        );
        // Set their fx and fy to null
        unlockedNodes.forEach((key) => {
          // Get the node with the id of the key
          const nodeUnlocked = nodes.find((o) => o.id === parseInt(key, 10));
          if (nodeUnlocked && nodeUnlocked.id !== 0) {
            nodeUnlocked.fx = null;
            nodeUnlocked.fy = null;
          }
        });
        // Find those nodes that now have a lockstate of true
        const lockedNodes = difference.filter(
          (key) => nodeLockStates[Number(key)] === true
        );
        // Set their fx and fy to their current x and y
        lockedNodes.forEach((key) => {
          // Get the node with the id of the key
          const nodeLocked = nodes.find((o) => o.id === parseInt(key, 10));
          if (nodeLocked) {
            nodeLocked.fx = nodeLocked.x;
            nodeLocked.fy = nodeLocked.y;
          }
        });
      }
      // Set the lastNodeLockStates to the current nodeLockStates
      lastNodeLockStates.current = nodeLockStates;
    }, [nodeLockStates, simulation]);

    const checkIfRecursiveChildrenisSelected = (
      nodeTo: (SimulationNodeDatum & node) | undefined,
      nodeFrom: (SimulationNodeDatum & node) | undefined = selectedNode
    ): boolean => {
      if (nodeFrom && nodeTo) {
        if (nodeFrom.id === nodeTo.id) {
          return true;
        }
        if (nodeFrom.id === 0) {
          return false;
        }
        return checkIfRecursiveChildrenisSelected(
          nodeTo,
          nodes.find((n) => n.id === nodeFrom.parent)
        );
      }
      return false;
    };

    const handleDeleteNode = (nodeToDelete: node) => {
      // eslint-disable-next-line no-alert
      if (window.confirm('Are you sure you want to delete this node?')) {
        // If the node is selected, select the parent
        // Get the parent node
        const parentNode = nodes.find((n) => n.id === nodeToDelete.parent);
        if (!parentNode) {
          return;
        }
        if (selectedNode?.id === nodeToDelete.id) {
          setSelectedNode(parentNode);
        }
        if (checkIfRecursiveChildrenisSelected(nodeToDelete)) {
          // Set the selected node to the parent of the node to be deleted
          setSelectedNode(parentNode);
        }
        deleteNode(nodeToDelete);
      }
    };
    const handleEditNode = (nodeToEdit: node) => {
      // eslint-disable-next-line no-alert
      const newText = prompt('Enter new text', nodeToEdit.text);
      if (newText) {
        updateNode(nodeToEdit, { ...nodeToEdit, text: newText });
      }
    };
    const handleMoveSelectionToParent = () => {
      if (selectedNode) {
        // Get the parent of the selected node
        const parent = nodes.find((nodeF) => nodeF.id === selectedNode.parent);
        if (parent) {
          setSelectedNode(parent);
        }
      }
    };
    const handleMoveSelectionToChild = () => {
      if (selectedNode) {
        // Get the children of the selected node
        let children = nodes.filter(
          (nodeF) => nodeF.parent === selectedNode.id
        );
        // If selectedNode is the root, remove the root from the children
        if (selectedNode.id === 0) {
          children = children.filter((nodeF) => nodeF.id !== 0);
        }
        // Get the child with the most children
        const child = children.reduce(
          (prev, curr) =>
            nodes.filter((nodeF) => nodeF.parent === curr.id).length >
            nodes.filter((nodeF) => nodeF.parent === prev.id).length
              ? curr
              : prev,
          children[0]
        );
        if (child) {
          setSelectedNode(child);
        }
      }
    };
    const handleMoveSelectionToSibling = (
      direction: 'clockwise' | 'anticlockwise'
    ) => {
      if (selectedNode) {
        // Get the parent of the selected node
        const parent = nodes.find((nodeF) => nodeF.id === selectedNode.parent);
        if (parent) {
          // Get the children of the parent
          const children = nodes.filter(
            (nodeF) => nodeF.parent === parent.id && nodeF.id !== 0
          );
          // Keep the children that have x and y values
          const childrenWithCoords = children.filter(
            (nodeF) => nodeF.x && nodeF.y
          );
          // Sort the children in clockwise order
          childrenWithCoords.sort((a, b) => {
            // check if any of the nodes are undefined, but allow 0
            if (
              a.x === undefined ||
              a.y === undefined ||
              b.x === undefined ||
              b.y === undefined ||
              parent.x === undefined ||
              parent.y === undefined
            ) {
              return 0;
            }
            const atanA = Math.atan2(a.y - parent.y, a.x - parent.x);
            const atanB = Math.atan2(b.y - parent.y, b.x - parent.x);
            return atanA - atanB;
          });
          // Get the index of the selected node in the sorted array
          const index = childrenWithCoords.findIndex(
            (nodeF) => nodeF.id === selectedNode.id
          );
          // Get the next node in the sorted array
          const nextNode =
            direction === 'clockwise'
              ? childrenWithCoords[(index + 1) % childrenWithCoords.length]
              : childrenWithCoords[
                  (index - 1 + childrenWithCoords.length) %
                    childrenWithCoords.length
                ];
          if (nextNode) {
            setSelectedNode(nextNode);
          }
        }
      }
    };
    const handleMoveSelectionToNextSibling = () => {
      if (selectedNode) {
        handleMoveSelectionToSibling('clockwise');
      }
    };
    const handleMoveSelectionToPreviousSibling = () => {
      if (selectedNode) {
        handleMoveSelectionToSibling('anticlockwise');
      }
    };
    const handleMoveSelectionToRoot = () => {
      // Get the root node
      const root = nodes.find((nodeF) => nodeF.id === 0);
      if (root) {
        setSelectedNode(root);
      }
    };
    const handleToggleNodeLock = (nodeToToggle: node) => {
      setNodeLockStates({
        ...nodeLockStates,
        [nodeToToggle.id]: !nodeLockStates[nodeToToggle.id],
      });
    };

    const [mouseDown, setMouseDown] = useState(false);
    const [downMouseCoords, setDownMouseCoords] = useState({ x: 0, y: 0 });

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
      if (dragNodeSelected) {
        if (dragNodeSelected.id === 0) {
          setDragNodeSelected(undefined);
        } else {
          dragNodeSelected.x = dragNodeSelected?.fx ?? 0;
          dragNodeSelected.y = dragNodeSelected?.fy ?? 0;
          if (!nodeLockStates[dragNodeSelected.id]) {
            dragNodeSelected.fx = null;
            dragNodeSelected.fy = null;
          }
          setDragNodeSelected(undefined);
          simulation?.alpha(1).restart();
        }
      }
    };

    const onMouseMove = (e: MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (dragNodeSelected && dragNodeSelected.id !== 0) {
        dragNodeSelected.fx =
          (e.clientX - context.state.positionX + mouseDelta.x) /
          context.state.scale;
        dragNodeSelected.fy =
          (e.clientY - context.state.positionY + mouseDelta.y) /
          context.state.scale;
        simulation?.alpha(1).restart();
      }
    };

    useImperativeHandle(ref, () => ({
      releaseBubble() {
        releaseBubble();
      },
      onMouseMove(e: MouseEvent<HTMLDivElement, MouseEvent>) {
        onMouseMove(e);
      },
      handleAddNode() {
        if (selectedNode) {
          handleAddNode(selectedNode);
        }
      },
      handleDeleteNode() {
        if (selectedNode) {
          handleDeleteNode(selectedNode);
        }
      },
      handleEditNode() {
        if (selectedNode) {
          handleEditNode(selectedNode);
        }
      },
      handleMoveSelectionToParent() {
        if (selectedNode) {
          handleMoveSelectionToParent();
        }
      },
      handleMoveSelectionToChild() {
        if (selectedNode) {
          handleMoveSelectionToChild();
        }
      },
      handleMoveSelectionToNextSibling() {
        if (selectedNode) {
          handleMoveSelectionToNextSibling();
        }
      },
      handleMoveSelectionToPreviousSibling() {
        if (selectedNode) {
          handleMoveSelectionToPreviousSibling();
        }
      },
      handleMoveSelectionToRoot() {
        handleMoveSelectionToRoot();
      },
      handleToggleNodeLock() {
        if (selectedNode) {
          handleToggleNodeLock(selectedNode);
        }
      },
    }));

    if (simulation === null) return <Loading />;

    let nodeClicked: (SimulationNodeDatum & node) | undefined;
    if (nodes.length > 0)
      return (
        <svg
          style={{
            overflow: 'visible',
          }}
          onMouseDown={(e) => {
            // if right click
            if (e.button === 2) {
              return;
            }
            const x =
              (e.clientX - context.state.positionX + mouseDelta.x) /
              context.state.scale;
            const y =
              (e.clientY - context.state.positionY + mouseDelta.y) /
              context.state.scale;
            nodeClicked = simulation?.find(x, y, 15);
            if (!nodeClicked) return;
            nodeClicked.fx = nodeClicked.x;
            nodeClicked.fy = nodeClicked.y;
            setDragNodeSelected(nodeClicked);
            setMouseDown(true);
            setDownMouseCoords({ x: e.clientX, y: e.clientY });
            e.stopPropagation();
          }}
          onMouseUp={() => {
            releaseBubble();
          }}
        >
          {links.map((link) => (
            <BubbleLink
              key={link.target}
              sourceNode={nodes[link.source]}
              targetNode={nodes[link.target]}
            />
          ))}
          {nodes.map((nodeData) => {
            const handleAddNodePD = () => {
              handleAddNode(nodeData);
            };
            const handleDeleteNodePD = () => {
              handleDeleteNode(nodeData);
            };
            const handleEditNodePD = () => {
              handleEditNode(nodeData);
            };
            const handleSetNodeLockStatePD = (lockState?: boolean) => {
              if (nodeData.id === 0) return;
              if (lockState === undefined) {
                handleSetNodeLockStatePD(!nodeLockStates[nodeData.id]);
              } else {
                // Update the lock state of the node in the nodeLockStates state array
                setNodeLockStates({
                  ...nodeLockStates,
                  [nodeData.id]: lockState,
                });
              }
            };
            return (
              <Bubble
                key={nodeData.id}
                node={nodeData}
                dragging={dragNodeSelected === nodeData}
                selected={selectedNode?.id === nodeData.id}
                setSelectedNode={setSelectedNode}
                mouseDown={mouseDown}
                setMouseDown={setMouseDown}
                downMouseCoords={downMouseCoords}
                handleAddNode={handleAddNodePD}
                handleDeleteNode={handleDeleteNodePD}
                updateNode={updateNode}
                handleEditNode={handleEditNodePD}
                handleSetNodeLockState={handleSetNodeLockStatePD}
                locked={nodeLockStates[nodeData.id]}
              />
            );
          })}
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
  selectedNode,
  setSelectedNode,
}: {
  data: WithID<MindMap>;
  addNode: (node: { parent: number; text: string }) => void;
  deleteNode: (node: node) => void;
  updateNode: (oldNode: node, newNode: node) => void;
  selectedNode: SimulationNodeDatum & node;
  setSelectedNode: Dispatch<SetStateAction<SimulationNodeDatum & node>>;
}) => {
  const [dragNodeSelected, setDragNodeSelected] = useState<
    (SimulationNodeDatum & node) | undefined
  >(undefined);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const childRef = useRef<any>();

  const handleAddNode = (parentNode?: SimulationNodeDatum & node) => {
    if (!parentNode) return;
    // eslint-disable-next-line no-alert
    const newText = prompt('Enter new text', '');
    if (newText) {
      addNode({ parent: parentNode.id, text: newText });
    }
  };

  const shortcutHandlers = {
    ADD_NODE: (e?: KeyboardEvent) => {
      handleAddNode(selectedNode);
      e?.preventDefault();
    },
    DELETE_NODE: (e?: KeyboardEvent) => {
      childRef.current.handleDeleteNode();
      e?.preventDefault();
    },
    EDIT_NODE_TEXT: (e?: KeyboardEvent) => {
      childRef.current.handleEditNode();
      e?.preventDefault();
    },
    MOVE_SELECTION_TO_PARENT: (e?: KeyboardEvent) => {
      childRef.current.handleMoveSelectionToParent();
      e?.preventDefault();
    },
    MOVE_SELECTION_TO_CHILD: (e?: KeyboardEvent) => {
      childRef.current.handleMoveSelectionToChild();
      e?.preventDefault();
    },
    MOVE_SELECTION_TO_NEXT_SIBLING: (e?: KeyboardEvent) => {
      childRef.current.handleMoveSelectionToNextSibling();
      e?.preventDefault();
    },
    MOVE_SELECTION_TO_PREVIOUS_SIBLING: (e?: KeyboardEvent) => {
      childRef.current.handleMoveSelectionToPreviousSibling();
      e?.preventDefault();
    },
    MOVE_SELECTION_TO_ROOT: (e?: KeyboardEvent) => {
      childRef.current.handleMoveSelectionToRoot();
      e?.preventDefault();
    },
    RESET_VIEW: (e?: KeyboardEvent) => {
      // TODO: Reset the Transform
      e?.preventDefault();
    },
    LOCK_NODE: (e?: KeyboardEvent) => {
      childRef.current.handleToggleNodeLock();
      e?.preventDefault();
    },
  };

  return (
    <GlobalHotKeys handlers={shortcutHandlers} allowChanges>
      <div
        onMouseLeave={() => childRef?.current?.releaseBubble()}
        onMouseMove={(e) => childRef?.current?.onMouseMove(e)}
      >
        <TransformWrapper
          initialScale={1}
          minScale={0.1}
          maxScale={25}
          limitToBounds={false}
          centerOnInit
          panning={{
            disabled: !!dragNodeSelected,
          }}
          doubleClick={{
            disabled: true,
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
          >
            <MindMapSimulationWithTransform
              ref={childRef}
              data={data}
              dragNodeSelected={dragNodeSelected}
              setDragNodeSelected={setDragNodeSelected}
              addNode={addNode}
              handleAddNode={handleAddNode}
              deleteNode={deleteNode}
              updateNode={updateNode}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
            />
          </TransformComponent>
        </TransformWrapper>
      </div>
      <BottomBar
        data={data}
        handleAddNode={handleAddNode}
        selectedNode={selectedNode}
      />
    </GlobalHotKeys>
  );
};

export default MindMapSimulation;
