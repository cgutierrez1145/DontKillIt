import { Container, Typography, Box, Paper } from '@mui/material';
import { Spa } from '@mui/icons-material';

function HomePage() {
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

        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome to Sprint 1! 🚀
          </Typography>
          <Typography variant="body1" paragraph>
            The foundation is ready. Backend API is running at http://localhost:8000
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Next up: Authentication system in Sprint 2
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default HomePage;
