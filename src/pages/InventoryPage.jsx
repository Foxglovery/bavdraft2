import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Grid, TextField, Typography, Chip } from '@mui/material';
import { getProducts, getInventory } from '../services/firebase';

function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [p, inv] = await Promise.all([getProducts(), getInventory()]);
        setProducts(p);
        setInventory(inv);
      } catch (e) {
        console.error('Failed to load inventory', e);
      }
    };
    load();
  }, []);

  const rows = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(p.acronym, { product: p, totalAvailable: 0 }));
    inventory.forEach((i) => {
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
      <Typography variant="h4" component="h1" gutterBottom>
        Inventory
      </Typography>
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


