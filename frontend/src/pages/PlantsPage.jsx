import { useState } from 'react';
import { Box, Container, Typography, Button, Grid, CircularProgress, Alert, Card, CardContent, ToggleButton, ToggleButtonGroup, Chip } from '@mui/material';
import { Add as AddIcon, CameraAlt as CameraIcon, Opacity, LocalFlorist, LocalHospital, Notifications, Pets as PetsIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePlants } from '../hooks/usePlants';
import PlantCard from '../components/plants/PlantCard';
import PetSafetyIndicator, { PawIcon } from '../components/common/PetSafetyIndicator';

const features = [
  {
    icon: <PetsIcon sx={{ fontSize: 28, color: 'success.main' }} />,
    title: 'Pet Safe Plants',
    description: 'View plants safe for your furry friends',
    cta: 'Filter',
    action: 'pet-safe'
  },
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
  const [petFilter, setPetFilter] = useState('all'); // 'all' | 'safe' | 'toxic'

  const handleAddPlant = () => {
    navigate('/plants/add');
  };

  const handlePetFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setPetFilter(newFilter);
    }
  };

  const handleFeatureAction = (feature) => {
    if (feature.action === 'pet-safe') {
      setPetFilter(petFilter === 'safe' ? 'all' : 'safe');
    } else if (feature.link) {
      navigate(feature.link);
    }
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

  const allPlants = data?.plants || [];
  const totalPlants = data?.total || 0;

  // Filter plants based on pet safety
  const plants = allPlants.filter(plant => {
    if (petFilter === 'all') return true;
    if (petFilter === 'safe') return plant.pet_friendly === true;
    if (petFilter === 'toxic') return plant.pet_friendly === false;
    return true;
  });

  // Count pet-safe and toxic plants
  const petSafeCount = allPlants.filter(p => p.pet_friendly === true).length;
  const toxicCount = allPlants.filter(p => p.pet_friendly === false).length;

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

      {/* Pet Safety Filter */}
      {allPlants.length > 0 && (petSafeCount > 0 || toxicCount > 0) && (
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Filter by pet safety:
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={petFilter}
            exclusive
            onChange={handlePetFilterChange}
            size="small"
          >
            <ToggleButton value="all">
              All ({allPlants.length})
            </ToggleButton>
            <ToggleButton value="safe" sx={{ color: petFilter === 'safe' ? 'success.main' : 'inherit' }}>
              <PetsIcon fontSize="small" sx={{ mr: 0.5 }} />
              Pet Safe ({petSafeCount})
            </ToggleButton>
            <ToggleButton value="toxic" sx={{ color: petFilter === 'toxic' ? 'error.main' : 'inherit' }}>
              <PetsIcon fontSize="small" sx={{ mr: 0.5 }} />
              Toxic ({toxicCount})
            </ToggleButton>
          </ToggleButtonGroup>
          {petFilter !== 'all' && (
            <Chip
              label={`Showing ${plants.length} ${petFilter === 'safe' ? 'pet-safe' : 'toxic'} plant${plants.length !== 1 ? 's' : ''}`}
              onDelete={() => setPetFilter('all')}
              size="small"
              color={petFilter === 'safe' ? 'success' : 'error'}
              variant="outlined"
            />
          )}
        </Box>
      )}

      {/* Empty State - No plants at all */}
      {allPlants.length === 0 && (
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

      {/* Empty State - Filter resulted in no plants */}
      {allPlants.length > 0 && plants.length === 0 && petFilter !== 'all' && (
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            px: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '2px dashed',
            borderColor: 'divider'
          }}
        >
          <PetsIcon sx={{ fontSize: 48, color: petFilter === 'safe' ? 'success.main' : 'error.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom color="text.secondary">
            No {petFilter === 'safe' ? 'pet-safe' : 'toxic'} plants found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {petFilter === 'safe'
              ? "You don't have any plants marked as pet-safe yet."
              : "You don't have any plants marked as toxic to pets."}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setPetFilter('all')}
            size="small"
          >
            Show All Plants
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
                    variant={feature.action === 'pet-safe' && petFilter === 'safe' ? 'contained' : 'outlined'}
                    size="small"
                    color={feature.action === 'pet-safe' ? 'success' : 'primary'}
                    onClick={() => handleFeatureAction(feature)}
                    sx={{ fontSize: '0.7rem', py: 0.25, px: 1 }}
                  >
                    {feature.action === 'pet-safe' && petFilter === 'safe' ? 'Clear Filter' : feature.cta}
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
