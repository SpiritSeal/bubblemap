import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ManageMindMaps = () => {
  const navigate = useNavigate();
  return (
    <div>
      <Button
        variant="contained"
        style={{ textTransform: 'none' }}
        onClick={() => {
          navigate(`test01`);
        }}
      >
        test01
      </Button>
      <Button
        variant="contained"
        style={{ textTransform: 'none' }}
        onClick={() => {
          navigate(`PxICnzGAskSEQXxkCIL4`);
        }}
      >
        PxICnzGAskSEQXxkCIL4
      </Button>
    </div>
  );
};

export default ManageMindMaps;
