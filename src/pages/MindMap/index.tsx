import React, { useState } from 'react';
import {
  doc,
  arrayRemove,
  updateDoc,
  arrayUnion,
  writeBatch,
} from 'firebase/firestore';
import { useFirestore, useFirestoreDocData } from 'reactfire';
import { useParams } from 'react-router-dom';
import { configure, GlobalHotKeys } from 'react-hotkeys';
// You can use getApplicationKeyMap from react-hotkeys to get the keymaps for the application
import { SimulationNodeDatum } from 'd3-force';
import { localNode, MindMap as MindMapType, node } from '../../types';
import MindMapSimulation from './MindMapSimulation';
import SideMenu from './overlays/SideMenu/SideMenu';
import GenIdeaPanel from './overlays/GenIdeaPanel';

const keyMap = {
  ADD_NODE: 'ctrl+enter',
  DELETE_NODE: 'del',
  EDIT_NODE_TEXT: 'enter',
  // Not Implemented
  GENERATE_IDEAS: 'ctrl+shift+enter',
  // Not Implemented
  TOGGLE_SIDE_MENU: 'ctrl+shift+s',
  // Not Implemented
  TOGGLE_SETTINGS: 'ctrl+shift+p',
  MOVE_SELECTION_TO_PARENT: ['up', '`'],
  MOVE_SELECTION_TO_CHILD: 'down',
  MOVE_SELECTION_TO_NEXT_SIBLING: ['right', 'tab'],
  MOVE_SELECTION_TO_PREVIOUS_SIBLING: ['left', 'shift+tab'],
  MOVE_SELECTION_TO_ROOT: ['0', 'ctrl+up'],
  RESET_VIEW: ['ctrl+0', 'home'],
};

const MindMap = () => {
  const { mindmapID } = useParams();

  const firestore = useFirestore();
  const mindMapRef = doc(firestore, `mindmaps/${mindmapID}`);
  const mindmap = useFirestoreDocData(mindMapRef).data as MindMapType;

  const addNode = ({ parent, text }: { parent: number; text: string }) => {
    const newID =
      mindmap.nodes.length > 0
        ? Math.max(...mindmap.nodes.map((o) => o.id), 0) + 1
        : 0;

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
    setSelectedNode(newNode);
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
    if (oldNode.id !== newNode.id) {
      console.warn(
        'Node ID changed, funny things might happen, so blocking update'
      );
      return;
    }
    batch.update(mindMapRef, {
      nodes: arrayRemove(stripInputNodeProperties(oldNode)),
    });
    if (newNode.id === 0) {
      batch.update(mindMapRef, {
        title: newNode.text,
        nodes: arrayUnion(stripInputNodeProperties(newNode)),
      });
    } else {
      batch.update(mindMapRef, {
        nodes: arrayUnion(stripInputNodeProperties(newNode)),
      });
    }
    batch.commit();
    if (selectedNode?.id === oldNode.id) {
      setSelectedNode(newNode);
    }
  };
  // const updateNodePrompt = (nodeToUpdate: node) => {
  //   // Create an MUI dialog box to update the node
  // };

  if (!mindmap) return <div>Sorry, I couldn&apos;t find that mindmap.</div>;

  const shortcutHandlers = {
    TOGGLE_SETTINGS: () => {
      // eslint-disable-next-line no-console
      console.log('Toggle Settings');
    },
    RESET_VIEW: () => {
      // eslint-disable-next-line no-console
      console.log('Reset View');
    },
  };

  // Create a sidebar active state
  const [sideMenuActive, setSideMenuActive] = useState(false);

  configure({
    ignoreEventsCondition: () => {
      // Ignore keypresses while side menu is open
      if (sideMenuActive) return true;
      return false;
    },
  });

  // Get the mindmap node with id 0, which is the root node
  const rootNode = mindmap.nodes.find((o) => o.id === 0);

  if (!rootNode) {
    throw new Error('Root node not found!');
  }

  const [selectedNode, setSelectedNode] = useState<SimulationNodeDatum & node>(
    rootNode
  );

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <GlobalHotKeys keyMap={keyMap} handlers={shortcutHandlers}>
        <MindMapSimulation
          data={mindmap}
          addNode={addNode}
          deleteNode={deleteNode}
          updateNode={updateNode}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
        />
        <SideMenu active={sideMenuActive} setActive={setSideMenuActive} />
        <GenIdeaPanel
          selectedNode={selectedNode}
          data={mindmap}
          addNode={addNode}
        />
      </GlobalHotKeys>
      {/* <FormDialog promptText="Hello world!" /> */}
    </div>
  );
};

export default MindMap;
