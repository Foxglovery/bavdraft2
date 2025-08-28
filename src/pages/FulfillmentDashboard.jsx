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
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  getProducts,
  getBatchesByProduct,
  getInventory,
  updateInventory,
  addFulfillmentLog,
  getFulfillmentLogsByDate
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

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      loadProductBatches();
    }
  }, [selectedProduct]);

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

  const loadProductBatches = async () => {
    try {
      const batches = await getBatchesByProduct(selectedProduct);
      // Sort by creation date (oldest first) and take last 3
      const sortedBatches = batches
        .sort((a, b) => a.createdAt?.toDate() - b.createdAt?.toDate())
        .slice(-3);
      setProductBatches(sortedBatches);
    } catch (error) {
      console.error('Error loading product batches:', error);
    }
  };

  const handleProductChange = (event) => {
    setSelectedProduct(event.target.value);
    setSelectedBatch('');
    setProductBatches([]);
  };

  const handleBatchChange = (event) => {
    setSelectedBatch(event.target.value);
  };

  const handlePackagingAction = async () => {
    const action = {
      id: Date.now(),
      productId: selectedProduct,
      batchId: selectedBatch,
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
      // Update inventory
      const productInventory = inventory.find(inv => inv.productId === action.productId);
      if (productInventory) {
        await updateInventory(productInventory.id, {
          totalAvailable: productInventory.totalAvailable - action.quantity
        });
      }

      // Add to fulfillment log
      await addFulfillmentLog({
        date: new Date().toISOString().split('T')[0],
        actions: [{
          productId: action.productId,
          batchId: action.batchId,
          quantity: action.quantity,
          userId: 'fulfillmentUser1' // This should come from auth context
        }]
      });

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
      <Typography variant="h4" component="h1" gutterBottom>
        Fulfillment Dashboard
      </Typography>

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
                          <MenuItem key={product.id} value={product.acronym}>
                            {product.name} ({product.acronym})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {selectedProduct && (
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Batch (Last 3 - Oldest First)</InputLabel>
                        <Select
                          value={selectedBatch}
                          onChange={handleBatchChange}
                          label="Batch (Last 3 - Oldest First)"
                        >
                          {productBatches.map((batch) => (
                            <MenuItem key={batch.id} value={batch.code}>
                              {batch.code} (Remaining: {batch.remaining})
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
                                primary={`${action.productId} - ${action.quantity} units`}
                                secondary={`Batch: ${action.batchId} | Time: ${action.timestamp.toLocaleTimeString()}`}
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
                  {inventory.map((item) => (
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
                                • {action.productId} - {action.quantity} units (Batch: {action.batchId})
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
