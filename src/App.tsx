/* eslint-disable @typescript-eslint/ban-types */
import React, { Component } from 'react';

import CssBaseline from '@mui/material/CssBaseline';

import { ThemeContextProvider } from './contexts/MUITheme';
import { FirebaseUserProvider } from './firebase';

import Routing from './components/Routing';

// Have to use class because componentDidCatch is not supported in hooks
class ErrorBoundary extends Component {
  constructor(props: {}) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  componentDidCatch(error: any, errorInfo: any) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error,
      errorInfo,
    });

    console.error(error);
    console.error(errorInfo);
    // Log error messages to an error reporting service here
  }

  render() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error, errorInfo } = this.state as any;
    // eslint-disable-next-line react/prop-types, @typescript-eslint/no-explicit-any
    const { children } = this.props as any;

    if (errorInfo) {
      return (
        <div style={{ margin: '4rem' }}>
          <h1
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignContent: 'center',
            }}
          >
            Something went wrong.
          </h1>
          <br />
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignContent: 'center',
            }}
          >
            <details style={{ whiteSpace: 'pre-wrap', cursor: 'pointer' }}>
              <div style={{ cursor: 'auto' }}>
                <h3>{error && error.toString()}</h3>
                <br />
                {errorInfo.componentStack}
              </div>
            </details>
          </div>
          <br />

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignContent: 'center',
            }}
          >
            <a
              href="https://github.com/SpiritSeal/bubblemap/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              Think you found a bug? Please open a new issue in our GitHub Repo:
              https://github.com/SpiritSeal/bubblemap
            </a>
          </div>
        </div>
      );
    }
    return children;
  }
}

const App = () => (
  <ErrorBoundary>
    <ThemeContextProvider>
      <CssBaseline />
      <FirebaseUserProvider>
        <Routing />
      </FirebaseUserProvider>
    </ThemeContextProvider>
  </ErrorBoundary>
);

export default App;
