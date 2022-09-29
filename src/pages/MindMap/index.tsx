import React from 'react';
import {
  doc,
  arrayRemove,
  updateDoc,
  arrayUnion,
  writeBatch,
} from 'firebase/firestore';
import { useFirestore, useFirestoreDocData } from 'reactfire';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { MindMap as MindMapType, node } from '../../types';

import MindMapSimulation from './MindMapSimulation';
import SideMenu from './overlays/SideMenu/SideMenu';
import TestFunctionButton from './overlays/TestFunctionButton/TestFunctionButton';

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
    <div style={{ margin: 0, padding: 0 }}>
      <MindMapSimulation
        data={mindmap}
        addNode={addNode}
        deleteNode={deleteNode}
        updateNode={updateNode}
      />
      <SideMenu />
      <TestFunctionButton
        // eslint-disable-next-line
        functionToTest={console.log}
        parameters="test"
        icon={<AddCircleOutlineIcon />}
      />
    </div>
  );
};

export default MindMap;
