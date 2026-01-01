import { Container, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCreatePlant } from '../hooks/usePlants';
import PlantForm from '../components/plants/PlantForm';

export default function AddPlantPage() {
  const navigate = useNavigate();
  const createPlant = useCreatePlant();

  const handleSubmit = async (plantData) => {
    createPlant.mutate(plantData, {
      onSuccess: () => {
        navigate('/plants');
      },
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Add New Plant
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track a new plant in your collection
        </Typography>
      </Box>

      <PlantForm
        onSubmit={handleSubmit}
        isLoading={createPlant.isPending}
        title="New Plant Information"
      />
    </Container>
  );
}
