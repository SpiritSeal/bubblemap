import React from 'react';
import { Backdrop, CircularProgress } from '@mui/material';

const Loading = () => (
  <Backdrop open aria-hidden="false" sx={{ zIndex: 10 }}>
    <CircularProgress color="primary" />
  </Backdrop>
);

export default Loading;
