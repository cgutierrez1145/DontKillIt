import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  FormControl,
  FormLabel,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  PhotoLibrary as GalleryIcon,
  Pets as PetsIcon,
  AutoAwesome as AIIcon,
  Edit as ManualIcon,
  CheckCircle as CheckIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { plantsAPI, identificationAPI, getPhotoUrl } from '../../services/api';

// Plant type prediction based on botanical family/genus
const predictPlantType = (family, genus) => {
  if (!family && !genus) return null;

  const familyLower = (family || '').toLowerCase();
  const genusLower = (genus || '').toLowerCase();

  // Succulents and Cacti
  if (familyLower === 'cactaceae') return 'Cactus';
  if (familyLower === 'crassulaceae') return 'Succulent';
  if (['echeveria', 'sedum', 'sempervivum', 'kalanchoe', 'crassula', 'aeonium'].includes(genusLower)) return 'Succulent';
  if (['aloe', 'haworthia', 'gasteria'].includes(genusLower)) return 'Succulent';
  if (genusLower === 'sansevieria' || genusLower === 'dracaena') return 'Succulent';

  // Tropical / Houseplants
  if (familyLower === 'araceae') return 'Tropical';
  if (['monstera', 'philodendron', 'pothos', 'epipremnum', 'anthurium', 'alocasia', 'caladium', 'dieffenbachia', 'aglaonema', 'spathiphyllum', 'syngonium'].includes(genusLower)) return 'Tropical';
  if (['ficus', 'schefflera', 'croton', 'codiaeum'].includes(genusLower)) return 'Tropical';
  if (familyLower === 'marantaceae') return 'Tropical'; // Prayer plants, Calathea

  // Ferns
  if (familyLower === 'polypodiaceae' || familyLower === 'nephrolepidaceae' || familyLower === 'pteridaceae' || familyLower === 'aspleniaceae') return 'Fern';
  if (['nephrolepis', 'adiantum', 'asplenium', 'pteris', 'platycerium'].includes(genusLower)) return 'Fern';

  // Palms
  if (familyLower === 'arecaceae') return 'Palm';
  if (['chamaedorea', 'dypsis', 'howea', 'phoenix', 'rhapis', 'livistona'].includes(genusLower)) return 'Palm';

  // Orchids
  if (familyLower === 'orchidaceae') return 'Orchid';
  if (['phalaenopsis', 'dendrobium', 'cattleya', 'oncidium', 'vanda', 'cymbidium'].includes(genusLower)) return 'Orchid';

  // Herbs
  if (familyLower === 'lamiaceae') return 'Herb'; // Mint family
  if (['mentha', 'ocimum', 'rosmarinus', 'salvia', 'thymus', 'lavandula', 'origanum', 'melissa'].includes(genusLower)) return 'Herb';
  if (['petroselinum', 'coriandrum', 'anethum', 'foeniculum'].includes(genusLower)) return 'Herb'; // Parsley, cilantro, dill, fennel

  // Flowering plants
  if (familyLower === 'begoniaceae') return 'Flowering';
  if (familyLower === 'gesneriaceae') return 'Flowering'; // African violets
  if (['begonia', 'saintpaulia', 'cyclamen', 'primula', 'hibiscus', 'gardenia', 'jasmine', 'hoya'].includes(genusLower)) return 'Flowering';
  if (familyLower === 'asteraceae') return 'Flowering'; // Daisy family

  // Bromeliads
  if (familyLower === 'bromeliaceae') return 'Bromeliad';
  if (['tillandsia', 'guzmania', 'vriesea', 'neoregelia', 'aechmea'].includes(genusLower)) return 'Bromeliad';

  // Vines / Climbing
  if (['hedera', 'cissus', 'parthenocissus', 'tradescantia', 'zebrina'].includes(genusLower)) return 'Vine';

  // Grass-like / Air plants
  if (familyLower === 'asparagaceae' && genusLower === 'chlorophytum') return 'Foliage'; // Spider plant
  if (genusLower === 'tillandsia') return 'Air Plant';

  // Trees (indoor trees)
  if (['ficus', 'pachira', 'schefflera', 'dracaena', 'yucca', 'beaucarnea'].includes(genusLower)) return 'Tree';

  // Default based on common houseplant families
  if (familyLower === 'asparagaceae') return 'Foliage';
  if (familyLower === 'moraceae') return 'Foliage';

  return null; // Unknown - let user fill in
};

// Photo upload modes
const MODES = {
  INITIAL: 'initial',           // No photo yet
  PHOTO_CHOICE: 'photo_choice', // Photo uploaded, show AI vs Manual choice
  IDENTIFYING: 'identifying',   // AI identification in progress
  SHOW_RESULTS: 'show_results', // Show identification results
  MANUAL_ENTRY: 'manual_entry', // User chose manual entry (or accepted AI result)
};

