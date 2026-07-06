import React, { useMemo, useState } from 'react';
import {
  doc,
  arrayUnion,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { Fab } from '@mui/material';
import { BubbleChart } from '@mui/icons-material';
import { useFirestore, useFirestoreDocData, useUser } from 'reactfire';
import { useNavigate, useParams } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import { SimulationNodeDatum } from 'd3-force';
import { MindMap as MindMapType, node, WithID } from '../../types';
import {
  mintNodeID,
  normalizeNodes,
  ROOT_NODE_ID,
  withNodeAdded,
  withNodeDeleted,
  withNodeUpdated,
} from '../../nodeOps';
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

  // All node ops go through a transaction: read a fresh copy of the doc,
  // transform its (normalized) node list, write the whole list back. This
  // avoids the arrayRemove/arrayUnion failure modes where a stale local
  // copy silently duplicated or resurrected nodes under concurrent edits.
  const commitNodes = (transform: (nodes: node[]) => node[]) => {
    if (!user) return;
    runTransaction(firestore, async (transaction) => {
      const snapshot = await transaction.get(mindMapRef);
      if (!snapshot.exists()) throw new Error('MindMap no longer exists');
      transaction.update(mindMapRef, {
        nodes: transform(normalizeNodes(snapshot.data().nodes)),
        'metadata.updatedAt': serverTimestamp(),
        'metadata.updatedBy': user.uid,
        'metadata.everUpdatedBy': arrayUnion(user.uid),
      });
    }).catch((error) => console.error('Failed to save mindmap change', error));
  };

  const addNode = ({ parent, text }: { parent: string; text: string }) => {
    if (!user) return;

    const newNode: node = {
      parent,
      text,
      id: mintNodeID(),
    };

    commitNodes((nodes) => withNodeAdded(nodes, newNode));
    setSelectedNode(newNode);
  };

  const deleteNode = (nodeToDelete: node) => {
    if (nodeToDelete.id === ROOT_NODE_ID) return;
    commitNodes((nodes) => withNodeDeleted(nodes, nodeToDelete.id));
  };

  const updateNode = (oldNode: node, newNode: node) => {
    if (oldNode.id !== newNode.id) {
      console.warn(
        'Node ID changed, funny things might happen, so blocking update',
      );
      return;
    }

    commitNodes((nodes) => withNodeUpdated(nodes, newNode));
    if (selectedNode?.id === oldNode.id) {
      setSelectedNode(newNode);
    }
  };

  // Not Implemented
  useHotkeys(keyBindings.TOGGLE_SETTINGS, () => {
    // eslint-disable-next-line no-console
    console.log('Toggle Settings');
  });

  // Legacy documents store numeric node IDs; normalize once per snapshot.
  const nodes = useMemo(() => normalizeNodes(mindmap?.nodes), [mindmap]);

  if (!mindmap) throw new Error("Sorry, I couldn't find that mindmap.");

  const rootNode = nodes.find((o) => o.id === ROOT_NODE_ID);

  if (!rootNode) {
    throw new Error('Root node not found!');
  }

  const [selectedNode, setSelectedNode] = useState<SimulationNodeDatum & node>(
    rootNode,
  );

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <MindMapSimulation
        data={{ ...mindmap, nodes }}
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
