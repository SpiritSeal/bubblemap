import React from 'react';
import {
  doc,
  arrayRemove,
  updateDoc,
  arrayUnion,
  writeBatch,
} from 'firebase/firestore';
import { useFirestore, useFirestoreDocData } from 'reactfire';
import { useParams } from 'react-router-dom';
import { HotKeys } from 'react-hotkeys';
import { localNode, MindMap as MindMapType, node } from '../../types';
import MindMapSimulation from './MindMapSimulation';
import SideMenu from './overlays/SideMenu/SideMenu';

const keyMap = {
  ADD_NODE: 'ctrl+enter',
  DELETE_NODE: 'del',
  EDIT_NODE_TEXT: 'enter',
  GENERATE_IDEAS: 'ctrl+shift+enter',
  TOGGLE_SIDE_MENU: 'ctrl+shift+s',
  TOGGLE_SETTINGS: 'ctrl+shift+p',
  // MOVE_SELECTION_POINTER_TO_PARENT has two options: 'up' or '`'
  MOVE_SELECTION_POINTER_TO_PARENT: ['up', '`'],
};

const MindMap = () => {
  const { mindmapID } = useParams();

  const firestore = useFirestore();
  const mindMapRef = doc(firestore, `mindmaps/${mindmapID}`);
  const mindmap = useFirestoreDocData(mindMapRef).data as MindMapType;

  const addNode = ({ parent, text }: { parent: number; text: string }) => {
    const newID = Math.max(...mindmap.nodes.map((o) => o.id), 0) + 1;
    if (Number.isNaN(newID))
      throw new Error(`New ID not a number! New ID: ${newID}`);
    const newNode: node = {
      parent,
      // children: [],
      text,
      id: newID,
    };
    updateDoc(mindMapRef, {
      nodes: arrayUnion(newNode),
    });
  };

  const stripInputNodeProperties = (inputNode: localNode) => {
    const strippedNode: node = {
      parent: inputNode.parent,
      text: inputNode.text,
      id: inputNode.id,
    };
    return strippedNode;
  };

  const getAllChildren = (nodeTarget: node): node[] => {
    // recursively get all children of a node
    const children = mindmap.nodes.filter((o) => o.parent === nodeTarget.id);
    if (children.length === 0) return [];
    return children.concat(...children.map((o) => getAllChildren(o)));
  };

  const deleteNode = (nodeToDelete: node) => {
    if (nodeToDelete.id === 0) return;
    /*
     * Node deletion should be a rare event in an additive idea generation tool,
     * so it makes more sense to have an O(N^2) operation here that finds all the
     * nodes that need to be deleted in our singly linked list rather than
     * increasing our space complexity by creating a doubly linked list storing a
     * list of children for each node.
     */
    const children = getAllChildren(nodeToDelete);
    const batch = writeBatch(firestore);
    batch.update(mindMapRef, {
      nodes: arrayRemove(stripInputNodeProperties(nodeToDelete)),
    });
    children.forEach((child) => {
      batch.update(mindMapRef, {
        nodes: arrayRemove(stripInputNodeProperties(child)),
      });
    });
    batch.commit();
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
  // const updateNodePrompt = (nodeToUpdate: node) => {
  //   // Create an MUI dialog box to update the node
  // };

  if (!mindmap) return <div>Sorry, I couldn&apos;t find that mindmap.</div>;

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <HotKeys keyMap={keyMap}>
        <MindMapSimulation
          data={mindmap}
          addNode={addNode}
          deleteNode={deleteNode}
          updateNode={updateNode}
        />
        <SideMenu />
      </HotKeys>
      {/* <FormDialog promptText="Hello world!" /> */}
    </div>
  );
};

export default MindMap;
