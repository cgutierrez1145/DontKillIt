import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  LocalHospital as DiagnoseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePlants } from '../hooks/usePlants';
import { getPhotoUrl } from '../services/api';

export default function DiagnosisSelectPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = usePlants();

  const plants = data?.plants || [];

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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DiagnoseIcon sx={{ fontSize: 40, color: 'error.main' }} />
          <Box>
            <Typography variant="h4" component="h1">
              Plant Diagnosis
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Select a plant to diagnose problems
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Empty State */}
      {plants.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '2px dashed',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h5" gutterBottom color="text.secondary">
            No plants to diagnose
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Add a plant first, then come back to diagnose any problems.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/plants/add')}
          >
            Add Your First Plant
          </Button>
        </Box>
      ) : (
        <>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Choose a plant to upload a photo and get AI-powered diagnosis of any issues.
          </Typography>

          <Grid container spacing={3}>
            {plants.map((plant) => (
              <Grid item xs={12} sm={6} md={4} key={plant.id}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(`/plants/${plant.id}/diagnosis`)}
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <CardMedia
                      component="img"
                      height="160"
                      image={getPhotoUrl(plant.photo_url) || 'https://via.placeholder.com/300x160?text=Plant'}
                      alt={plant.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {plant.name}
                      </Typography>
                      {plant.species && (
                        <Typography variant="body2" color="text.secondary">
                          <em>{plant.species}</em>
                        </Typography>
                      )}
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DiagnoseIcon />}
                        sx={{ mt: 2 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/plants/${plant.id}/diagnosis`);
                        }}
                      >
                        Diagnose
                      </Button>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
}
