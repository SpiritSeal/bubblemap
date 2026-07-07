import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useSigninCheck } from '../../firebase';

import Home from '../../pages/Home';
import About from '../../pages/About';
import ManageMindMaps from '../../pages/ManageMindMaps';
import SignIn from '../../pages/SignIn';
import MindMap from '../../pages/MindMap';
import CreateAccount from '../../pages/CreateAccount';
import PrivacyPolicy from '../../pages/PrivacyPolicy';
import Navigation from '../Navigation';
import Footer from '../Footer';
import Account from '../../pages/Account';
import ClaimAccount from '../ClaimAccount';
import AnonymousAuth from './AnonymousAuth';

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
                {signinCheck.signedIn && <ClaimAccount />}
                <Footer />
              </>
            }
          />
          <Route
            path="about"
            element={
              <>
                <Navigation />
                <About />
                {signinCheck.signedIn && <ClaimAccount />}
                <Footer />
              </>
            }
          />
          <Route
            path="privacy"
            element={
              <>
                <Navigation />
                <PrivacyPolicy />
                <Footer />
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
                    <Footer />
                  </>
                }
              />
              <Route
                path="createaccount"
                element={
                  <>
                    <Navigation />
                    <CreateAccount />
                    <Footer />
                  </>
                }
              />
            </>
          )}
          <Route
            path="account"
            element={
              <AnonymousAuth>
                <Navigation />
                <Account />
                {signinCheck.signedIn && <ClaimAccount />}
                <Footer />
              </AnonymousAuth>
            }
          />
          <Route path="/mindmaps">
            <Route
              index
              element={
                <AnonymousAuth>
                  <Navigation />
                  <ManageMindMaps />
                  {signinCheck.signedIn && <ClaimAccount />}
                  <Footer />
                </AnonymousAuth>
              }
            />
            <Route
              path=":mindmapID"
              element={
                <AnonymousAuth>
                  <MindMap />
                  {signinCheck.signedIn && (
                    <ClaimAccount
                      location={{
                        horizontal: 'center',
                        vertical: 'top',
                      }}
                    />
                  )}
                </AnonymousAuth>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default Routing;
