import React, { useEffect } from 'react';
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
import Loading from '../../components/Loading';

const MindMap = () => {
  const firestore = useFirestore();
  const mindMapRef = doc(firestore, 'mindmaps/PxICnzGAskSEQXxkCIL4');
  const mindmap = useFirestoreDocData(mindMapRef).data as MindMapType;

  const addNode = ({ parent, text }: { parent: number; text: string }) => {
    const newID = Math.max(...mindmap.nodes.map((o) => o.id), 0) + 1;

    if (Number.isNaN(newID))
      throw new Error(`New ID not a number! New ID: ${newID}`);

    const newNode: node = {
      id: newID,
      parent,
      text,
    };
    updateDoc(mindMapRef, {
      nodes: arrayUnion(newNode),
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

  useEffect(() => {
    const timer = setTimeout(() => {
      addNode({
        parent: 11,
        text: 'Howday!',
      });
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!mindmap) return <Loading />;

  console.log('New Data Inbound!');

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
        onClick={() =>
          addNode({
            parent: 0,
            text: 'Hello world!',
          })
        }
        icon={<AddCircleOutlineIcon />}
      />
    </div>
  );
};

export default MindMap;
