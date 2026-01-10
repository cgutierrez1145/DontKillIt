import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  PhotoLibrary as GalleryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { plantsAPI, getPhotoUrl } from '../../services/api';

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

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(getPhotoUrl(initialData.photo_url) || null);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData(prev => ({ ...prev, photo_url: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let photoUrl = formData.photo_url;

    // Upload photo if a new file was selected
    if (selectedFile) {
      setIsUploading(true);
      try {
        const result = await plantsAPI.uploadPhoto(selectedFile);
        photoUrl = result.photo_url;
      } catch (error) {
        console.error('Failed to upload photo:', error);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    // Remove empty strings to send null for optional fields
    const cleanedData = Object.entries({ ...formData, photo_url: photoUrl }).reduce((acc, [key, value]) => {
      acc[key] = typeof value === 'string' && value.trim() === '' ? null : value;
      return acc;
    }, {});
    onSubmit(cleanedData);
  };

  const handleCancel = () => {
    navigate('/plants');
  };

  const isSubmitting = isLoading || isUploading;

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

          {/* Photo Upload Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Plant Photo (optional)
            </Typography>

            {/* Hidden file inputs */}
            <input
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              id="camera-upload"
              type="file"
              onChange={handleFileSelect}
            />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="gallery-upload"
              type="file"
              onChange={handleFileSelect}
            />

            {/* Photo preview or upload buttons */}
            {previewUrl ? (
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={previewUrl}
                  alt="Plant preview"
                  sx={{
                    width: '100%',
                    maxHeight: 300,
                    objectFit: 'contain',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
                <Button
                  size="small"
                  onClick={handleRemovePhoto}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                  variant="contained"
                  color="inherit"
                >
                  Remove
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <label htmlFor="camera-upload" style={{ flex: 1 }}>
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CameraIcon />}
                    fullWidth
                  >
                    Take Photo
                  </Button>
                </label>
                <label htmlFor="gallery-upload" style={{ flex: 1 }}>
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<GalleryIcon />}
                    fullWidth
                  >
                    Choose Photo
                  </Button>
                </label>
              </Box>
            )}
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
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || !formData.name.trim()}
                startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isUploading ? 'Uploading...' : isLoading ? 'Saving...' : 'Save Plant'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
