import { Container, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCreatePlant } from '../hooks/usePlants';
import PlantForm from '../components/plants/PlantForm';
import BackButton from '../components/common/BackButton';

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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <BackButton to="/plants" />
        <Typography variant="h4">Add New Plant</Typography>
      </Box>
      <PlantForm
        onSubmit={handleSubmit}
        isLoading={createPlant.isPending}
        title="Plant Information"
      />
    </Container>
  );
}
