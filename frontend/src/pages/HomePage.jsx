import { Container, Typography, Box, Paper, Button, Grid, Card, CardContent } from '@mui/material';
import { LockOpen, Opacity, LocalFlorist, LocalHospital, Notifications } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Opacity sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Smart Watering',
      description: 'Never forget to water again with customizable schedules and reminders'
    },
    {
      icon: <LocalFlorist sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: 'Feeding Tracker',
      description: 'Keep your plants healthy with feeding schedules and history'
    },
    {
      icon: <LocalHospital sx={{ fontSize: 40, color: 'error.main' }} />,
      title: 'Plant Diagnosis',
      description: 'Upload photos and get instant solutions for plant problems'
    },
    {
      icon: <Notifications sx={{ fontSize: 40, color: 'warning.main' }} />,
      title: 'Email Reminders',
      description: 'Get notified when your plants need care'
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4 }}>
        {/* Hero Section */}
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
            color: 'white'
          }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="DontKillIt"
            sx={{ height: 150, mb: 2 }}
          />
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            DontKillIt
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ fontStyle: 'italic', opacity: 0.95 }}>
            Real talk: plants are needy
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, fontSize: '1.1rem' }}>
            Your personal plant care companion. Track watering, feeding, and diagnose problems with ease.
          </Typography>
        </Paper>

        {isAuthenticated ? (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.email}! 🌱
            </Typography>
            <Typography variant="body1" paragraph>
              Ready to take care of your plants today?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/plants')}
              >
                My Plants
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/plants/add')}
              >
                Add Plant
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            {/* Features Grid */}
            <Box sx={{ mt: 6 }}>
              <Typography variant="h4" gutterBottom textAlign="center" sx={{ mb: 4 }}>
                Everything You Need to Keep Plants Alive
              </Typography>
              <Grid container spacing={3}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                      <CardContent>
                        {feature.icon}
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* CTA Section */}
            <Box sx={{ mt: 6, textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom>
                Get Started Today
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                Create an account and start taking better care of your plants
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<LockOpen />}
                  onClick={() => navigate('/register')}
                >
                  Sign Up Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
}

export default HomePage;
