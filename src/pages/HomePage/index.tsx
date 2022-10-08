import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
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
      <Button
        variant="contained"
        style={{ textTransform: 'none' }}
        onClick={() => {
          navigate('/mindmap');
        }}
      >
        Go to Mindmap Selector
      </Button>
      <h1>Home Page</h1>
    </div>
  );
};

export default HomePage;
