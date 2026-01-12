import {
  Container,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
} from '@mui/material';
import {
  LocalHospital,
  CameraAlt,
  Search,
  Healing,
  CheckCircle,
  ArrowBack,
  BugReport,
  WaterDrop,
  WbSunny,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function DiagnosisPreviewPage() {
  const navigate = useNavigate();

  const howItWorks = [
    {
      label: 'Upload a photo',
      description: 'Take a clear photo of the affected leaf or area of your plant.',
      icon: <CameraAlt />,
    },
    {
      label: 'AI Analysis',
      description: 'Our system analyzes the image to identify potential issues.',
      icon: <Search />,
    },
    {
      label: 'Get diagnosis',
      description: 'Receive a detailed diagnosis with treatment recommendations.',
      icon: <Healing />,
    },
  ];

  const commonProblems = [
    {
      name: 'Yellow Leaves',
      causes: ['Overwatering', 'Nutrient deficiency', 'Too little light'],
      icon: <WaterDrop sx={{ color: 'warning.main' }} />,
      severity: 'Common',
    },
    {
      name: 'Brown Leaf Tips',
      causes: ['Low humidity', 'Underwatering', 'Salt buildup'],
      icon: <WbSunny sx={{ color: 'error.main' }} />,
      severity: 'Common',
    },
    {
      name: 'Pest Infestation',
      causes: ['Spider mites', 'Mealybugs', 'Fungus gnats'],
      icon: <BugReport sx={{ color: 'error.main' }} />,
      severity: 'Serious',
    },
  ];

  // Mock diagnosis result
  const mockDiagnosis = {
    plantName: 'Monstera Deliciosa',
    issue: 'Overwatering',
    confidence: 87,
    symptoms: ['Yellow leaves', 'Soft stems', 'Musty soil smell'],
    treatment: [
      'Allow soil to dry completely before watering',
      'Check drainage holes are not blocked',
      'Consider repotting with fresh, well-draining soil',
      'Remove any rotted roots',
    ],
  };

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
        <LocalHospital sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Plant Diagnosis
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
          Upload a photo and get instant analysis of what's wrong with your plant,
          plus treatment recommendations.
        </Typography>
      </Box>

      {/* How It Works */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          How It Works
        </Typography>

        <Stepper orientation="vertical">
          {howItWorks.map((step, index) => (
            <Step key={index} active={true}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {step.icon}
                  </Box>
                )}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  {step.label}
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Example Diagnosis Result */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Example Diagnosis Result
        </Typography>

        <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Plant Identified
                </Typography>
                <Typography variant="h6">{mockDiagnosis.plantName}</Typography>
              </Box>
              <Chip
                label={`${mockDiagnosis.confidence}% confidence`}
                color="success"
                size="small"
              />
            </Box>

            <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
              <Typography variant="subtitle2" color="error.dark">
                Issue Detected
              </Typography>
              <Typography variant="h5" color="error.dark" fontWeight="bold">
                {mockDiagnosis.issue}
              </Typography>
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Symptoms Found:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {mockDiagnosis.symptoms.map((symptom, index) => (
                <Chip key={index} label={symptom} size="small" variant="outlined" />
              ))}
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Recommended Treatment:
            </Typography>
            <Box component="ol" sx={{ pl: 2, m: 0 }}>
              {mockDiagnosis.treatment.map((step, index) => (
                <Typography component="li" variant="body2" key={index} sx={{ mb: 0.5 }}>
                  {step}
                </Typography>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Paper>

      {/* Common Problems */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Common Plant Problems We Detect
        </Typography>
        <Grid container spacing={2}>
          {commonProblems.map((problem, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {problem.icon}
                    <Typography variant="subtitle2" fontWeight="medium">
                      {problem.name}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Common causes:
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {problem.causes.map((cause, i) => (
                      <Typography key={i} variant="body2" sx={{ fontSize: '0.75rem' }}>
                        • {cause}
                      </Typography>
                    ))}
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
          What you get with Plant Diagnosis
        </Typography>
        <Grid container spacing={2}>
          {[
            'AI-powered image analysis',
            'Detailed treatment plans',
            'Save diagnosis history',
            'Track plant health over time',
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
          color="error"
          onClick={() => navigate('/register')}
          sx={{ px: 4 }}
        >
          Diagnose Your Plant
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Create an account to save results & get treatment steps
        </Typography>
      </Box>
    </Container>
  );
}
