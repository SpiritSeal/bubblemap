import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSigninCheck } from 'reactfire';

const HomePage = () => {
  const navigate = useNavigate();
  const signinCheck = useSigninCheck().data;
  return (
    <div>
      <Button
        variant="contained"
        style={{ textTransform: 'none' }}
        onClick={() => {
          navigate('/about');
        }}
      >
        About
      </Button>
      {signinCheck.signedIn && (
        <Button
          variant="contained"
          style={{ textTransform: 'none' }}
          onClick={() => {
            navigate('/mindmap');
          }}
        >
          Go to Mindmap Selector
        </Button>
      )}
      {!signinCheck.signedIn && (
        <Button
          variant="contained"
          style={{ textTransform: 'none' }}
          onClick={() => {
            navigate('/signin');
          }}
        >
          Sign In
        </Button>
      )}
      <h1>Home Page</h1>
    </div>
  );
};

export default HomePage;
