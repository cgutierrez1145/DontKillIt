import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function PlantForm({ initialData = {}, onSubmit, isLoading = false, title = 'Plant Information' }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    species: initialData.species || '',
    plant_type: initialData.plant_type || '',
    location: initialData.location || '',
    notes: initialData.notes || '',
    photo_url: initialData.photo_url || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Remove empty strings to send null for optional fields
    const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
      acc[key] = value.trim() === '' ? null : value;
      return acc;
    }, {});
    onSubmit(cleanedData);
  };

  const handleCancel = () => {
    navigate('/plants');
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {title}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Plant Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., My Snake Plant"
              autoFocus
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Species"
              name="species"
              value={formData.species}
              onChange={handleChange}
              placeholder="e.g., Sansevieria trifasciata"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Plant Type"
              name="plant_type"
              value={formData.plant_type}
              onChange={handleChange}
              placeholder="e.g., Succulent, Herb, Flower"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Living Room, Kitchen Window"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Photo URL"
              name="photo_url"
              value={formData.photo_url}
              onChange={handleChange}
              placeholder="https://example.com/plant-photo.jpg"
              helperText="Optional: Enter a URL to a photo of your plant"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any care notes, observations, or reminders..."
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading || !formData.name.trim()}
              >
                {isLoading ? 'Saving...' : 'Save Plant'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
