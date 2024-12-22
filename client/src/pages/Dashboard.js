import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [filter, setFilter] = useState('all');
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssets();
    const interval = setInterval(fetchAssets, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await axios.get('/api/assets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssets(response.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const handleUpdateMarketValues = async () => {
    try {
      await axios.post('/api/assets/update-market-values', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAssets();
    } catch (error) {
      console.error('Error updating market values:', error);
    }
  };

  const getTotalValue = () => {
    return assets.reduce((total, asset) => {
      const value = asset.type === 'other' ? asset.manualValue : asset.marketValue * asset.quantity;
      return total + value;
    }, 0);
  };

  const getAssetsByType = () => {
    const groupedAssets = assets.reduce((acc, asset) => {
      const value = asset.type === 'other' ? asset.manualValue : asset.marketValue * asset.quantity;
      acc[asset.type] = (acc[asset.type] || 0) + value;
      return acc;
    }, {});

    return Object.entries(groupedAssets).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const filteredAssets = assets.filter(asset => 
    filter === 'all' ? true : asset.type === filter
  );

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'symbol', headerName: 'Symbol', flex: 1 },
    { field: 'quantity', headerName: 'Quantity', flex: 1 },
    {
      field: 'value',
      headerName: 'Value (USD)',
      flex: 1,
      valueGetter: (params) =>
        params.row.type === 'other'
          ? params.row.manualValue
          : params.row.marketValue * params.row.quantity,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => navigate(`/edit-asset/${params.row._id}`)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Dashboard</Typography>
          <Box>
            <Button
              variant="contained"
              onClick={handleUpdateMarketValues}
              sx={{ mr: 2 }}
            >
              Update Market Values
            </Button>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={filter}
                label="Filter"
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="crypto">Crypto</MenuItem>
                <MenuItem value="currency">Currency</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Total Portfolio Value</Typography>
            <Typography variant="h4">${getTotalValue().toLocaleString()}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2, height: 300 }}>
          <Typography variant="h6">Portfolio Distribution</Typography>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={getAssetsByType()}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {getAssetsByType().map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ height: 400 }}>
          <DataGrid
            rows={filteredAssets}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            getRowId={(row) => row._id}
            disableSelectionOnClick
          />
        </Paper>
      </Grid>
    </Grid>
  );
}
