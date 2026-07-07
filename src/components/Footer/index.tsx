import React from 'react';
import { Box, Container, Divider, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// Shown on the marketing/account routes alongside <Navigation />; the map
// canvas route deliberately omits both to stay chrome-free.
const Footer = () => (
  <Box component="footer" sx={{ py: 3, mt: 6 }}>
    <Container maxWidth="md">
      <Divider sx={{ mb: 2 }} />
      <Typography variant="body2" color="text.secondary" align="center">
        <Link component={RouterLink} to="/privacy" color="inherit">
          Privacy Policy
        </Link>
        {' · '}
        <Link
          href="https://github.com/SpiritSeal/bubblemap"
          color="inherit"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </Link>
        {' · '}
        <Link href="mailto:support@bubblemap.app" color="inherit">
          Contact
        </Link>
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        <Link
          href="https://www.congressionalappchallenge.us/22-AZ06/"
          color="inherit"
          target="_blank"
          rel="noopener noreferrer"
        >
          Winner of the 2022 Congressional App Challenge (AZ-06)
        </Link>
      </Typography>
    </Container>
  </Box>
);

export default Footer;
