import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { Spa, LockOpen } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Spa sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h2" component="h1" gutterBottom>
            DontKillIt
          </Typography>
          <Typography variant="h5" gutterBottom>
            Your Personal Plant Care Assistant
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Keep track of watering schedules, feeding times, and diagnose plant problems with ease.
          </Typography>
        </Paper>

        {isAuthenticated ? (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.email}! 🌱
            </Typography>
            <Typography variant="body1" paragraph>
              Sprint 2 Complete! Authentication system is working.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Next up: Plant management in Sprint 3
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              Get Started
            </Typography>
            <Typography variant="body1" paragraph>
              Create an account to start managing your plants
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<LockOpen />}
                onClick={() => navigate('/register')}
              >
                Sign Up
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
        )}
      </Box>
    </Container>
  );
}

export default HomePage;
