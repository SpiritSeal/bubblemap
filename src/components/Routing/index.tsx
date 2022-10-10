import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useSigninCheck } from 'reactfire';

import Home from '../../pages/Home';
import About from '../../pages/About';
import ManageMindMaps from '../../pages/ManageMindMaps';
import SignIn from '../../pages/SignIn';
import MindMap from '../../pages/MindMap';

const Routing = () => {
  const signinCheck = useSigninCheck().data;

  return (
    <Router>
      <Routes>
        <Route path="/">
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          {!signinCheck.signedIn && (
            <Route path="signin" element={<SignIn />} />
          )}
          <Route path="/mindmap">
            <Route index element={<ManageMindMaps />} />
            <Route path=":mindmapID" element={<MindMap />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default Routing;
