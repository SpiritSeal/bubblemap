import React from 'react';
import { Box, Button, ButtonGroup, Paper } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ManageMindMaps = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <Paper
      sx={{
        marginTop: {
          xs: '.5rem',
          sm: '.5rem',
          md: '1rem',
          lg: '2rem',
          xl: '4rem',
        },
        marginLeft: {
          xs: '1rem',
          sm: '2rem',
          md: '10rem',
          lg: '20rem',
          xl: '30rem',
        },
        marginRight: {
          xs: '1rem',
          sm: '2rem',
          md: '10rem',
          lg: '20rem',
          xl: '30rem',
        },
        padding: {
          xs: '1rem',
          sm: '1rem',
          md: '1rem',
          lg: '2rem',
          xl: '3rem',
        },
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1>MindMaps</h1>
        <ButtonGroup variant="outlined">
          <Button
            disabled={searchParams.get('filter') === null}
            onClick={() => {
              searchParams.delete('filter');
              setSearchParams(searchParams);
            }}
          >
            All MindMaps
          </Button>
          <Button
            disabled={searchParams.get('filter') === 'owned'}
            onClick={() => {
              searchParams.set('filter', 'owned');
              setSearchParams(searchParams);
            }}
          >
            Your MindMaps
          </Button>
          <Button
            disabled={searchParams.get('filter') === 'shared'}
            onClick={() => {
              searchParams.set('filter', 'shared');
              setSearchParams(searchParams);
            }}
          >
            Shared With You
          </Button>
        </ButtonGroup>
      </div>
    </Paper>
  );
};

export default ManageMindMaps;
