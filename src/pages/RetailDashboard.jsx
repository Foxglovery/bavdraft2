import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import {
  getProducts,
  addRetailRequest,
  getRetailRequests
} from '../services/firebase';

function RetailDashboard() {
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, requestsData] = await Promise.all([
        getProducts(),
        getRetailRequests()
      ]);
      
      setProducts(productsData);
      setRequests(requestsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (event) => {
    setSelectedProduct(event.target.value);
  };

  const handleSubmitRequest = async () => {
    try {
      const requestData = {
        requestedBy: 'retailUser1', // This should come from auth context
        productId: selectedProduct,
        quantity: parseInt(quantity),
        status: 'pending'
      };

      await addRetailRequest(requestData);

      // Reset form
      setSelectedProduct('');
      setQuantity('');

      // Reload requests
      const updatedRequests = await getRetailRequests();
      setRequests(updatedRequests);
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'fulfilled':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Retail Dashboard
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Request Product" />
        <Tab label="Request History" />
      </Tabs>

      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Request Product
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Product</InputLabel>
                  <Select
                    value={selectedProduct}
                    onChange={handleProductChange}
                    label="Product"
                  >
                    {products.map((product) => (
                      <MenuItem key={product.id} value={product.acronym}>
                        {product.name} ({product.acronym})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitRequest}
                  disabled={!selectedProduct || !quantity}
                >
                  Submit Request
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Request History
            </Typography>
            
            {requests.length === 0 ? (
              <Alert severity="info">No requests found</Alert>
            ) : (
              <List>
                {requests.map((request) => (
                  <React.Fragment key={request.id}>
                    <ListItem>
                      <ListItemText
                        primary={`${request.productId} - ${request.quantity} units`}
                        secondary={`Requested by: ${request.requestedBy} | Date: ${new Date(request.createdAt?.toDate()).toLocaleDateString()}`}
                      />
                      <Chip
                        label={request.status}
                        color={getStatusColor(request.status)}
                        variant="outlined"
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default RetailDashboard;
