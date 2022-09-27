import React from 'react';
import { Button } from '@mui/material';
import { httpsCallable } from 'firebase/functions';
import { useFunctions } from 'reactfire';
import MindMap from '../../pages/MindMap';
import TemporaryDrawer from './TemporaryDrawer';

const Routing = () => {
  const functions = useFunctions();
  const testAI = () => {
    // Call the function
    httpsCallable(
      functions,
      'ai'
    )({ data: 'red tomatoes' }).then((result) => {
      // eslint-disable-next-line no-console
      console.log(result);
    });
  };

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <MindMap />
      <TemporaryDrawer />
      <Button
        variant="contained"
        onClick={() => {
          testAI();
        }}
      >
        Test AI!
      </Button>
    </div>
  );
};

export default Routing;
