import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  PhotoLibrary as GalleryIcon,
  ArrowBack as BackIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Yard as PlantIcon,
  Pets as PetsIcon,
  Warning as WarningIcon,
  CheckCircle as SafeIcon,
} from '@mui/icons-material';
import { useIdentifyPlant } from '../hooks/useIdentification';
import { useCreatePlant } from '../hooks/usePlants';

export default function IdentifyPlantPage() {
  const navigate = useNavigate();
  const identifyPlant = useIdentifyPlant();
  const createPlant = useCreatePlant();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [organ, setOrgan] = useState('auto');
  const [identificationResult, setIdentificationResult] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIdentificationResult(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('organ', organ);

    identifyPlant.mutate(formData, {
      onSuccess: (data) => {
        setIdentificationResult(data);
      },
    });
  };

  const handleAddPlant = (result) => {
    createPlant.mutate(
      {
        name: result.common_name || result.species,
        species: result.species,
        plantnet_confidence: result.confidence,
        identified_common_name: result.common_name,
        auto_identified: true,
        pet_friendly: result.pet_toxicity?.pet_friendly ?? null,
        photo_url: identificationResult?.photo_url || null,
      },
      {
        onSuccess: (data) => {
          navigate(`/plants/${data.id}`);
        },
      }
    );
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIdentificationResult(null);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return 'success';
    if (confidence >= 0.4) return 'warning';
    return 'error';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.7) return 'High confidence';
    if (confidence >= 0.4) return 'Medium confidence';
    return 'Low confidence';
  };

  const getToxicityChip = (petToxicity) => {
    if (!petToxicity) return null;

    if (petToxicity.pet_friendly) {
      return (
        <Chip
          icon={<SafeIcon />}
          label="Pet-Friendly"
          color="success"
          size="small"
          variant="outlined"
        />
      );
    }

    const levelColors = {
      'mild': 'warning',
      'moderate': 'error',
      'severe': 'error',
    };
    const color = levelColors[petToxicity.toxicity_level] || 'error';
    const label = petToxicity.toxicity_level === 'severe'
      ? 'Highly Toxic to Pets'
      : 'Toxic to Pets';

    return (
      <Chip
        icon={<WarningIcon />}
        label={label}
        color={color}
        size="small"
        variant="outlined"
      />
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={handleBack}>
          <BackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1">
            Identify Plant
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload a photo to identify your plant
          </Typography>
        </Box>
      </Box>

      {/* Upload Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Take or Choose a Photo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          For best results, take a clear photo of a leaf, flower, or the whole plant.
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
            <Box sx={{ position: 'relative' }}>
              <Box
                component="img"
                src={previewUrl}
                alt="Preview"
                sx={{
                  width: '100%',
                  maxHeight: 350,
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

        {/* Organ Selection */}
        {previewUrl && (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>What part of the plant is shown?</InputLabel>
            <Select
              value={organ}
              label="What part of the plant is shown?"
              onChange={(e) => setOrgan(e.target.value)}
            >
              <MenuItem value="auto">Auto-detect</MenuItem>
              <MenuItem value="leaf">Leaf</MenuItem>
              <MenuItem value="flower">Flower</MenuItem>
              <MenuItem value="fruit">Fruit</MenuItem>
              <MenuItem value="bark">Bark / Stem</MenuItem>
            </Select>
          </FormControl>
        )}

        {/* Submit Button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleSubmit}
          disabled={!selectedFile || identifyPlant.isPending}
          startIcon={identifyPlant.isPending ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          color="primary"
        >
          {identifyPlant.isPending ? 'Identifying...' : 'Identify Plant'}
        </Button>
      </Paper>

      {/* Results Section */}
      {identificationResult && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlantIcon color="primary" />
            Results ({identificationResult.total_results} matches)
          </Typography>

          {identificationResult.total_results === 0 ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              No matches found. Try taking a clearer photo or selecting the correct plant part.
            </Alert>
          ) : (
            <>
              {/* Top Result */}
              {identificationResult.top_result && (
                <Card sx={{ mb: 3, border: 2, borderColor: 'primary.main' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label="Best Match"
                            color="primary"
                            size="small"
                          />
                          {getToxicityChip(identificationResult.top_result.pet_toxicity)}
                        </Box>
                        <Typography variant="h5" component="div">
                          {identificationResult.top_result.common_name || identificationResult.top_result.species}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          {identificationResult.top_result.species}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddPlant(identificationResult.top_result)}
                        disabled={createPlant.isPending}
                      >
                        Add to My Plants
                      </Button>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Confidence:
                        </Typography>
                        <Chip
                          label={`${Math.round(identificationResult.top_result.confidence * 100)}%`}
                          color={getConfidenceColor(identificationResult.top_result.confidence)}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          ({getConfidenceLabel(identificationResult.top_result.confidence)})
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={identificationResult.top_result.confidence * 100}
                        color={getConfidenceColor(identificationResult.top_result.confidence)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    {(identificationResult.top_result.family || identificationResult.top_result.genus) && (
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {identificationResult.top_result.family && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Family:</strong> {identificationResult.top_result.family}
                          </Typography>
                        )}
                        {identificationResult.top_result.genus && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Genus:</strong> {identificationResult.top_result.genus}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Pet Toxicity Details */}
                    {identificationResult.top_result.pet_toxicity && !identificationResult.top_result.pet_toxicity.pet_friendly && (
                      <Alert
                        severity="warning"
                        icon={<PetsIcon />}
                        sx={{ mt: 2 }}
                      >
                        <Typography variant="body2">
                          <strong>Pet Warning:</strong> This plant is toxic to cats and dogs.
                          {identificationResult.top_result.pet_toxicity.symptoms && (
                            <> Symptoms may include: {identificationResult.top_result.pet_toxicity.symptoms}</>
                          )}
                        </Typography>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Other Results */}
              {identificationResult.results.length > 1 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Other Possibilities
                  </Typography>
                  <Grid container spacing={2}>
                    {identificationResult.results.slice(1).map((result, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" component="div">
                              {result.common_name || result.species}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1 }}>
                              {result.species}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                  label={`${Math.round(result.confidence * 100)}%`}
                                  color={getConfidenceColor(result.confidence)}
                                  size="small"
                                />
                                {getToxicityChip(result.pet_toxicity)}
                              </Box>
                              <Button
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => handleAddPlant(result)}
                                disabled={createPlant.isPending}
                              >
                                Add
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
            </>
          )}

          <Alert severity="info" sx={{ mt: 3 }}>
            Plant identification is powered by PlantNet. Results may vary based on image quality and plant characteristics.
          </Alert>
        </Box>
      )}
    </Container>
  );
}
