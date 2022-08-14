import React from 'react';
import { Button } from '@mui/material';
import { httpsCallable } from 'firebase/functions';
import { useFunctions } from 'reactfire';
import MindMap from '../../pages/MindMap';
import Navigation from '../Navigation';

const Routing = () => {
  const functions = useFunctions();
  const testAI = () => {
    // Call the function
    httpsCallable(
      functions,
      'ai'
    )({ data: 'trees' }).then((result) => {
      console.log(result);
    });
  };

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <Navigation />
      <Button
        variant="contained"
        onClick={() => {
          testAI();
        }}
      >
        Test AI!
      </Button>
      <MindMap />
    </div>
  );
};

export default Routing;
