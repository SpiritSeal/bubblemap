import React from 'react';
import { useParams } from 'react-router-dom';
import MindMap from '../../pages/MindMap';

const MindMapRouter = () => {
  const { mindmapID } = useParams();
  return <MindMap mindmapID={mindmapID || ''} />;
};

export default MindMapRouter;
