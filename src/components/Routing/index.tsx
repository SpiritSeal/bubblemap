import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../../pages/HomePage';
import ManageMindMaps from '../../pages/ManageMindMaps';
import MindMapRouter from './mindmapRouter';

const Routing = () => (
  <Router>
    <Routes>
      <Route path="/">
        <Route index element={<HomePage />} />
        <Route path="/mindmap">
          <Route index element={<ManageMindMaps />} />
          <Route path=":mindmapID" element={<MindMapRouter />} />
        </Route>
      </Route>
    </Routes>
  </Router>
);

export default Routing;
