import {
  Container,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Notifications,
  Email,
  WaterDrop,
  Grass,
  CalendarMonth,
  CheckCircle,
  ArrowBack,
  NotificationsActive,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function RemindersPreviewPage() {
  const navigate = useNavigate();

  const reminderTypes = [
    {
      icon: <WaterDrop />,
      title: 'Watering Reminders',
      description: 'Get notified when each plant needs water based on its custom schedule.',
      color: 'primary',
      example: 'Time to water your Monstera!',
    },
    {
      icon: <Grass />,
      title: 'Feeding Reminders',
      description: 'Never miss a feeding with scheduled fertilizer notifications.',
      color: 'success',
      example: 'Your Pothos is due for feeding',
    },
    {
      icon: <CalendarMonth />,
      title: 'Seasonal Care',
      description: 'Receive tips when seasons change to adjust your plant care routine.',
      color: 'warning',
      example: 'Winter tip: Reduce watering frequency',
    },
  ];

  const mockNotifications = [
    {
      icon: <WaterDrop />,
      title: 'Time to water your Monstera!',
      time: '9:00 AM',
      color: 'primary.main',
    },
    {
      icon: <Grass />,
      title: 'Your Pothos is due for feeding',
      time: '10:30 AM',
      color: 'success.main',
    },
    {
      icon: <WaterDrop />,
      title: 'Snake Plant needs water tomorrow',
      time: 'Yesterday',
      color: 'info.main',
    },
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
        <Notifications sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Email Reminders
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
          Get timely notifications so you never forget to care for your plants.
          We'll remind you exactly when each plant needs attention.
        </Typography>
      </Box>

      {/* Reminder Types */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Types of Reminders
        </Typography>

        <Grid container spacing={2}>
          {reminderTypes.map((type, index) => (
            <Grid item xs={12} key={index}>
              <Card variant="outlined">
                <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Avatar sx={{ bgcolor: `${type.color}.light`, color: `${type.color}.main` }}>
                    {type.icon}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {type.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {type.description}
                    </Typography>
                    <Chip
                      size="small"
                      label={`Example: "${type.example}"`}
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Mock Notification Preview */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsActive color="primary" />
          Notification Preview
        </Typography>

        <Box
          sx={{
            bgcolor: 'grey.100',
            borderRadius: 2,
            p: 2,
            border: '1px solid',
            borderColor: 'grey.300',
          }}
        >
          {/* Mock phone notification style */}
          <Box sx={{ maxWidth: 350, mx: 'auto' }}>
            {mockNotifications.map((notification, index) => (
              <Card
                key={index}
                sx={{
                  mb: 1.5,
                  boxShadow: 2,
                  '&:last-child': { mb: 0 },
                }}
              >
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: notification.color,
                      }}
                    >
                      {notification.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Don't Kill It!
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.time}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="medium">
                        {notification.title}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Email Preview */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Email color="primary" />
          Email Reminder Preview
        </Typography>

        <Card variant="outlined" sx={{ bgcolor: 'white' }}>
          <CardContent>
            <Box sx={{ borderBottom: '1px solid', borderColor: 'grey.200', pb: 2, mb: 2 }}>
              <Typography variant="caption" color="text.secondary">From:</Typography>
              <Typography variant="body2">Don't Kill It! &lt;reminders@dontkill.it&gt;</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Subject:</Typography>
              <Typography variant="body2" fontWeight="medium">
                Time to water your Monstera!
              </Typography>
            </Box>

            <Typography variant="body2" paragraph>
              Hi there!
            </Typography>
            <Typography variant="body2" paragraph>
              Your <strong>Monstera Deliciosa</strong> is ready for watering. It's been 7 days since the last watering.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Quick tip:</strong> Check the top inch of soil - if it's dry, go ahead and water thoroughly until it drains from the bottom.
            </Typography>
            <Button variant="contained" size="small" disabled>
              Mark as Watered
            </Button>
          </CardContent>
        </Card>
      </Paper>

      {/* Benefits */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          What you get with Reminders
        </Typography>
        <Grid container spacing={2}>
          {[
            'Customizable reminder times',
            'Per-plant notification settings',
            'Email and in-app alerts',
            'Quiet hours support',
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
          color="warning"
          onClick={() => navigate('/register')}
          sx={{ px: 4 }}
        >
          Enable Reminders
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Free account required
        </Typography>
      </Box>
    </Container>
  );
}
