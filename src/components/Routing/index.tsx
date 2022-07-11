import { Button } from '@mui/material';
import { httpsCallable } from 'firebase/functions';
import React from 'react';
import { useFunctions } from 'reactfire';
import MindMap from '../../MindMap';
import { dataType } from '../../types';

// function getData() {
//   const data: dataType = {
//     nodes: Array.from({ length: 10 }, (_, i) => ({
//       text: `Text in bubble ${i}!`,
//       id: i,
//       parent: Math.floor(Math.random() * i),
//       root: i === 0,
//     })),
//     links: [],
//   };

//   data.links = data.nodes.map((node, i) => ({
//     source: node.parent,
//     target: i,
//   }));

//   return data;
// }

const data = {
  nodes: [
    {
      text: 'Text in bubble 0!',
      id: 0,
      parent: 0,
      root: true,
    },
    {
      text: 'Text in bubble 1!',
      id: 1,
      parent: 0,
      root: false,
    },
    {
      text: 'Text in bubble 2!',
      id: 2,
      parent: 1,
      root: false,
    },
    {
      text: 'Text in bubble 3!',
      id: 3,
      parent: 0,
      root: false,
    },
    {
      text: 'Text in bubble 4!',
      id: 4,
      parent: 3,
      root: false,
    },
    {
      text: 'Text in bubble 5!',
      id: 5,
      parent: 0,
      root: false,
    },
    {
      text: 'Text in bubble 6!',
      id: 6,
      parent: 2,
      root: false,
    },
    {
      text: 'Text in bubble 7!',
      id: 7,
      parent: 1,
      root: false,
    },
    {
      text: 'Text in bubble 8!',
      id: 8,
      parent: 4,
      root: false,
    },
    {
      text: 'Text in bubble 9!',
      id: 9,
      parent: 3,
      root: false,
    },
  ],
  links: [
    {
      source: 0,
      target: 0,
    },
    {
      source: 0,
      target: 1,
    },
    {
      source: 1,
      target: 2,
    },
    {
      source: 0,
      target: 3,
    },
    {
      source: 3,
      target: 4,
    },
    {
      source: 0,
      target: 5,
    },
    {
      source: 2,
      target: 6,
    },
    {
      source: 1,
      target: 7,
    },
    {
      source: 4,
      target: 8,
    },
    {
      source: 3,
      target: 9,
    },
  ],
};

const Routing = () => {
  const functions = useFunctions();
  const testAI = () => {
    // Call the function
    httpsCallable(
      functions,
      'ai'
    )({ data: 'yes' }).then((result) => {
      console.log(result);
    });
  };

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <Button
        variant="contained"
        onClick={() => {
          testAI();
        }}
      >
        Test AI!
      </Button>
      <MindMap data={data} />
    </div>
  );
};

export default Routing;
