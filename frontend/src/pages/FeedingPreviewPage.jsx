import {
  Container,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Grass,
  Schedule,
  CheckCircle,
  Warning,
  Lightbulb,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function FeedingPreviewPage() {
  const navigate = useNavigate();

  // Mock feeding history
  const mockHistory = [
    { date: 'Jan 5, 2026', plant: 'Monstera', fertilizer: 'All-purpose', amount: '1/2 strength' },
    { date: 'Dec 22, 2025', plant: 'Pothos', fertilizer: 'Liquid feed', amount: 'Full strength' },
    { date: 'Dec 15, 2025', plant: 'Snake Plant', fertilizer: 'Succulent mix', amount: '1/4 strength' },
    { date: 'Dec 8, 2025', plant: 'Monstera', fertilizer: 'All-purpose', amount: '1/2 strength' },
  ];

  const tips = [
    {
      icon: <Warning color="warning" />,
      title: 'Overfeeding is worse than underfeeding',
      description: 'Too much fertilizer can burn roots and damage your plant. When in doubt, dilute more.',
    },
    {
      icon: <Schedule color="info" />,
      title: 'Reduce feeding in winter',
      description: 'Most houseplants go dormant in winter and need little to no fertilizer.',
    },
    {
      icon: <Lightbulb color="success" />,
      title: 'Water before feeding',
      description: 'Always water your plant first to prevent fertilizer burn on dry roots.',
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
        <Grass sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Feeding Tracker
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
          Keep your plants thriving with proper nutrition tracking and personalized feeding schedules.
        </Typography>
      </Box>

      {/* General Guidance */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          General Feeding Guidelines
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <Typography variant="h3" color="primary.main" fontWeight="bold">4-6</Typography>
              <Typography variant="body2" color="text.secondary">
                weeks between feedings for most houseplants
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <Typography variant="h3" color="success.main" fontWeight="bold">50%</Typography>
              <Typography variant="body2" color="text.secondary">
                strength recommended for indoor plants
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <Typography variant="h3" color="warning.main" fontWeight="bold">0</Typography>
              <Typography variant="body2" color="text.secondary">
                feedings needed in winter dormancy
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Pro tip:</strong> Most houseplants need fertilizer every 4-6 weeks during the growing season (spring through fall).
        </Alert>
      </Paper>

      {/* Sample History */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Schedule color="primary" />
          Sample Feeding History
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Plant</TableCell>
                <TableCell>Fertilizer</TableCell>
                <TableCell>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockHistory.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.plant}</TableCell>
                  <TableCell>
                    <Chip label={entry.fertilizer} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{entry.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Tips */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Feeding Tips
        </Typography>
        <Grid container spacing={2}>
          {tips.map((tip, index) => (
            <Grid item xs={12} key={index}>
              <Card variant="outlined">
                <CardContent sx={{ display: 'flex', gap: 2, py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  {tip.icon}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="medium">
                      {tip.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tip.description}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Benefits */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          What you get with Feeding Tracker
        </Typography>
        <Grid container spacing={2}>
          {[
            'Track feeding dates and amounts',
            'Set reminders for each plant',
            'Log fertilizer types used',
            'View complete feeding history',
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
          color="success"
          onClick={() => navigate('/register')}
          sx={{ px: 4 }}
        >
          Track Feeding for Your Plants
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Free account required
        </Typography>
      </Box>
    </Container>
  );
}
