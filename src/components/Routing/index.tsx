import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MindMap from '../../pages/MindMap';
import HomePage from '../../pages/HomePage';

// Create a new component which we can use to route pages
const Routing = () => (
  // /mindmap takes you to the mindmap page
  // / takes you to the homepage
  <Router>
    <Routes>
      <Route
        path="/mindmap"
        element={<MindMap mindmapID="PxICnzGAskSEQXxkCIL4" />}
      />
      <Route path="/" element={<HomePage />} />
    </Routes>
  </Router>
);
// const Routing = () => <MindMap mindmapID="PxICnzGAskSEQXxkCIL4" />;

export default Routing;
