import React, { useState, useEffect, useCallback } from 'react';
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
  Chip,
  Switch,
  FormControlLabel,
  IconButton
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import {
  getProducts,
  getRecentBatchesByProduct,
  getInventory,
  updateInventory,
  addInventory,
  addFulfillmentLog,
  getFulfillmentLogsByDate,
  decrementBatchRemaining
} from '../services/firebase';

function FulfillmentDashboard() {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productBatches, setProductBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [instantSubmit, setInstantSubmit] = useState(true);
  const [pendingActions, setPendingActions] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);

  const loadData = async () => {
    try {
      const [productsData, inventoryData, logsData] = await Promise.all([
        getProducts(),
        getInventory(),
        getFulfillmentLogsByDate(new Date().toISOString().split('T')[0])
      ]);
      
      setProducts(productsData);
      setInventory(inventoryData);
      setTodayLogs(logsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProductBatches = useCallback(async () => {
    try {
      console.log('Loading batches for product:', selectedProduct);
      const batches = await getRecentBatchesByProduct(selectedProduct, 4);
      console.log('Loaded batches:', batches);
      setProductBatches(batches);
    } catch (error) {
      console.error('Error loading product batches:', error);
    }
  }, [selectedProduct]);

  useEffect(() => {
    loadData();
  }, []);

  // Force reload data when component mounts to clear any cached data
  useEffect(() => {
    const handleFocus = () => {
      loadData();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      loadProductBatches();
    }
  }, [selectedProduct, loadProductBatches]);

  const handleProductChange = (event) => {
    const productId = event.target.value;
    setSelectedProduct(productId);
    setSelectedBatch('');
    setProductBatches([]);
    // Clear any cached data
    loadData();
  };

  const handleBatchChange = (event) => {
    setSelectedBatch(event.target.value);
  };

  const handlePackagingAction = async () => {
    const selectedBatchData = productBatches.find(b => b.id === selectedBatch);
    const leftNow = Number(selectedBatchData?.remainingQuantity ?? selectedBatchData?.quantityProduced ?? 0);
    if (Number(quantity) > leftNow) {
      alert('Quantity exceeds what is left in this batch.');
      return;
    }
    if (selectedBatchData && Number(quantity) > Number(selectedBatchData.remainingQuantity ?? selectedBatchData.quantityProduced ?? 0)) {
      alert('Quantity exceeds what is left in this batch.');
      return;
    }
    const action = {
      id: Date.now(),
      productId: selectedProduct, // Keep full path for logging
      productAcronym: selectedBatchData?.productAcronym || '', // Use acronym for inventory lookup
      batchId: selectedBatch,
      batchCode: selectedBatchData?.batchCode || '',
      quantity: parseInt(quantity),
      timestamp: new Date()
    };

    if (instantSubmit) {
      await submitAction(action);
    } else {
      setPendingActions([...pendingActions, action]);
    }

    // Reset form
    setSelectedBatch('');
    setQuantity('');
  };

  const submitAction = async (action) => {
    try {
      // Use the product acronym from the batch data
      const productAcronym = action.productAcronym;
      console.log('Looking for inventory with productAcronym:', productAcronym);
      console.log('Current inventory array:', inventory);
      
      // Update inventory
      const productInventory = inventory.find(inv => inv.productId === productAcronym);
      console.log('Found inventory:', productInventory);
      
      if (productInventory) {
        const newTotal = productInventory.totalAvailable - action.quantity;
        console.log(`Updating inventory: ${productInventory.totalAvailable} - ${action.quantity} = ${newTotal}`);
        await updateInventory(productInventory.id, {
          totalAvailable: newTotal
        });
      } else {
        console.log('No inventory found for product:', productAcronym);
        console.log('Available inventory productIds:', inventory.map(inv => inv.productId));
        // Create new inventory entry if it doesn't exist
        await addInventory({
          productId: productAcronym,
          totalAvailable: -action.quantity // Negative because we're fulfilling
        });
      }

      // Add to fulfillment log
      await addFulfillmentLog({
        date: new Date().toISOString().split('T')[0],
        actions: [{
          productId: action.productId,
          productAcronym: action.productAcronym,
          batchId: action.batchId,
          batchCode: action.batchCode,
          quantity: action.quantity,
          userId: 'fulfillmentUser1' // This should come from auth context
        }]
      });

      // Decrement remaining quantity in batch
      await decrementBatchRemaining(action.batchId, action.quantity);

       // Optimistic local update so UI reflects immediately
 setProductBatches(prev =>
   prev.map(b =>
         b.id === action.batchId
            ? {
                ...b,
                remainingQuantity: Math.max(
                  0,
                  (Number(b.remainingQuantity ?? b.quantityProduced ?? 0) -
                    Number(action.quantity || 0))
                ),
              }
            : b
        )
      );

      // Then refetch from Firestore so we show the authoritative value
      await loadProductBatches();
      // Reload data
      loadData();
    } catch (error) {
      console.error('Error submitting action:', error);
    }
  };

  const handleSubmitDay = async () => {
    try {
      for (const action of pendingActions) {
        await submitAction(action);
      }
      setPendingActions([]);
    } catch (error) {
      console.error('Error submitting day:', error);
    }
  };

  const removePendingAction = (actionId) => {
    setPendingActions(pendingActions.filter(action => action.id !== actionId));
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1">
          Fulfillment Dashboard
        </Typography>
        <IconButton onClick={loadData} color="primary" title="Refresh Data">
          <Refresh />
        </IconButton>
      </Box>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Packaging Actions" />
        <Tab label="Today's Log" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Packaging Actions
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={instantSubmit}
                      onChange={(e) => setInstantSubmit(e.target.checked)}
                    />
                  }
                  label="Instant Submit"
                  sx={{ mb: 2 }}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Product</InputLabel>
                      <Select
                        value={selectedProduct}
                        onChange={handleProductChange}
                        label="Product"
                      >
                        {products.map((product) => (
                          <MenuItem key={product.id} value={`/products/${product.id}`}>
                            {product.name} ({product.acronym})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {selectedProduct && (
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Batch (Last 4 - Newest First)</InputLabel>
                        <Select
                          value={selectedBatch}
                          onChange={handleBatchChange}
                          label="Batch (Last 4 - Newest First)"
                        >
                          {productBatches.map((batch) => (
                            <MenuItem key={batch.id} value={batch.id}>
                              {batch.batchCode} — {(batch.remainingQuantity ?? batch.quantityProduced)} left ({batch.dateStr})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  <Grid item xs={12}>
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
                      onClick={handlePackagingAction}
                      disabled={!selectedProduct || !selectedBatch || !quantity}
                      fullWidth
                    >
                      {instantSubmit ? 'Submit Action' : 'Add to Pending'}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {!instantSubmit && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Pending Actions
                  </Typography>
                  
                  {pendingActions.length === 0 ? (
                    <Alert severity="info">No pending actions</Alert>
                  ) : (
                    <Box>
                      <List>
                        {pendingActions.map((action) => (
                          <React.Fragment key={action.id}>
                            <ListItem>
                              <ListItemText
                                primary={`${action.productAcronym} - ${action.quantity} units`}
                                secondary={`Batch: ${action.batchCode} | Time: ${action.timestamp.toLocaleTimeString()}`}
                              />
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => removePendingAction(action.id)}
                              >
                                Remove
                              </Button>
                            </ListItem>
                            <Divider />
                          </React.Fragment>
                        ))}
                      </List>
                      
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleSubmitDay}
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        Submit Day
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Inventory
                </Typography>
                <Grid container spacing={2}>
                  {inventory
                    .filter(item => item.productId && item.productId.length <= 10) // Filter out document IDs
                    .map((item) => (
                    <Grid item xs={12} sm={6} md={3} key={item.id}>
                      <Chip
                        label={`${item.productId}: ${item.totalAvailable}`}
                        color="primary"
                        variant="outlined"
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Today's Fulfillment Log
            </Typography>
            
            {todayLogs.length === 0 ? (
              <Alert severity="info">No fulfillment logs for today</Alert>
            ) : (
              <List>
                {todayLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <ListItem>
                      <ListItemText
                        primary={`Date: ${log.date}`}
                        secondary={
                          <Box>
                            {log.actions?.map((action, index) => (
                              <Typography key={index} variant="body2">
                                • {action.productAcronym || action.productId} - {action.quantity} units (Batch: {action.batchCode})
                              </Typography>
                            ))}
                          </Box>
                        }
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

export default FulfillmentDashboard;
