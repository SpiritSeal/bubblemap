import React, { useState } from 'react';
import {
  doc,
  arrayRemove,
  arrayUnion,
  writeBatch,
  serverTimestamp,
  Timestamp,
  setDoc,
} from 'firebase/firestore';
import { Fab } from '@mui/material';
import { BubbleChart } from '@mui/icons-material';
import { useFirestore, useFirestoreDocData, useUser } from 'reactfire';
import { useNavigate, useParams } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
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
import keyBindings from './keybindings';

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

    setDoc(mindMapRef, docUpdates, { merge: true });
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
        ...[strippedNodeToDelete, ...children.map(stripInputNodeProperties)],
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
        ],
      ) as unknown as undefined,
    };

    batch.set(mindMapRef, updateNodesAndMetadata, { merge: true });

    batch.commit();
  };

  const updateNode = (oldNode: node, newNode: node) => {
    if (!user) return;

    const batch = writeBatch(firestore);
    if (oldNode.id !== newNode.id) {
      console.warn(
        'Node ID changed, funny things might happen, so blocking update',
      );
      return;
    }
    const oldNodeUpdate: RecursivePartial<MindMapType> = {
      nodes: arrayRemove(
        stripInputNodeProperties(oldNode),
      ) as unknown as undefined,
    };

    batch.update(mindMapRef, oldNodeUpdate);

    const newNodeUpdate: RecursivePartial<MindMapType> = {
      nodes: arrayUnion(
        stripInputNodeProperties(newNode),
      ) as unknown as undefined,
      metadata: {
        updatedAt: serverTimestamp() as Timestamp,
        updatedBy: user.uid,
        everUpdatedBy: arrayUnion(user.uid) as unknown as string[],
      },
    };

    batch.set(mindMapRef, newNodeUpdate, { merge: true });

    batch.commit();
    if (selectedNode?.id === oldNode.id) {
      setSelectedNode(newNode);
    }
  };

  // Not Implemented
  useHotkeys(keyBindings.TOGGLE_SETTINGS, () => {
    // eslint-disable-next-line no-console
    console.log('Toggle Settings');
  });

  // Get the mindmap node with id 0, which is the root node
  const rootNode = mindmap.nodes.find((o) => o.id === 0);

  if (!mindmap) throw new Error('Sorry, I couldn&apos;t find that mindmap.');

  if (!rootNode) {
    throw new Error('Root node not found!');
  }

  const [selectedNode, setSelectedNode] = useState<SimulationNodeDatum & node>(
    rootNode,
  );

  return (
    <div style={{ margin: 0, padding: 0 }}>
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
    </div>
  );
};

export default MindMap;
