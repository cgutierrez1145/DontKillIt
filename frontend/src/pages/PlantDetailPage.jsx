import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, ArrowBack as BackIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import { usePlant } from '../hooks/usePlants';
import ScheduleCard from '../components/schedules/ScheduleCard';

export default function PlantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: plant, isLoading, isError, error } = usePlant(id);

  const handleEdit = () => {
    navigate(`/plants/${id}/edit`);
  };

  const handleBack = () => {
    navigate('/plants');
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
            Failed to load plant: {error.response?.data?.detail || error.message}
          </Alert>
          <Button onClick={handleBack} sx={{ mt: 2 }}>
            Back to Plants
          </Button>
        </Box>
      </Container>
    );
  }

  const plantImage = plant.photo_url || 'https://via.placeholder.com/400x300?text=Plant';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={handleBack}>
          <BackIcon />
        </IconButton>
        <Typography variant="h3" component="h1" sx={{ flexGrow: 1 }}>
          {plant.name}
        </Typography>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          Edit Plant
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Plant Info */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box
              component="img"
              src={plantImage}
              alt={plant.name}
              sx={{
                width: '100%',
                height: 300,
                objectFit: 'cover',
                borderRadius: 2,
                mb: 2,
              }}
            />

            <Box sx={{ mt: 2 }}>
              {plant.species && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Species
                  </Typography>
                  <Typography variant="h6">
                    <em>{plant.species}</em>
                  </Typography>
                </Box>
              )}

              {plant.plant_type && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Type
                  </Typography>
                  <Chip label={plant.plant_type} color="primary" />
                </Box>
              )}

              {plant.location && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Location
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body1">{plant.location}</Typography>
                  </Box>
                </Box>
              )}

              {plant.notes && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Notes
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {plant.notes}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Schedules */}
        <Grid item xs={12} md={6}>
          <ScheduleCard plantId={parseInt(id)} />
        </Grid>
      </Grid>
    </Container>
  );
}
