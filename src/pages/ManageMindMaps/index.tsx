import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ManageMindMaps = () => {
  const navigate = useNavigate();
  return (
    <div>
      <Button
        onClick={() => {
          navigate('/');
        }}
      >
        <h1>Home</h1>
      </Button>
      <Button
        variant="contained"
        style={{ textTransform: 'none' }}
        onClick={() => {
          navigate(`${process.env.REACT_APP_MINDMAP_URL}/test01`);
        }}
      >
        test01
      </Button>
      <Button
        variant="contained"
        style={{ textTransform: 'none' }}
        onClick={() => {
          navigate(`${process.env.REACT_APP_MINDMAP_URL}/PxICnzGAskSEQXxkCIL4`);
        }}
      >
        PxICnzGAskSEQXxkCIL4
      </Button>
    </div>
  );
};

export default ManageMindMaps;
