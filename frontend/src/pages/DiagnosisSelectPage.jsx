import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  LocalHospital as DiagnoseIcon,
  CloudUpload as UploadIcon,
  Search as SearchIcon,
  CameraAlt as CameraIcon,
  PhotoLibrary as GalleryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePlants } from '../hooks/usePlants';
import { useUploadDiagnosis } from '../hooks/useDiagnosis';
import { getPhotoUrl } from '../services/api';

export default function DiagnosisSelectPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = usePlants();
  const uploadDiagnosis = useUploadDiagnosis();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [description, setDescription] = useState('');
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [diagnosisResult, setDiagnosisResult] = useState(null);

  const plants = data?.plants || [];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDiagnosisResult(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !description.trim() || !selectedPlantId) {
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('description', description);

    uploadDiagnosis.mutate(
      { plantId: parseInt(selectedPlantId), formData },
      {
        onSuccess: (data) => {
          setDiagnosisResult(data);
        },
      }
    );
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDescription('');
    setDiagnosisResult(null);
  };

  if (isLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            Failed to load plants: {error.response?.data?.detail || error.message}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DiagnoseIcon sx={{ fontSize: 40, color: 'error.main' }} />
          <Box>
            <Typography variant="h4" component="h1">
              Plant Diagnosis
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Upload a photo of your sick plant and get AI-powered solutions
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Upload Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Upload Photo & Describe Problem
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Take a photo of your plant showing the problem and describe what you're seeing.
        </Typography>

        {/* File Upload Buttons */}
        <Box sx={{ mb: 3 }}>
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

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <label htmlFor="camera-upload" style={{ flex: 1 }}>
              <Button
                variant="contained"
                component="span"
                startIcon={<CameraIcon />}
                fullWidth
                size="large"
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
                size="large"
              >
                Choose from Gallery
              </Button>
            </label>
          </Box>

          {previewUrl && (
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Box
                component="img"
                src={previewUrl}
                alt="Preview"
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
                onClick={handleReset}
                sx={{ position: 'absolute', top: 8, right: 8 }}
                variant="contained"
                color="inherit"
              >
                Change
              </Button>
            </Box>
          )}
        </Box>

        {/* Plant Selection */}
        {plants.length > 0 && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Plant (required)</InputLabel>
            <Select
              value={selectedPlantId}
              label="Select Plant (required)"
              onChange={(e) => setSelectedPlantId(e.target.value)}
            >
              {plants.map((plant) => (
                <MenuItem key={plant.id} value={plant.id}>
                  {plant.name} {plant.species ? `(${plant.species})` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Description */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Describe the problem"
          placeholder="e.g., Yellow leaves on bottom, brown spots appearing, wilting stems..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Submit Button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleSubmit}
          disabled={!selectedFile || !description.trim() || !selectedPlantId || uploadDiagnosis.isPending}
          startIcon={uploadDiagnosis.isPending ? <CircularProgress size={20} /> : <SearchIcon />}
          color="error"
        >
          {uploadDiagnosis.isPending ? 'Searching for Solutions...' : 'Get Diagnosis'}
        </Button>

        {plants.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            You need to add a plant first before you can diagnose it.{' '}
            <Button size="small" onClick={() => navigate('/plants/add')}>
              Add a Plant
            </Button>
          </Alert>
        )}
      </Paper>

      {/* Results Section */}
      {diagnosisResult && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Possible Solutions ({diagnosisResult.total_solutions} found)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Problem: {diagnosisResult.photo.description}
          </Typography>

          <Grid container spacing={2}>
            {diagnosisResult.solutions.map((solution) => (
              <Grid item xs={12} key={solution.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          minWidth: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          flexShrink: 0,
                        }}
                      >
                        {solution.rank}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }}>
                        <Link
                          href={solution.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{ display: 'block', mb: 1 }}
                        >
                          <Typography variant="h6" component="span">
                            {solution.title}
                          </Typography>
                        </Link>
                        {solution.snippet && (
                          <Typography variant="body2" color="text.secondary">
                            {solution.snippet}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {new URL(solution.url).hostname}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Alert severity="info" sx={{ mt: 3 }}>
            These are suggested solutions based on web searches. Always verify the information and consult with a plant expert if you're unsure.
          </Alert>

          <Button
            variant="outlined"
            onClick={handleReset}
            sx={{ mt: 2 }}
          >
            Diagnose Another Problem
          </Button>
        </Paper>
      )}

      {/* Quick Select from Plants */}
      {plants.length > 0 && !diagnosisResult && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Or Select a Plant to Diagnose
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose from your existing plants to go to their diagnosis page.
          </Typography>

          <Grid container spacing={3}>
            {plants.map((plant) => (
              <Grid item xs={12} sm={6} md={4} key={plant.id}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(`/plants/${plant.id}/diagnosis`)}
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <CardMedia
                      component="img"
                      height="160"
                      image={getPhotoUrl(plant.photo_url) || 'https://via.placeholder.com/300x160?text=Plant'}
                      alt={plant.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {plant.name}
                      </Typography>
                      {plant.species && (
                        <Typography variant="body2" color="text.secondary">
                          <em>{plant.species}</em>
                        </Typography>
                      )}
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DiagnoseIcon />}
                        sx={{ mt: 2 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/plants/${plant.id}/diagnosis`);
                        }}
                      >
                        Diagnose
                      </Button>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
}
