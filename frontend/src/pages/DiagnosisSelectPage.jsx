import { useState, useRef } from 'react';
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
import { useUploadDiagnosis, useTextDiagnosis } from '../hooks/useDiagnosis';
import { getPhotoUrl } from '../services/api';

export default function DiagnosisSelectPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = usePlants();
  const uploadDiagnosis = useUploadDiagnosis();
  const textDiagnosis = useTextDiagnosis();
  const uploadSectionRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [diagnosisResult, setDiagnosisResult] = useState(null);

  const plants = data?.plants || [];
  const selectedPlant = plants.find(p => String(p.id) === selectedPlantId);
  const hasExistingPhoto = selectedPlant?.photo_url;
  const isPending = uploadDiagnosis.isPending || textDiagnosis.isPending;

  // Validate description - must contain meaningful text (letters forming words)
  const validateDescription = (text) => {
    const trimmed = text.trim();

    if (!trimmed) {
      return 'Please describe the problem you\'re seeing';
    }

    // Must be at least 10 characters
    if (trimmed.length < 10) {
      return 'Please provide a more detailed description (at least 10 characters)';
    }

    // Must contain actual letters (not just numbers/symbols)
    const letterCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
    if (letterCount < 5) {
      return 'Please describe the problem using words, not just numbers or symbols';
    }

    // Letters should make up at least 50% of the non-space characters
    const nonSpaceChars = trimmed.replace(/\s/g, '').length;
    if (letterCount / nonSpaceChars < 0.5) {
      return 'Please use a natural language description of the problem';
    }

    // Check for at least 2 word-like sequences (letters grouped together)
    const words = trimmed.match(/[a-zA-Z]{2,}/g) || [];
    if (words.length < 2) {
      return 'Please describe the problem in a sentence or phrase';
    }

    return '';
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescription(value);
    // Only show error after user has typed something substantial
    if (value.length > 5) {
      setDescriptionError(validateDescription(value));
    } else {
      setDescriptionError('');
    }
  };

  const handlePlantSelect = (plantId) => {
    setSelectedPlantId(String(plantId));
    setSelectedFile(null);
    setPreviewUrl(null);
    setDiagnosisResult(null);
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDiagnosisResult(null);
    }
  };

  const handleSubmit = async () => {
    // Validate description before submitting
    const validationError = validateDescription(description);
    if (validationError) {
      setDescriptionError(validationError);
      return;
    }

    if (!selectedPlantId) {
      return;
    }

    const plantId = parseInt(selectedPlantId);

    if (selectedFile) {
      // Use upload diagnosis with new photo
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('description', description);

      uploadDiagnosis.mutate(
        { plantId, formData },
        {
          onSuccess: (data) => {
            setDiagnosisResult(data);
          },
        }
      );
    } else {
      // Use text-only diagnosis with existing plant photo
      textDiagnosis.mutate(
        { plantId, description },
        {
          onSuccess: (data) => {
            setDiagnosisResult(data);
          },
        }
      );
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDescription('');
    setDescriptionError('');
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
      <Paper ref={uploadSectionRef} elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Describe the Problem
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {selectedPlant
            ? `Describe what's wrong with ${selectedPlant.name}. You can use the existing photo or upload a new one.`
            : 'Select a plant below, then describe the problem you\'re seeing.'}
        </Typography>

        {/* Show existing plant photo or uploaded photo */}
        {(previewUrl || (hasExistingPhoto && !selectedFile)) && (
          <Box sx={{ position: 'relative', mb: 3 }}>
            <Box
              component="img"
              src={previewUrl || getPhotoUrl(selectedPlant?.photo_url)}
              alt={selectedPlant?.name || 'Preview'}
              sx={{
                width: '100%',
                maxHeight: 300,
                objectFit: 'contain',
                borderRadius: 2,
                border: '2px solid',
                borderColor: previewUrl ? 'primary.main' : 'success.main',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                bgcolor: previewUrl ? 'primary.main' : 'success.main',
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              {previewUrl ? 'New Photo' : 'Existing Photo'}
            </Typography>
            {previewUrl && (
              <Button
                size="small"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                sx={{ position: 'absolute', top: 8, right: 8 }}
                variant="contained"
                color="inherit"
              >
                Use Existing
              </Button>
            )}
          </Box>
        )}

        {/* File Upload Buttons - optional */}
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

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {hasExistingPhoto ? 'Optionally upload a new photo:' : 'Upload a photo (optional if plant has existing image):'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <label htmlFor="camera-upload" style={{ flex: 1 }}>
              <Button
                variant="outlined"
                component="span"
                startIcon={<CameraIcon />}
                fullWidth
                size="small"
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
                size="small"
              >
                Gallery
              </Button>
            </label>
          </Box>
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
          onChange={handleDescriptionChange}
          error={!!descriptionError}
          helperText={descriptionError || 'Describe what\'s wrong with your plant in a few words'}
          sx={{ mb: 2 }}
        />

        {/* Submit Button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleSubmit}
          disabled={!description.trim() || !!descriptionError || !selectedPlantId || isPending}
          startIcon={isPending ? <CircularProgress size={20} /> : <SearchIcon />}
          color="error"
        >
          {isPending ? 'Searching for Solutions...' : 'Get Diagnosis'}
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
            Click on a plant to select it and upload a diagnosis photo.
          </Typography>

          <Grid container spacing={3}>
            {plants.map((plant) => (
              <Grid item xs={12} sm={6} md={4} key={plant.id}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    border: selectedPlantId === String(plant.id) ? 2 : 0,
                    borderColor: 'primary.main',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => handlePlantSelect(plant.id)}
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
                        variant={selectedPlantId === String(plant.id) ? 'contained' : 'outlined'}
                        color="error"
                        size="small"
                        startIcon={<DiagnoseIcon />}
                        sx={{ mt: 2 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlantSelect(plant.id);
                        }}
                      >
                        {selectedPlantId === String(plant.id) ? 'Selected' : 'Diagnose'}
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
