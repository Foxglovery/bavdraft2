import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button, Container, CircularProgress } from '@mui/material';
import { onAuthChange, signOutUser } from './services/firebase';
import LoginPage from './pages/LoginPage';
import Navigation from './components/Navigation';
import BakeryDashboard from './pages/BakeryDashboard';
import FulfillmentDashboard from './pages/FulfillmentDashboard';
import RetailDashboard from './pages/RetailDashboard';
import AdminDashboard from './pages/AdminDashboard';
import InventoryPage from './pages/InventoryPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOutUser();
      // The onAuthChange listener will handle updating the user state
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              BAVdraft2
            </Typography>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user.email}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="xl" sx={{ mt: 3 }}>
          <Navigation />
          <Routes>
            <Route path="/bakery" element={<BakeryDashboard />} />
            <Route path="/fulfillment" element={<FulfillmentDashboard />} />
            <Route path="/retail" element={<RetailDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/" element={<Navigate to="/bakery" replace />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

export default App;
