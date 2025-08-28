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
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  getProducts,
  getOilBatches,
  addBatch,
  getPendingRetailRequests,
  updateRetailRequest,
  getInventory,
  updateInventory,
  generateBatchCode
} from '../services/firebase';

function BakeryDashboard() {
  const [products, setProducts] = useState([]);
  const [oilBatches, setOilBatches] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // Batch creation form state
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedOilBatches, setSelectedOilBatches] = useState([]);
  const [quantity, setQuantity] = useState('');
  const [batchCode, setBatchCode] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, oilBatchesData, requestsData, inventoryData] = await Promise.all([
        getProducts(),
        getOilBatches(),
        getPendingRetailRequests(),
        getInventory()
      ]);
      
      setProducts(productsData);
      setOilBatches(oilBatchesData);
      setPendingRequests(requestsData);
      setInventory(inventoryData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (event) => {
    const productId = event.target.value;
    setSelectedProduct(productId);
    
    if (productId) {
      const product = products.find(p => p.id === productId);
      if (product) {
        setBatchCode(generateBatchCode(product.code, '9999')); // Default oil batch number
      }
    }
  };

  const handleOilBatchAdd = () => {
    const newOilBatch = {
      oilBatchId: '',
      type: '',
      ratio: 100
    };
    setSelectedOilBatches([...selectedOilBatches, newOilBatch]);
  };

  const handleOilBatchChange = (index, field, value) => {
    const updatedOilBatches = [...selectedOilBatches];
    updatedOilBatches[index][field] = value;
    setSelectedOilBatches(updatedOilBatches);
  };

  const handleOilBatchRemove = (index) => {
    const updatedOilBatches = selectedOilBatches.filter((_, i) => i !== index);
    setSelectedOilBatches(updatedOilBatches);
  };

  const handleCreateBatch = async () => {
    try {
      const product = products.find(p => p.id === selectedProduct);
      if (!product) return;

      const batchData = {
        code: batchCode,
        productId: product.acronym,
        oils: selectedOilBatches,
        quantity: parseInt(quantity),
        remaining: parseInt(quantity)
      };

      await addBatch(batchData);

      // Update inventory
      const existingInventory = inventory.find(inv => inv.productId === product.acronym);
      if (existingInventory) {
        await updateInventory(existingInventory.id, {
          totalAvailable: existingInventory.totalAvailable + parseInt(quantity)
        });
      } else {
        await addInventory({
          productId: product.acronym,
          totalAvailable: parseInt(quantity)
        });
      }

      // Reset form
      setSelectedProduct('');
      setSelectedOilBatches([]);
      setQuantity('');
      setBatchCode('');
      
      // Reload data
      loadData();
    } catch (error) {
      console.error('Error creating batch:', error);
    }
  };

  const handleMarkFulfilled = async (requestId) => {
    try {
      await updateRetailRequest(requestId, { status: 'fulfilled' });
      loadData();
    } catch (error) {
      console.error('Error marking request as fulfilled:', error);
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
        Bakery Dashboard
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Create Batch" />
        <Tab label="Retail Requests" />
        <Tab label="Production Log" />
      </Tabs>

      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Create New Batch
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
                      <MenuItem key={product.id} value={product.id}>
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
                <Typography variant="subtitle1" gutterBottom>
                  Oil Batches
                </Typography>
                {selectedOilBatches.map((oilBatch, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>Oil Batch</InputLabel>
                          <Select
                            value={oilBatch.oilBatchId}
                            onChange={(e) => handleOilBatchChange(index, 'oilBatchId', e.target.value)}
                            label="Oil Batch"
                          >
                            {oilBatches.map((batch) => (
                              <MenuItem key={batch.id} value={batch.id}>
                                {batch.number} ({batch.type})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Ratio (%)"
                          type="number"
                          value={oilBatch.ratio}
                          onChange={(e) => handleOilBatchChange(index, 'ratio', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleOilBatchRemove(index)}
                        >
                          Remove
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                <Button variant="outlined" onClick={handleOilBatchAdd}>
                  Add Oil Batch
                </Button>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Batch Code"
                  value={batchCode}
                  onChange={(e) => setBatchCode(e.target.value)}
                  helperText="Auto-generated batch code"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreateBatch}
                  disabled={!selectedProduct || !quantity || selectedOilBatches.length === 0}
                >
                  Create Batch
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
              Pending Retail Requests
            </Typography>
            
            {pendingRequests.length === 0 ? (
              <Alert severity="info">No pending requests</Alert>
            ) : (
              <List>
                {pendingRequests.map((request) => (
                  <React.Fragment key={request.id}>
                    <ListItem>
                      <ListItemText
                        primary={`${request.productId} - ${request.quantity} units`}
                        secondary={`Requested by: ${request.requestedBy} | Date: ${new Date(request.createdAt?.toDate()).toLocaleDateString()}`}
                      />
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleMarkFulfilled(request.id)}
                      >
                        Mark Fulfilled
                      </Button>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Today's Production Log
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Production log functionality will be implemented here.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default BakeryDashboard;
