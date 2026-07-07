import React, { useMemo, useRef, useState } from 'react';
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
  diffNodes,
  mintNodeID,
  NodeChange,
  normalizeNodes,
  ROOT_NODE_ID,
  withChangesUndone,
  withNodeAdded,
  withNodeDeleted,
  withNodeUpdated,
} from '../../nodeOps';
import MindMapSimulation from './MindMapSimulation';
import GenIdeaPanel from './overlays/GenIdeaPanel';
import Loading from '../../components/Loading';
import keyBindings from './keybindings';

// Undo entries kept per session; oldest entries fall off past this depth.
const MAX_UNDO_DEPTH = 100;

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

  // Session-local undo: one entry per committed transaction, newest last.
  // Deliberately a ref, not state — nothing renders from it, and pushes
  // happen from async transaction callbacks. Cleared on refresh/navigation.
  const undoStackRef = useRef<NodeChange[][]>([]);

  // All node ops go through a transaction: read a fresh copy of the doc,
  // transform its (normalized) node list, write the whole list back. This
  // avoids the arrayRemove/arrayUnion failure modes where a stale local
  // copy silently duplicated or resurrected nodes under concurrent edits.
  const commitNodes = (
    transform: (currentNodes: node[]) => node[],
    recordUndo = true,
  ) => {
    if (!user) return;
    // The transaction body can retry; only the last run's diff is kept, and
    // it is pushed onto the undo stack only after the commit succeeds.
    let committedChanges: NodeChange[] = [];
    runTransaction(firestore, async (transaction) => {
      const snapshot = await transaction.get(mindMapRef);
      if (!snapshot.exists()) throw new Error('MindMap no longer exists');
      const currentNodes = normalizeNodes(snapshot.data().nodes);
      const nextNodes = transform(currentNodes);
      committedChanges = recordUndo ? diffNodes(currentNodes, nextNodes) : [];
      transaction.update(mindMapRef, {
        nodes: nextNodes,
        'metadata.updatedAt': serverTimestamp(),
        'metadata.updatedBy': user.uid,
        'metadata.everUpdatedBy': arrayUnion(user.uid),
      });
    })
      .then(() => {
        if (committedChanges.length === 0) return;
        undoStackRef.current.push(committedChanges);
        if (undoStackRef.current.length > MAX_UNDO_DEPTH) {
          undoStackRef.current.shift();
        }
      })
      .catch((error) => console.error('Failed to save mindmap change', error));
  };

  const undo = () => {
    const entry = undoStackRef.current.pop();
    if (!entry) return;
    // Conflicted pieces no-op inside withChangesUndone; a fully-conflicted
    // entry is simply dropped rather than resurrecting stale content.
    commitNodes(
      (currentNodes) => withChangesUndone(currentNodes, entry),
      false,
    );
  };

  useHotkeys(keyBindings.UNDO, undo, { preventDefault: true });

  if (!rootNode) {
    throw new Error('Root node not found!');
  }

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
