import React from 'react';
import MindMap from './MindMap';
import { dataType } from './types';

function getData() {
  const data: dataType = {
    nodes: Array.from({ length: 10 }, (_, i) => ({
      text: `Text in bubble ${i}!`,
      id: i,
      parent: Math.floor(Math.random() * i),
      root: i === 0,
    })),
    links: [],
  };

  data.links = data.nodes.map((node, i) => ({
    source: node.parent,
    target: i,
  }));

  return data;
}

const App = () => {
  const data = getData();
  return (
    <div style={{ margin: 0, padding: 0 }}>
      <MindMap data={data} />
    </div>
  );
};

export default App;
