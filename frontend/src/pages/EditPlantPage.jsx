import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, CircularProgress, Alert, Button, Grid } from '@mui/material';
import { usePlant, useUpdatePlant } from '../hooks/usePlants';
import PlantForm from '../components/plants/PlantForm';
import ScheduleCard from '../components/schedules/ScheduleCard';

export default function EditPlantPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: plant, isLoading, isError, error } = usePlant(id);
  const updatePlant = useUpdatePlant();

  const handleSubmit = async (plantData) => {
    updatePlant.mutate(
      { id: parseInt(id), data: plantData },
      {
        onSuccess: () => {
          navigate(`/plants/${id}`);
        },
      }
    );
  };

  const handleBack = () => {
    navigate(`/plants/${id}`);
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
            Back to Plant
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Edit Plant
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Update {plant.name}'s information
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <PlantForm
            initialData={plant}
            onSubmit={handleSubmit}
            isLoading={updatePlant.isPending}
            title="Edit Plant Information"
          />
        </Grid>
        <Grid item xs={12} md={5}>
          <ScheduleCard plantId={parseInt(id)} />
        </Grid>
      </Grid>
    </Container>
  );
}
