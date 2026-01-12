import {
  Container,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Grid,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  WaterDrop,
  Schedule,
  CheckCircle,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function WateringPreviewPage() {
  const navigate = useNavigate();

  // Mock data for preview
  const mockSchedule = {
    plantName: 'Monstera Deliciosa',
    frequencyDays: 7,
    lastWatered: 3,
    nextWatering: 4,
  };

  const mockTimeline = [
    { day: 'Mon', watered: true, date: 'Jan 6' },
    { day: 'Tue', watered: false, date: 'Jan 7' },
    { day: 'Wed', watered: false, date: 'Jan 8' },
    { day: 'Thu', watered: false, date: 'Jan 9' },
    { day: 'Fri', watered: false, date: 'Jan 10' },
    { day: 'Sat', watered: false, date: 'Jan 11', isToday: true },
    { day: 'Sun', watered: false, date: 'Jan 12' },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
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
        <WaterDrop sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Smart Watering
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
          Smart Watering creates custom schedules based on plant type and conditions.
          Never forget to water your plants again.
        </Typography>
      </Box>

      {/* Example Schedule Card */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Schedule color="primary" />
          Example Schedule
        </Typography>

        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">{mockSchedule.plantName}</Typography>
              <Chip
                icon={<WaterDrop />}
                label={`Every ${mockSchedule.frequencyDays} days`}
                color="primary"
                variant="outlined"
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="success.dark">Last Watered</Typography>
                  <Typography variant="h5" color="success.dark" fontWeight="bold">
                    {mockSchedule.lastWatered} days ago
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="info.dark">Next Watering</Typography>
                  <Typography variant="h5" color="info.dark" fontWeight="bold">
                    In {mockSchedule.nextWatering} days
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Progress bar */}
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption">Water cycle progress</Typography>
                <Typography variant="caption">{Math.round((mockSchedule.lastWatered / mockSchedule.frequencyDays) * 100)}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(mockSchedule.lastWatered / mockSchedule.frequencyDays) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Visual Timeline */}
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
          Weekly Timeline
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
          {mockTimeline.map((day, index) => (
            <Box
              key={index}
              sx={{
                flex: 1,
                textAlign: 'center',
                p: 1,
                borderRadius: 2,
                bgcolor: day.isToday ? 'primary.light' : day.watered ? 'success.light' : 'grey.100',
                border: day.isToday ? '2px solid' : 'none',
                borderColor: 'primary.main',
              }}
            >
              <Typography variant="caption" fontWeight={day.isToday ? 'bold' : 'normal'}>
                {day.day}
              </Typography>
              <Box sx={{ my: 0.5 }}>
                {day.watered ? (
                  <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
                ) : (
                  <WaterDrop sx={{ fontSize: 20, color: day.isToday ? 'primary.main' : 'grey.400' }} />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary">
                {day.date}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Benefits */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          What you get with Smart Watering
        </Typography>
        <Grid container spacing={2}>
          {[
            'Custom schedules for each plant',
            'Visual progress tracking',
            'Email reminders when it\'s time to water',
            'Watering history log',
          ].map((benefit, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2">{benefit}</Typography>
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
          Create a Watering Schedule
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Free account required
        </Typography>
      </Box>
    </Container>
  );
}
