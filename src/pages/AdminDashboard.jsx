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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getOilBatches,
  addOilBatch,
  updateOilBatch,
  deleteOilBatch,
  getInventory,
  updateInventory,
  getRetailRequests,
  getFulfillmentLogs
} from '../services/firebase';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [oilBatches, setOilBatches] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [fulfillmentLogs, setFulfillmentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // User management state
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ email: '', role: 'bakery' });

  // Product management state
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', acronym: '', code: '', unit: 'pcs' });

  // Oil batch management state
  const [oilBatchDialogOpen, setOilBatchDialogOpen] = useState(false);
  const [editingOilBatch, setEditingOilBatch] = useState(null);
  const [oilBatchForm, setOilBatchForm] = useState({
    oilBatchCode: '',
    type: '',
    amountGrams: '',
    potencyPercent: '',
    remainingGrams: '',
    dateRecieved: new Date().toISOString().slice(0, 10)
  });

  // Inventory adjustment state
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [inventoryAdjustment, setInventoryAdjustment] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [
        usersData,
        productsData,
        oilBatchesData,
        inventoryData,
        requestsData,
        logsData
      ] = await Promise.all([
        getUsers(),
        getProducts(),
        getOilBatches(),
        getInventory(),
        getRetailRequests(),
        getFulfillmentLogs()
      ]);
      
      setUsers(usersData);
      setProducts(productsData);
      setOilBatches(oilBatchesData);
      setInventory(inventoryData);
      setRequests(requestsData);
      setFulfillmentLogs(logsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // User management functions
  const handleUserSubmit = async () => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, userForm);
      } else {
        await addUser(userForm);
      }
      setUserDialogOpen(false);
      setEditingUser(null);
      setUserForm({ email: '', role: 'bakery' });
      loadData();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleUserEdit = (user) => {
    setEditingUser(user);
    setUserForm({ email: user.email, role: user.role });
    setUserDialogOpen(true);
  };

  const handleUserDelete = async (userId) => {
    try {
      await deleteUser(userId);
      loadData();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Product management functions
  const handleProductSubmit = async () => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productForm);
      } else {
        await addProduct(productForm);
      }
      setProductDialogOpen(false);
      setEditingProduct(null);
      setProductForm({ name: '', acronym: '', code: '', unit: 'pcs' });
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleProductEdit = (product) => {
    setEditingProduct(product);
    setProductForm({ name: product.name, acronym: product.acronym, code: product.code, unit: product.unit });
    setProductDialogOpen(true);
  };

  const handleProductDelete = async (productId) => {
    try {
      await deleteProduct(productId);
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // Oil batch management functions
  const [oilBatchErrors, setOilBatchErrors] = useState({});

  const validateOilBatch = (values) => {
    const errs = {};
    if (!values.oilBatchCode) errs.oilBatchCode = 'Required';
    if (!values.type) errs.type = 'Required';
    if (values.amountGrams === '' || Number(values.amountGrams) <= 0) errs.amountGrams = 'Must be > 0';
    if (values.potencyPercent === '' || Number(values.potencyPercent) <= 0) errs.potencyPercent = 'Must be > 0';
    if (values.remainingGrams === '' || Number(values.remainingGrams) < 0) errs.remainingGrams = 'Must be ≥ 0';
    if (!values.dateRecieved) errs.dateRecieved = 'Required';
    return errs;
  };

  const handleOilBatchSubmit = async () => {
    try {
      const errs = validateOilBatch(oilBatchForm);
      setOilBatchErrors(errs);
      if (Object.keys(errs).length > 0) return;

      const payload = {
        oilBatchCode: oilBatchForm.oilBatchCode,
        type: oilBatchForm.type,
        amountGrams: Number(oilBatchForm.amountGrams),
        potencyPercent: Number(oilBatchForm.potencyPercent),
        remainingGrams: Number(oilBatchForm.remainingGrams),
        dateRecieved: new Date(oilBatchForm.dateRecieved)
      };

      if (editingOilBatch) {
        await updateOilBatch(editingOilBatch.id, payload);
      } else {
        await addOilBatch(payload);
      }
      setOilBatchDialogOpen(false);
      setEditingOilBatch(null);
      setOilBatchForm({
        oilBatchCode: '',
        type: '',
        amountGrams: '',
        potencyPercent: '',
        remainingGrams: '',
        dateRecieved: new Date().toISOString().slice(0, 10)
      });
      setOilBatchErrors({});
      loadData();
    } catch (error) {
      console.error('Error saving oil batch:', error);
    }
  };

  const handleOilBatchDelete = async (oilBatchId) => {
    try {
      await deleteOilBatch(oilBatchId);
      loadData();
    } catch (error) {
      console.error('Error deleting oil batch:', error);
    }
  };

  // Inventory adjustment functions
  const handleInventoryAdjustment = async () => {
    try {
      await updateInventory(selectedInventory.id, {
        totalAvailable: parseInt(inventoryAdjustment)
      });
      setInventoryDialogOpen(false);
      setSelectedInventory(null);
      setInventoryAdjustment('');
      loadData();
    } catch (error) {
      console.error('Error adjusting inventory:', error);
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
        Admin Dashboard
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="User Management" />
        <Tab label="Product Management" />
        <Tab label="Oil Batch Management" />
        <Tab label="Reports" />
      </Tabs>

      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">User Management</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setEditingUser(null);
                  setUserForm({ email: '', role: 'bakery' });
                  setUserDialogOpen(true);
                }}
              >
                Add User
              </Button>
            </Box>
            
            <List>
              {users.map((user) => (
                <React.Fragment key={user.id}>
                  <ListItem>
                    <ListItemText
                      primary={user.email}
                      secondary={`Role: ${user.role}`}
                    />
                    <IconButton onClick={() => handleUserEdit(user)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleUserDelete(user.id)} color="error">
                      <Delete />
                    </IconButton>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Product Management</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({ name: '', acronym: '', code: '', unit: 'pcs' });
                  setProductDialogOpen(true);
                }}
              >
                Add Product
              </Button>
            </Box>
            
            <List>
              {products.map((product) => (
                <React.Fragment key={product.id}>
                  <ListItem>
                    <ListItemText
                      primary={`${product.name} (${product.acronym})`}
                      secondary={`Code: ${product.code} | Unit: ${product.unit}`}
                    />
                    <IconButton onClick={() => handleProductEdit(product)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleProductDelete(product.id)} color="error">
                      <Delete />
                    </IconButton>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Oil Batch Management</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setEditingOilBatch(null);
                  setOilBatchForm({
                    oilBatchCode: '',
                    type: '',
                    amountGrams: '',
                    potencyPercent: '',
                    remainingGrams: '',
                    dateRecieved: new Date().toISOString().slice(0, 10)
                  });
                  setOilBatchErrors({});
                  setOilBatchDialogOpen(true);
                }}
              >
                Add Oil Batch
              </Button>
            </Box>
            
            <List>
              {oilBatches.map((batch) => (
                <React.Fragment key={batch.id}>
                  <ListItem>
                    <ListItemText
                      primary={`${batch.oilBatchCode} (${batch.type})`}
                      secondary={`Amount: ${batch.amountGrams}g • Remaining: ${batch.remainingGrams}g • Potency: ${batch.potencyPercent}% • Received: ${batch.dateRecieved ? new Date(batch.dateRecieved?.toDate ? batch.dateRecieved.toDate() : batch.dateRecieved).toLocaleDateString() : '—'}`}
                    />
                    <IconButton onClick={() => {
                      setEditingOilBatch(batch);
                      setOilBatchForm({
                        oilBatchCode: batch.oilBatchCode || '',
                        type: batch.type || '',
                        amountGrams: String(batch.amountGrams ?? ''),
                        potencyPercent: String(batch.potencyPercent ?? ''),
                        remainingGrams: String(batch.remainingGrams ?? ''),
                        dateRecieved: batch.dateRecieved ? new Date(batch.dateRecieved?.toDate ? batch.dateRecieved.toDate() : batch.dateRecieved).toISOString().slice(0,10) : new Date().toISOString().slice(0,10)
                      });
                      setOilBatchErrors({});
                      setOilBatchDialogOpen(true);
                    }}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleOilBatchDelete(batch.id)} color="error">
                      <Delete />
                    </IconButton>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Inventory
                </Typography>
                <List>
                  {inventory.map((item) => (
                    <React.Fragment key={item.id}>
                      <ListItem>
                        <ListItemText
                          primary={`${item.productId}: ${item.totalAvailable}`}
                          secondary={`Last updated: ${new Date(item.lastUpdated?.toDate()).toLocaleDateString()}`}
                        />
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedInventory(item);
                            setInventoryAdjustment(item.totalAvailable.toString());
                            setInventoryDialogOpen(true);
                          }}
                        >
                          Adjust
                        </Button>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Total Products: {products.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Total Users: {users.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Pending Requests: {requests.filter(r => r.status === 'pending').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Fulfillment Logs: {fulfillmentLogs.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)}>
        <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Email"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              label="Role"
            >
              <MenuItem value="bakery">Bakery</MenuItem>
              <MenuItem value="fulfillment">Fulfillment</MenuItem>
              <MenuItem value="retail">Retail</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUserSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onClose={() => setProductDialogOpen(false)}>
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={productForm.name}
            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Acronym"
            value={productForm.acronym}
            onChange={(e) => setProductForm({ ...productForm, acronym: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Code"
            value={productForm.code}
            onChange={(e) => setProductForm({ ...productForm, code: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Unit"
            value={productForm.unit}
            onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleProductSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Oil Batch Dialog */}
      <Dialog open={oilBatchDialogOpen} onClose={() => setOilBatchDialogOpen(false)}>
        <DialogTitle>{editingOilBatch ? 'Edit Oil Batch' : 'Add Oil Batch'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Oil Batch Code"
            value={oilBatchForm.oilBatchCode}
            onChange={(e) => setOilBatchForm({ ...oilBatchForm, oilBatchCode: e.target.value })}
            error={Boolean(oilBatchErrors.oilBatchCode)}
            helperText={oilBatchErrors.oilBatchCode}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Type"
            value={oilBatchForm.type}
            onChange={(e) => setOilBatchForm({ ...oilBatchForm, type: e.target.value })}
            error={Boolean(oilBatchErrors.type)}
            helperText={oilBatchErrors.type}
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Amount (g)"
                type="number"
                value={oilBatchForm.amountGrams}
                onChange={(e) => setOilBatchForm({ ...oilBatchForm, amountGrams: e.target.value })}
                error={Boolean(oilBatchErrors.amountGrams)}
                helperText={oilBatchErrors.amountGrams}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Potency (%)"
                type="number"
                value={oilBatchForm.potencyPercent}
                onChange={(e) => setOilBatchForm({ ...oilBatchForm, potencyPercent: e.target.value })}
                error={Boolean(oilBatchErrors.potencyPercent)}
                helperText={oilBatchErrors.potencyPercent}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Remaining (g)"
                type="number"
                value={oilBatchForm.remainingGrams}
                onChange={(e) => setOilBatchForm({ ...oilBatchForm, remainingGrams: e.target.value })}
                error={Boolean(oilBatchErrors.remainingGrams)}
                helperText={oilBatchErrors.remainingGrams}
              />
            </Grid>
          </Grid>
          <TextField
            fullWidth
            label="Date Received"
            type="date"
            value={oilBatchForm.dateRecieved}
            onChange={(e) => setOilBatchForm({ ...oilBatchForm, dateRecieved: e.target.value })}
            InputLabelProps={{ shrink: true }}
            error={Boolean(oilBatchErrors.dateRecieved)}
            helperText={oilBatchErrors.dateRecieved}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOilBatchDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleOilBatchSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Inventory Adjustment Dialog */}
      <Dialog open={inventoryDialogOpen} onClose={() => setInventoryDialogOpen(false)}>
        <DialogTitle>Adjust Inventory</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Adjust inventory for {selectedInventory?.productId}
          </Typography>
          <TextField
            fullWidth
            label="New Total Available"
            type="number"
            value={inventoryAdjustment}
            onChange={(e) => setInventoryAdjustment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInventoryDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleInventoryAdjustment} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminDashboard;