export default function PlantForm({ initialData = {}, onSubmit, isLoading = false, title = 'Plant Information' }) {
  const navigate = useNavigate();
  const isEditMode = Boolean(initialData.id);

  const [formData, setFormData] = useState({
    name: initialData.name || '',
    species: initialData.species || '',
    plant_type: initialData.plant_type || '',
    location: initialData.location || '',
    notes: initialData.notes || '',
    photo_url: initialData.photo_url || '',
    pet_friendly: initialData.pet_friendly,
    // AI identification fields
    plantnet_confidence: initialData.plantnet_confidence || null,
    identified_common_name: initialData.identified_common_name || null,
    auto_identified: initialData.auto_identified || false,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(getPhotoUrl(initialData.photo_url) || null);
  const [isUploading, setIsUploading] = useState(false);

  // New states for AI identification flow
  const [mode, setMode] = useState(isEditMode ? MODES.MANUAL_ENTRY : MODES.INITIAL);
  const [identificationResults, setIdentificationResults] = useState(null);
  const [identificationError, setIdentificationError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePetFriendlyChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      pet_friendly: newValue
    }));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // In edit mode, don't show the choice - just keep the photo
      if (!isEditMode) {
        setMode(MODES.PHOTO_CHOICE);
        setIdentificationResults(null);
        setIdentificationError(null);
      }
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData(prev => ({ ...prev, photo_url: '' }));
    if (!isEditMode) {
      setMode(MODES.INITIAL);
      setIdentificationResults(null);
      setIdentificationError(null);
    }
  };

  const handleIdentifyWithAI = async () => {
    if (!selectedFile) return;

    setMode(MODES.IDENTIFYING);
    setIdentificationError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', selectedFile);
      formDataToSend.append('organ', 'auto');

      const result = await identificationAPI.identify(formDataToSend);

      if (result.total_results > 0) {
        setIdentificationResults(result);
        setMode(MODES.SHOW_RESULTS);
      } else {
        setIdentificationError('No plant matches found. Try a clearer photo or enter details manually.');
        setMode(MODES.PHOTO_CHOICE);
      }
    } catch (error) {
      console.error('Identification failed:', error);
      setIdentificationError(error.response?.data?.detail || 'Failed to identify plant. Please try again or enter details manually.');
      setMode(MODES.PHOTO_CHOICE);
    }
  };

  const handleManualEntry = () => {
    setMode(MODES.MANUAL_ENTRY);
  };

  const handleAcceptIdentification = (result) => {
    // Predict plant type from family/genus
    const predictedPlantType = predictPlantType(result.family, result.genus);

    // Pre-fill form with AI identification results
    setFormData(prev => ({
      ...prev,
      name: result.common_name || result.species || prev.name,
      species: result.species || '',
      plant_type: predictedPlantType || prev.plant_type,
      plantnet_confidence: result.confidence,
      identified_common_name: result.common_name || null,
      auto_identified: true,
      pet_friendly: result.pet_toxicity?.pet_friendly ?? prev.pet_friendly,
    }));

    // Use the photo URL from identification if available
    if (identificationResults?.photo_url) {
      setFormData(prev => ({
        ...prev,
        photo_url: identificationResults.photo_url,
      }));
      // Clear selected file since photo is already uploaded
      setSelectedFile(null);
    }

    setMode(MODES.MANUAL_ENTRY);
  };

  const handleBackToChoice = () => {
    setMode(MODES.PHOTO_CHOICE);
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

  // Render photo upload buttons (reused in multiple places)
  const renderPhotoUploadButtons = () => (
    <>
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
    </>
  );

  // Render photo preview with remove button
  const renderPhotoPreview = (showRemove = true) => (
    <Box sx={{ position: 'relative', mb: 2 }}>
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
      {showRemove && (
        <Button
          size="small"
          onClick={handleRemovePhoto}
          sx={{ position: 'absolute', top: 8, right: 8 }}
          variant="contained"
          color="inherit"
        >
          Remove
        </Button>
      )}
    </Box>
  );

  // Render the INITIAL mode - photo upload prompt
  const renderInitialMode = () => (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Add New Plant
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Start by uploading a photo of your plant. You can then choose to identify it automatically with AI or enter the details manually.
      </Typography>
      {renderPhotoUploadButtons()}
      <Divider sx={{ my: 3 }} />
      <Button
        variant="text"
        onClick={handleManualEntry}
        startIcon={<ManualIcon />}
        fullWidth
      >
        Skip photo and enter details manually
      </Button>
    </Paper>
  );

  // Render the PHOTO_CHOICE mode - choose between AI and manual
  const renderPhotoChoiceMode = () => (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        How would you like to add this plant?
      </Typography>

      {renderPhotoPreview()}

      {identificationError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {identificationError}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: 2,
              },
            }}
            onClick={handleIdentifyWithAI}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <AIIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Identify with AI
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Let our AI analyze your photo and automatically identify the plant species
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: 2,
              },
            }}
            onClick={handleManualEntry}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <ManualIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Enter Manually
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fill in the plant details yourself if you already know what it is
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );

  // Render the IDENTIFYING mode - loading state
  const renderIdentifyingMode = () => (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Identifying Your Plant...
      </Typography>

      {renderPhotoPreview(false)}

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary">
          Our AI is analyzing your photo to identify the plant species
        </Typography>
      </Box>
    </Paper>
  );

  // Render the SHOW_RESULTS mode - display identification results
  const renderResultsMode = () => (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Plant Identification Results
      </Typography>

      {renderPhotoPreview(false)}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Found {identificationResults?.total_results} possible match{identificationResults?.total_results !== 1 ? 'es' : ''}. Select the one that best matches your plant:
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        {identificationResults?.results?.map((result, index) => {
          const predictedType = predictPlantType(result.family, result.genus);
          return (
            <Card
              key={index}
              variant="outlined"
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: 2,
                },
              }}
              onClick={() => handleAcceptIdentification(result)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">
                      {result.common_name || result.species}
                    </Typography>
                    {result.common_name && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        {result.species}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                      {result.family && (
                        <Typography variant="caption" color="text.secondary">
                          Family: {result.family}
                        </Typography>
                      )}
                      {predictedType && (
                        <Chip
                          label={predictedType}
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                    <Chip
                      label={`${Math.round(result.confidence * 100)}% match`}
                      color={result.confidence > 0.5 ? 'success' : result.confidence > 0.3 ? 'warning' : 'default'}
                      size="small"
                    />
                    {result.pet_toxicity && (
                      <Chip
                        icon={<PetsIcon />}
                        label={result.pet_toxicity.pet_friendly ? 'Pet Safe' : 'Toxic'}
                        color={result.pet_toxicity.pet_friendly ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<CheckIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcceptIdentification(result);
                    }}
                  >
                    Select This Plant
                  </Button>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={handleBackToChoice}
        >
          Try Different Photo
        </Button>
        <Button
          variant="text"
          startIcon={<ManualIcon />}
          onClick={handleManualEntry}
        >
          Enter Details Manually
        </Button>
      </Box>
    </Paper>
  );

  // Render the MANUAL_ENTRY mode - full form (also used for edit mode)
  const renderManualEntryMode = () => (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {title}
      </Typography>

      {formData.auto_identified && formData.plantnet_confidence && (
        <Alert severity="success" sx={{ mb: 2 }}>
          AI identified this plant as <strong>{formData.identified_common_name || formData.species}</strong> with {Math.round(formData.plantnet_confidence * 100)}% confidence. You can edit the details below.
        </Alert>
      )}

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
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <PetsIcon fontSize="small" />
                Pet Safety
              </FormLabel>
              <ToggleButtonGroup
                value={formData.pet_friendly}
                exclusive
                onChange={handlePetFriendlyChange}
                size="small"
              >
                <ToggleButton value={true} color="success">
                  Pet-Friendly
                </ToggleButton>
                <ToggleButton value={false} color="error">
                  Toxic to Pets
                </ToggleButton>
              </ToggleButtonGroup>
            </FormControl>
          </Grid>

          {/* Photo Upload Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Plant Photo {isEditMode ? '(optional)' : ''}
            </Typography>

            {/* Hidden file inputs */}
            <input
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              id="camera-upload-form"
              type="file"
              onChange={handleFileSelect}
            />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="gallery-upload-form"
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
                <label htmlFor="camera-upload-form" style={{ flex: 1 }}>
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CameraIcon />}
                    fullWidth
                  >
                    Take Photo
                  </Button>
                </label>
                <label htmlFor="gallery-upload-form" style={{ flex: 1 }}>
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

  // Render based on current mode
  switch (mode) {
    case MODES.INITIAL:
      return renderInitialMode();
    case MODES.PHOTO_CHOICE:
      return renderPhotoChoiceMode();
    case MODES.IDENTIFYING:
      return renderIdentifyingMode();
    case MODES.SHOW_RESULTS:
      return renderResultsMode();
    case MODES.MANUAL_ENTRY:
    default:
      return renderManualEntryMode();
  }
}
