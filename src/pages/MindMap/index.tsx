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
      parent,
      // children: [],
      text,
      id: newID,
    };
    updateDoc(mindMapRef, {
      nodes: arrayUnion(newNode),
    });

    if (parent !== -1) {
      // Get the parent node
      const parentNode = mindmap.nodes.find((o) => o.id === parent);
      if (!parentNode) throw new Error('Parent node not found!');
      // Update the parent node
      // const newParentNode = {
      //   ...parentNode,
      //   children: [...(parentNode.children ?? []), newID],
      // };
      // console.log('Updating parent node', parentNode, newParentNode);
      // updateNode(parentNode, newParentNode);
      // updateNode(parentNode, {
      //   ...parentNode,
      //   children: [...(parentNode.children ?? []), newID],
      // });
    }
  };

  const stripInputNodeProperties = (inputNode: localNode) => {
    const strippedNode: localNode = {
      parent: inputNode.parent,
      // children: inputNode.children,
      text: inputNode.text,
      id: inputNode.id,
    };
    return strippedNode;
  };

  const deleteNode = (nodeToDelete: localNode) => {
    if (nodeToDelete.id === 0) return;

    // if (nodeToDelete.children) {
    //   nodeToDelete.children.forEach((child) => {
    //     // Get the child node
    //     const childNode = mindmap.nodes.find(
    //       (nodeFound) => nodeFound.id === child
    //     );
    //     if (childNode) {
    //       deleteNode(childNode);
    //     }
    //   });
    // }

    const strippedNodeToDelete = stripInputNodeProperties(nodeToDelete);
    console.log('Deleting node', strippedNodeToDelete);

    updateDoc(mindMapRef, {
      nodes: arrayRemove(strippedNodeToDelete),
    });
    // Remove node from parent's children
    // const parent = mindmap.nodes.find(
    //   (o) => o.id === nodeToDelete.parent
    // ) as localNode;
    // updateNode(parent, {
    //   ...parent,
    //   children: parent.children?.filter((o) => o !== nodeToDelete.id) ?? [],
    // });
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
