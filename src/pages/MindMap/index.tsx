import React, { useMemo, useState } from 'react';
import {
  doc,
  arrayUnion,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { Fab } from '@mui/material';
import { BubbleChart } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import { SimulationNodeDatum } from 'd3-force';
import { useFirestore, useFirestoreDocData, useUser } from '../../firebase';
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
import Loading from '../../components/Loading';
import keyBindings from './keybindings';

const LoadedMindMap = ({ mindmap }: { mindmap: WithID<MindMapType> }) => {
  const navigate = useNavigate();
  const firestore = useFirestore();
  const user = useUser().data;
  const mindMapRef = doc(firestore, `mindmaps/${mindmap.ID}`);

  // Legacy documents store numeric node IDs; normalize once per snapshot.
  const nodes = useMemo(() => normalizeNodes(mindmap.nodes), [mindmap]);

  const rootNode = nodes.find((o) => o.id === ROOT_NODE_ID);

  const [selectedNode, setSelectedNode] = useState<SimulationNodeDatum & node>(
    () => {
      if (!rootNode) throw new Error('Root node not found!');
      return rootNode;
    },
  );

  // Not Implemented
  useHotkeys(keyBindings.TOGGLE_SETTINGS, () => {
    // eslint-disable-next-line no-console
    console.log('Toggle Settings');
  });

  if (!rootNode) {
    throw new Error('Root node not found!');
  }

  // All node ops go through a transaction: read a fresh copy of the doc,
  // transform its (normalized) node list, write the whole list back. This
  // avoids the arrayRemove/arrayUnion failure modes where a stale local
  // copy silently duplicated or resurrected nodes under concurrent edits.
  const commitNodes = (transform: (currentNodes: node[]) => node[]) => {
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

    commitNodes((currentNodes) => withNodeAdded(currentNodes, newNode));
    setSelectedNode(newNode);
  };

  const deleteNode = (nodeToDelete: node) => {
    if (nodeToDelete.id === ROOT_NODE_ID) return;
    commitNodes((currentNodes) =>
      withNodeDeleted(currentNodes, nodeToDelete.id),
    );
  };

  const updateNode = (oldNode: node, newNode: node) => {
    if (oldNode.id !== newNode.id) {
      console.warn(
        'Node ID changed, funny things might happen, so blocking update',
      );
      return;
    }

    commitNodes((currentNodes) => withNodeUpdated(currentNodes, newNode));
    if (selectedNode?.id === oldNode.id) {
      setSelectedNode(newNode);
    }
  };

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

const MindMap = () => {
  const { mindmapID } = useParams();
  const firestore = useFirestore();

  const mindMapRef = doc(firestore, `mindmaps/${mindmapID}`);
  const { status, data: mindmap } = useFirestoreDocData<WithID<MindMapType>>(
    mindMapRef,
    { idField: 'ID' },
  );

  if (status === 'loading') return <Loading />;

  // Missing document or permission-denied both land here; surface the
  // friendly message through the error boundary instead of a raw TypeError.
  if (!mindmap) throw new Error("Sorry, I couldn't find that mindmap.");

  return <LoadedMindMap mindmap={mindmap} />;
};

export default MindMap;
