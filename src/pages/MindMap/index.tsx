import React, { useState } from 'react';
import {
  doc,
  arrayRemove,
  updateDoc,
  arrayUnion,
  writeBatch,
} from 'firebase/firestore';
import { useFirestore, useFirestoreDocData } from 'reactfire';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { SimulationNodeDatum } from 'd3-force';
import { MindMap as MindMapType, node } from '../../types';

import MindMapSimulation from './MindMapSimulation';
import SideMenu from './overlays/SideMenu/SideMenu';
import TestFunctionButton from './overlays/TestFunctionButton/TestFunctionButton';
import Loading from '../../components/Loading';

const MindMap = ({ mindmapID }: { mindmapID: string }) => {
  const firestore = useFirestore();
  const mindMapRef = doc(firestore, `mindmaps/${mindmapID}`);
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

  if (!mindmap)
    return (
      <div>
        <h1>{mindmapID}</h1>
        <Loading />
      </div>
    );

  const [selectedNode, setSelectedNode] = useState<
    SimulationNodeDatum & node
  >();

  const [selectedNode, setSelectedNode] = useState<
    SimulationNodeDatum & node
  >();

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
      <SideMenu />
      <TestFunctionButton
        // eslint-disable-next-line
        onClick={() =>{
          addNode({
            parent: selectedNode?.id || 0,
            text: `Hello world! ${selectedNode?.id}`,
          });
          console.log('Selected: ', selectedNode);
          // setSelectedNode(selectedNode);
          // Get the node with the highest ID
          const maxID = Math.max(...mindmap.nodes.map((o) => o.id), 0);
          console.log('Max ID: ', maxID);
          setSelectedNode(mindmap.nodes.find((o) => o.id === maxID));
          setSelectedNode(mindmap.nodes[0]);
        }}
        icon={<AddCircleOutlineIcon />}
      />
    </div>
  );
};

export default MindMap;
