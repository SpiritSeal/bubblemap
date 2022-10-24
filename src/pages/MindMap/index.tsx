import React, { useState } from 'react';
import {
  doc,
  arrayRemove,
  updateDoc,
  arrayUnion,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { Fab } from '@mui/material';
import { BubbleChart } from '@mui/icons-material';
import { useFirestore, useFirestoreDocData, useUser } from 'reactfire';
import { useNavigate, useParams } from 'react-router-dom';
// You can use getApplicationKeyMap from react-hotkeys to get the keymaps for the application
import { GlobalHotKeys } from 'react-hotkeys';
import { SimulationNodeDatum } from 'd3-force';
import {
  localNode,
  MindMap as MindMapType,
  node,
  RecursivePartial,
  WithID,
} from '../../types';
import MindMapSimulation from './MindMapSimulation';
import GenIdeaPanel from './overlays/GenIdeaPanel';

const keyMap = {
  ADD_NODE: 'ctrl+enter',
  DELETE_NODE: ['del', 'backspace'],
  EDIT_NODE_TEXT: 'enter',
  // Not Implemented
  GENERATE_IDEAS: 'ctrl+shift+enter',
  // Not Implemented
  TOGGLE_SIDE_MENU: 'ctrl+shift+s',
  // Not Implemented
  TOGGLE_SETTINGS: 'ctrl+shift+p',
  MOVE_SELECTION_TO_PARENT: ['up', '`'],
  MOVE_SELECTION_TO_CHILD: 'down',
  MOVE_SELECTION_TO_NEXT_SIBLING: ['right', 'tab'],
  MOVE_SELECTION_TO_PREVIOUS_SIBLING: ['left', 'shift+tab'],
  MOVE_SELECTION_TO_ROOT: ['0', 'ctrl+up'],
  RESET_VIEW: ['ctrl+0', 'home'],
  LOCK_NODE: ['l', 'ctrl+l', 'space'],
};

const MindMap = () => {
  const { mindmapID } = useParams();
  const navigate = useNavigate();

  const firestore = useFirestore();
  const user = useUser().data;
  const mindMapRef = doc(firestore, `mindmaps/${mindmapID}`);
  const mindmap = useFirestoreDocData(mindMapRef, { idField: 'ID' })
    .data as WithID<MindMapType>;

  const addNode = ({ parent, text }: { parent: number; text: string }) => {
    if (!user) return;

    const newID =
      mindmap.nodes.length > 0
        ? Math.max(...mindmap.nodes.map((o) => o.id), 0) + 1
        : 0;

    if (Number.isNaN(newID))
      throw new Error(`New ID not a number! New ID: ${newID}`);

    const newNode: node = {
      parent,
      text,
      id: newID,
    };

    const docUpdates: RecursivePartial<MindMapType> = {
      nodes: arrayUnion(newNode) as unknown as undefined,
      metadata: {
        updatedAt: serverTimestamp() as Timestamp,
        updatedBy: user.uid,
        everUpdatedBy: arrayUnion(user.uid) as unknown as string[],
      },
    };

    updateDoc(mindMapRef, docUpdates);
    setSelectedNode(newNode);
  };

  const stripInputNodeProperties = (inputNode: localNode): node => ({
    parent: inputNode.parent,
    text: inputNode.text,
    id: inputNode.id,
  });

  const getChildren = (nodeTarget: node): node[] =>
    mindmap.nodes.filter((o) => o.parent === nodeTarget.id);

  const deleteNode = (nodeToDelete: node) => {
    if (!user) return;

    if (nodeToDelete.id === 0) return;

    const nodeToDeleteParentID = nodeToDelete.parent;

    const children = getChildren(nodeToDelete);
    const strippedNodeToDelete = stripInputNodeProperties(nodeToDelete);

    const batch = writeBatch(firestore);

    const removeNodes: Partial<MindMapType> = {
      nodes: arrayRemove(
        ...[strippedNodeToDelete, ...children.map(stripInputNodeProperties)]
      ) as unknown as undefined,
    };

    batch.update(mindMapRef, removeNodes);

    const updateNodesAndMetadata: RecursivePartial<MindMapType> = {
      metadata: {
        everUpdatedBy: arrayUnion(user.uid) as unknown as string[],
        updatedAt: serverTimestamp() as Timestamp,
        updatedBy: user.uid,
      },
      nodes: arrayUnion(
        ...[
          // update all children's parent to nodeToDeleteParentID
          ...children.map(stripInputNodeProperties).map((o) => ({
            ...o,
            parent: nodeToDeleteParentID,
          })),
        ]
      ) as unknown as undefined,
    };

    batch.update(mindMapRef, updateNodesAndMetadata);

    batch.commit();
  };

  const updateNode = (oldNode: node, newNode: node) => {
    if (!user) return;

    const batch = writeBatch(firestore);
    if (oldNode.id !== newNode.id) {
      console.warn(
        'Node ID changed, funny things might happen, so blocking update'
      );
      return;
    }
    batch.update(mindMapRef, {
      nodes: arrayRemove(stripInputNodeProperties(oldNode)),
    });

    if (newNode.id === 0) {
      batch.update(mindMapRef, {
        title: newNode.text,
        nodes: arrayUnion(stripInputNodeProperties(newNode)),
      });
    } else {
      batch.update(mindMapRef, {
        nodes: arrayUnion(stripInputNodeProperties(newNode)),
      });
    }
    batch.commit();
    if (selectedNode?.id === oldNode.id) {
      setSelectedNode(newNode);
    }
  };

  if (!mindmap) return <div>Sorry, I couldn&apos;t find that mindmap.</div>;

  const shortcutHandlers = {
    TOGGLE_SETTINGS: () => {
      // eslint-disable-next-line no-console
      console.log('Toggle Settings');
    },
  };

  // Get the mindmap node with id 0, which is the root node
  const rootNode = mindmap.nodes.find((o) => o.id === 0);

  if (!rootNode) {
    throw new Error('Root node not found!');
  }

  const [selectedNode, setSelectedNode] = useState<SimulationNodeDatum & node>(
    rootNode
  );

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <GlobalHotKeys keyMap={keyMap} handlers={shortcutHandlers}>
        <MindMapSimulation
          data={mindmap}
          addNode={addNode}
          deleteNode={deleteNode}
          updateNode={updateNode}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
        />
        <GenIdeaPanel
          selectedNode={selectedNode}
          data={mindmap}
          addNode={addNode}
        />
        <Fab
          variant="extended"
          sx={{
            left: 20,
            top: 20,
            position: 'fixed',
          }}
          onClick={() => navigate('/mindmaps')}
        >
          <BubbleChart />
          MindMaps
        </Fab>
      </GlobalHotKeys>
    </div>
  );
};

export default MindMap;
