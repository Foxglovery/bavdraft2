import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, ButtonGroup } from '@mui/material';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  return (
    <Box sx={{ mb: 3 }}>
      <ButtonGroup variant="outlined" size="large" fullWidth>
        <Button
          onClick={() => navigate('/bakery')}
          variant={isActive('/bakery') ? 'contained' : 'outlined'}
        >
          Bakery
        </Button>
        <Button
          onClick={() => navigate('/fulfillment')}
          variant={isActive('/fulfillment') ? 'contained' : 'outlined'}
        >
          Fulfillment
        </Button>
        <Button
          onClick={() => navigate('/retail')}
          variant={isActive('/retail') ? 'contained' : 'outlined'}
        >
          Retail
        </Button>
        <Button
          onClick={() => navigate('/admin')}
          variant={isActive('/admin') ? 'contained' : 'outlined'}
        >
          Admin
        </Button>
        <Button
          onClick={() => navigate('/inventory')}
          variant={isActive('/inventory') ? 'contained' : 'outlined'}
        >
          Inventory
        </Button>
      </ButtonGroup>
    </Box>
  );
}

export default Navigation;
