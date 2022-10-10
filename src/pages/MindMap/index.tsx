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
import { localNode, MindMap as MindMapType, node } from '../../types';

import MindMapSimulation from './MindMapSimulation';
import SideMenu from './overlays/SideMenu/SideMenu';
import TestFunctionButton from './overlays/TestFunctionButton/TestFunctionButton';
import Loading from '../../components/Loading';
import FormDialog from './overlays/FormDialog';

const MindMap = ({ mindmapID }: { mindmapID: string }) => {
  const firestore = useFirestore();
  const mindMapRef = doc(firestore, `mindmaps/${mindmapID}`);
  const mindmap = useFirestoreDocData(mindMapRef).data as MindMapType;

  const addNode = ({ parent, text }: { parent: number; text: string }) => {
    const newID = Math.max(...mindmap.nodes.map((o) => o.id), 0) + 1;

    if (Number.isNaN(newID))
      throw new Error(`New ID not a number! New ID: ${newID}`);

    const newNode: localNode = {
      children: [],
      id: newID,
      parent,
      text,
    };
    updateDoc(mindMapRef, {
      nodes: arrayUnion(newNode),
    });

    // if (parent !== -1) {
    //   // Get the parent node
    //   const parentNode = mindmap.nodes.find(
    //     (o) => o.id === parent
    //   ) as localNode;
    //   if (!parentNode) throw new Error('Parent node not found!');
    //   // Update the parent node
    //   updateNode(parentNode, {
    //     ...parentNode,
    //     children: [...((parentNode as localNode).children ?? []), newID],
    //   });
    // }
  };

  const stripInputNodeProperties = (inputNode: localNode) => {
    const strippedNode: localNode = {
      children: inputNode.children,
      id: inputNode.id,
      parent: inputNode.parent,
      text: inputNode.text,
    };
    return strippedNode;
  };

  const deleteNode = (nodeToDelete: localNode) => {
    if (nodeToDelete.id === 0) return;
    // Remove node from parent's children
    const parent = mindmap.nodes.find(
      (o) => o.id === nodeToDelete.parent
    ) as localNode;
    // updateNode(parent, {
    //   ...parent,
    //   // children: parent.children.filter((o) => o !== nodeToDelete.id) ?? [],
    // });

    if (nodeToDelete.children) {
      nodeToDelete.children.forEach((child) => {
        // Get the child node
        const childNode = mindmap.nodes.find(
          (nodeFound) => nodeFound.id === child
        );
        if (childNode) {
          deleteNode(childNode);
        }
      });
    }

    console.log('Deleting node', nodeToDelete);
    const strippedNodeToDelete = stripInputNodeProperties(nodeToDelete);

    updateDoc(mindMapRef, {
      nodes: arrayRemove(strippedNodeToDelete),
    });
  };
  const updateNode = (oldNode: node, newNode: node) => {
    const batch = writeBatch(firestore);
    batch.update(mindMapRef, {
      nodes: arrayRemove(stripInputNodeProperties(oldNode)),
    });
    batch.update(mindMapRef, {
      nodes: arrayUnion(stripInputNodeProperties(newNode)),
    });
    batch.commit();
  };
  const updateNodePrompt = (nodeToUpdate: node) => {
    // Create an MUI dialog box to update the node
  };

  if (!mindmap)
    return (
      <div>
        <h1>{mindmapID}</h1>
        <Loading />
      </div>
    );

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
      {/* <FormDialog promptText="Hello world!" /> */}
    </div>
  );
};

export default MindMap;
