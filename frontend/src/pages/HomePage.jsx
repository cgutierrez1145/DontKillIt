import { Container, Typography, Box, Paper, Button, Grid, Card, CardContent } from '@mui/material';
import { LockOpen, Opacity, LocalFlorist, LocalHospital, Notifications } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Opacity sx={{ fontSize: 28, color: 'primary.main' }} />,
      title: 'Smart Watering',
      description: 'Never forget to water again with customizable schedules and reminders',
      cta: 'Learn More',
      link: '/preview/watering'
    },
    {
      icon: <LocalFlorist sx={{ fontSize: 28, color: 'secondary.main' }} />,
      title: 'Feeding Tracker',
      description: 'Keep your plants healthy with feeding schedules and history',
      cta: 'Learn More',
      link: '/preview/feeding'
    },
    {
      icon: <LocalHospital sx={{ fontSize: 28, color: 'error.main' }} />,
      title: 'Plant Diagnosis',
      description: 'Upload photos and get instant solutions for plant problems',
      cta: 'Learn More',
      link: '/preview/diagnosis'
    },
    {
      icon: <Notifications sx={{ fontSize: 28, color: 'warning.main' }} />,
      title: 'Email Reminders',
      description: 'Get notified when your plants need care',
      cta: 'Learn More',
      link: '/preview/reminders'
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
            alt="Don't Kill It!"
            sx={{ height: 150, mb: 2 }}
          />
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Don't Kill It!
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
                onClick={() => navigate('/plants')}
              >
                My Plants
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/plants/add')}
              >
                Add Plant
              </Button>
            </Box>

            {/* Feature Cards for Authenticated Users */}
            <Box sx={{ mt: 5 }}>
              <Typography variant="h6" gutterBottom textAlign="center" sx={{ mb: 3 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                {[
                  { icon: <Opacity sx={{ fontSize: 28, color: 'primary.main' }} />, title: 'Smart Watering', description: 'Track watering schedules and get reminders', cta: 'View Schedules', link: '/watering' },
                  { icon: <LocalFlorist sx={{ fontSize: 28, color: 'secondary.main' }} />, title: 'Feeding Tracker', description: 'Manage feeding schedules and history', cta: 'View Feeding', link: '/feeding' },
                  { icon: <LocalHospital sx={{ fontSize: 28, color: 'error.main' }} />, title: 'Plant Diagnosis', description: 'Diagnose plant problems with AI', cta: 'Diagnose', link: '/diagnosis' },
                  { icon: <Notifications sx={{ fontSize: 28, color: 'warning.main' }} />, title: 'Email Reminders', description: 'Get notified when plants need care', cta: 'Settings', link: '/settings' },
                ].map((feature, index) => (
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
          </Box>
        ) : (
          <>
            {/* Features Grid */}
            <Box sx={{ mt: 6 }}>
              <Typography variant="h4" gutterBottom textAlign="center" sx={{ mb: 4 }}>
                Everything You Need to Keep Plants Alive
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                {features.map((feature, index) => (
                  <Grid item xs={6} sm={4} md={2.5} key={index}>
                    <Card sx={{ textAlign: 'center' }}>
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

            {/* Dashboard Preview CTA */}
            <Box sx={{ mt: 5, textAlign: 'center' }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate('/preview/dashboard')}
              >
                See Dashboard Preview
              </Button>
            </Box>

            {/* CTA Section */}
            <Box sx={{ mt: 5, textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom>
                Get Started Today
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                Create an account and start taking better care of your plants
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<LockOpen />}
                  onClick={() => navigate('/register')}
                >
                  Sign Up Free
                </Button>
                <Button
                  variant="outlined"
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
