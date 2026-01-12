import {
  Container,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Button,
  Grid,
  Chip,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Spa,
  WaterDrop,
  Grass,
  LocationOn,
  CheckCircle,
  ArrowBack,
  CameraAlt,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function DashboardPreviewPage() {
  const navigate = useNavigate();

  // Mock plants data
  const mockPlants = [
    {
      id: 1,
      name: 'Monstera Deliciosa',
      species: 'Monstera deliciosa',
      type: 'Tropical',
      location: 'Living Room',
      image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&h=300&fit=crop',
      nextWater: 2,
      nextFeed: 12,
    },
    {
      id: 2,
      name: 'Snake Plant',
      species: 'Sansevieria trifasciata',
      type: 'Succulent',
      location: 'Bedroom',
      image: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?w=400&h=300&fit=crop',
      nextWater: 5,
      nextFeed: 20,
    },
    {
      id: 3,
      name: 'Pothos',
      species: 'Epipremnum aureum',
      type: 'Vine',
      location: 'Kitchen',
      image: 'https://images.unsplash.com/photo-1602923668104-8f9e03e77e62?w=400&h=300&fit=crop',
      nextWater: 1,
      nextFeed: 8,
    },
    {
      id: 4,
      name: 'Fiddle Leaf Fig',
      species: 'Ficus lyrata',
      type: 'Tree',
      location: 'Office',
      image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop',
      nextWater: 3,
      nextFeed: 15,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/')}
        sx={{ mb: 3 }}
      >
        Back to Home
      </Button>

      {/* Banner */}
      <Box sx={{ textAlign: 'center', mb: 2, py: 1, px: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No account required to explore — sign up only when ready.
        </Typography>
      </Box>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Spa sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Your Plant Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
          See all your plants at a glance. Track watering schedules, feeding times,
          and keep your entire collection organized in one place.
        </Typography>
      </Box>

      {/* Mock Dashboard Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Spa color="primary" />
            My Plants
            <Chip label="4 plants" size="small" color="primary" />
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<CameraAlt />}
              size="small"
              disabled
            >
              Identify Plant
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              size="small"
              disabled
            >
              Add Plant
            </Button>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary.dark" fontWeight="bold">4</Typography>
              <Typography variant="body2" color="primary.dark">Total Plants</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="info.dark" fontWeight="bold">2</Typography>
              <Typography variant="body2" color="info.dark">Need Water Soon</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success.dark" fontWeight="bold">1</Typography>
              <Typography variant="body2" color="success.dark">Need Feeding</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="warning.dark" fontWeight="bold">0</Typography>
              <Typography variant="body2" color="warning.dark">Health Issues</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Mock Plant Cards */}
        <Grid container spacing={3}>
          {mockPlants.map((plant) => (
            <Grid item xs={12} sm={6} md={3} key={plant.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: 0.9,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={plant.image}
                  alt={plant.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {plant.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <em>{plant.species}</em>
                  </Typography>
                  <Chip
                    label={plant.type}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                    <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {plant.location}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip
                      icon={<WaterDrop />}
                      label={`${plant.nextWater}d`}
                      size="small"
                      color={plant.nextWater <= 1 ? 'warning' : 'default'}
                      variant="outlined"
                    />
                    <Chip
                      icon={<Grass />}
                      label={`${plant.nextFeed}d`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Features List */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          What you can do with your dashboard
        </Typography>
        <Grid container spacing={2}>
          {[
            'Add unlimited plants to your collection',
            'Upload photos for each plant',
            'Set custom watering & feeding schedules',
            'Get reminders when care is needed',
            'Track plant health over time',
            'Diagnose problems with AI',
            'View care history and trends',
            'Organize plants by location',
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2">{feature}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* CTA */}
      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/register')}
          sx={{ px: 4 }}
        >
          Create Your Dashboard
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Free account — start tracking your plants today
        </Typography>
      </Box>
    </Container>
  );
}
