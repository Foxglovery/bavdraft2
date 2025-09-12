import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Grid, TextField, Typography, Chip, IconButton } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { getProducts, getInventory } from '../services/firebase';

function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [filter, setFilter] = useState('');

  const loadData = async () => {
    try {
      console.log('Loading fresh inventory data...');
      const [p, inv] = await Promise.all([getProducts(), getInventory()]);
      console.log('Loaded products:', p);
      console.log('Loaded inventory:', inv);
      setProducts(p);
      setInventory(inv);
    } catch (e) {
      console.error('Failed to load inventory', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const rows = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(p.acronym, { product: p, totalAvailable: 0 }));
    
    // Only process inventory entries that have product acronyms (not document IDs)
    inventory.forEach((i) => {
      // Skip entries with long document IDs (more than 10 characters)
      if (i.productId && i.productId.length > 10) {
        console.log('Skipping inventory entry with document ID:', i.productId);
        return;
      }
      
      const row = map.get(i.productId) || { product: { name: i.productId, acronym: i.productId }, totalAvailable: 0 };
      row.totalAvailable = i.totalAvailable;
      map.set(i.productId, row);
    });
    
    let list = Array.from(map.values());
    if (filter) {
      const f = filter.toLowerCase();
      list = list.filter(({ product }) =>
        product.name.toLowerCase().includes(f) || product.acronym.toLowerCase().includes(f)
      );
    }
    return list.sort((a, b) => a.product.acronym.localeCompare(b.product.acronym));
  }, [products, inventory, filter]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1">
          Inventory
        </Typography>
        <IconButton onClick={loadData} color="primary" title="Refresh Data">
          <Refresh />
        </IconButton>
      </Box>
      <TextField
        fullWidth
        placeholder="Search by name or acronym..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Grid container spacing={2}>
        {rows.map(({ product, totalAvailable }) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.acronym}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1">{product.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{product.acronym}</Typography>
                  </Box>
                  <Chip label={totalAvailable} color={totalAvailable > 0 ? 'primary' : 'default'} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default InventoryPage;


