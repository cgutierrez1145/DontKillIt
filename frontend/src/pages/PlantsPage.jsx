import { Box, Container, Typography, Button, Grid, CircularProgress, Alert } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePlants } from '../hooks/usePlants';
import PlantCard from '../components/plants/PlantCard';

export default function PlantsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = usePlants();

  const handleAddPlant = () => {
    navigate('/plants/add');
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

  const plants = data?.plants || [];
  const totalPlants = data?.total || 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            My Plants
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {totalPlants === 0 ? 'No plants yet' : `${totalPlants} plant${totalPlants !== 1 ? 's' : ''}`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddPlant}
          size="large"
        >
          Add Plant
        </Button>
      </Box>

      {/* Empty State */}
      {plants.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '2px dashed',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h5" gutterBottom color="text.secondary">
            No plants in your collection yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Start tracking your plants by adding your first one!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddPlant}
            size="large"
          >
            Add Your First Plant
          </Button>
        </Box>
      )}

      {/* Plants Grid */}
      {plants.length > 0 && (
        <Grid container spacing={3}>
          {plants.map((plant) => (
            <Grid item xs={12} sm={6} md={4} key={plant.id}>
              <PlantCard plant={plant} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
