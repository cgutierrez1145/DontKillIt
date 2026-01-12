import { Box, Container, Typography, Button, Grid, CircularProgress, Alert, Card, CardContent } from '@mui/material';
import { Add as AddIcon, CameraAlt as CameraIcon, Opacity, LocalFlorist, LocalHospital, Notifications } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePlants } from '../hooks/usePlants';
import PlantCard from '../components/plants/PlantCard';

const features = [
  {
    icon: <Opacity sx={{ fontSize: 28, color: 'primary.main' }} />,
    title: 'Smart Watering',
    description: 'Track watering schedules and get reminders',
    cta: 'View Schedules',
    link: '/watering'
  },
  {
    icon: <LocalFlorist sx={{ fontSize: 28, color: 'secondary.main' }} />,
    title: 'Feeding Tracker',
    description: 'Manage feeding schedules and history',
    cta: 'View Feeding',
    link: '/feeding'
  },
  {
    icon: <LocalHospital sx={{ fontSize: 28, color: 'error.main' }} />,
    title: 'Plant Diagnosis',
    description: 'Diagnose plant problems with AI',
    cta: 'Diagnose',
    link: '/diagnosis'
  },
  {
    icon: <Notifications sx={{ fontSize: 28, color: 'warning.main' }} />,
    title: 'Email Reminders',
    description: 'Get notified when plants need care',
    cta: 'Settings',
    link: '/settings'
  }
];

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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            My Plants
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {totalPlants === 0 ? 'No plants yet' : `${totalPlants} plant${totalPlants !== 1 ? 's' : ''}`}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CameraIcon />}
            onClick={() => navigate('/identify')}
            size="large"
          >
            Identify Plant
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddPlant}
            size="large"
          >
            Add Plant
          </Button>
        </Box>
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
            Start tracking your plants by adding your first one, or identify a plant from a photo!
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<CameraIcon />}
              onClick={() => navigate('/identify')}
              size="large"
            >
              Identify from Photo
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddPlant}
              size="large"
            >
              Add Manually
            </Button>
          </Box>
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

      {/* Feature Cards */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" gutterBottom textAlign="center" sx={{ mb: 3 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {features.map((feature, index) => (
            <Grid item xs={6} sm={4} md={2.5} key={index}>
              <Card sx={{ textAlign: 'center', height: '100%' }}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  {feature.icon}
                  <Typography variant="body2" fontWeight="medium" sx={{ mt: 0.5 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {feature.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(feature.link)}
                    sx={{ fontSize: '0.7rem', py: 0.25, px: 1 }}
                  >
                    {feature.cta}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
