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
import CreateAccount from '../../pages/CreateAccount';
import Navigation from '../Navigation';

const Routing = () => {
  const signinCheck = useSigninCheck().data;

  return (
    <Router>
      <Routes>
        <Route path="/">
          <Route
            index
            element={
              <>
                <Navigation />
                <Home />
              </>
            }
          />
          <Route
            path="about"
            element={
              <>
                <Navigation />
                <About />
              </>
            }
          />
          {!signinCheck.signedIn && (
            <>
              <Route
                path="signin"
                element={
                  <>
                    <Navigation />
                    <SignIn />
                  </>
                }
              />
              <Route
                path="createaccount"
                element={
                  <>
                    <Navigation />
                    <CreateAccount />
                  </>
                }
              />
            </>
          )}
          <Route path="/mindmaps">
            <Route
              index
              element={
                <>
                  <Navigation />
                  <ManageMindMaps />
                </>
              }
            />
            <Route path=":mindmapID" element={<MindMap />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default Routing;
