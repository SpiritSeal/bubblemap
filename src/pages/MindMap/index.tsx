import React from 'react';
import {
  doc,
  arrayRemove,
  updateDoc,
  arrayUnion,
  writeBatch,
} from 'firebase/firestore';
import { useFirestore, useFirestoreDocData } from 'reactfire';
import { MindMap as MindMapType, node } from '../../types';

import MindMapSimulation from './MindMapSimulation';

const MindMap = () => {
  const firestore = useFirestore();

  const mindMapRef = doc(firestore, 'mindmaps/PxICnzGAskSEQXxkCIL4');

  const mindmap = useFirestoreDocData(mindMapRef).data as MindMapType;

  const addNode = (nodeToAdd: node) => {
    updateDoc(mindMapRef, {
      nodes: arrayUnion(nodeToAdd),
    });
  };

  const deleteNode = (nodeToDelete: node) => {
    updateDoc(mindMapRef, {
      nodes: arrayRemove(nodeToDelete),
    });
  };

  const updateNode = (oldNode: node, newNode: node) => {
    const batch = writeBatch(firestore);
    batch.update(mindMapRef, {
      nodes: arrayRemove(oldNode),
    });
    batch.update(mindMapRef, {
      nodes: arrayUnion(newNode),
    });
    batch.commit();
  };
  return (
    <MindMapSimulation
      data={mindmap}
      addNode={addNode}
      deleteNode={deleteNode}
      updateNode={updateNode}
    />
  );
};

export default MindMap;
