import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function AssetForm() {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    symbol: '',
    quantity: '',
    manualValue: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchAsset();
    }
  }, [id]);

  const fetchAsset = async () => {
    try {
      const response = await axios.get(`/api/assets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData(response.data);
    } catch (error) {
      setError('Error fetching asset');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const endpoint = id ? `/api/assets/${id}` : '/api/assets';
      const method = id ? 'put' : 'post';

      await axios[method](endpoint, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Asset saved successfully');
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving asset');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {id ? 'Edit Asset' : 'Add New Asset'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="name"
            label="Asset Name"
            value={formData.name}
            onChange={handleChange}
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Asset Type</InputLabel>
            <Select
              name="type"
              value={formData.type}
              label="Asset Type"
              onChange={handleChange}
            >
              <MenuItem value="crypto">Cryptocurrency</MenuItem>
              <MenuItem value="currency">Currency</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="normal"
            required
            fullWidth
            name="symbol"
            label="Symbol/Ticker"
            value={formData.symbol}
            onChange={handleChange}
            helperText="For crypto: use CoinGecko ID (e.g., 'bitcoin')"
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="quantity"
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
          />

          {formData.type === 'other' && (
            <TextField
              margin="normal"
              required
              fullWidth
              name="manualValue"
              label="Value (USD)"
              type="number"
              value={formData.manualValue}
              onChange={handleChange}
            />
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="button"
              fullWidth
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button type="submit" fullWidth variant="contained">
              {id ? 'Update' : 'Add'} Asset
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
