import { Card, CardContent, CardMedia, CardActions, Typography, IconButton, Chip, Box } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDeletePlant } from '../../hooks/usePlants';
import { getPhotoUrl } from '../../services/api';

export default function PlantCard({ plant }) {
  const navigate = useNavigate();
  const deletePlant = useDeletePlant();

  const handleEdit = () => {
    navigate(`/plants/${plant.id}/edit`);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${plant.name}"?`)) {
      deletePlant.mutate(plant.id);
    }
  };

  const handleCardClick = () => {
    navigate(`/plants/${plant.id}`);
  };

  // Default plant image if no photo
  const plantImage = getPhotoUrl(plant.photo_url) || 'https://via.placeholder.com/300x200?text=Plant';

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        }
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={plantImage}
        alt={plant.name}
        onClick={handleCardClick}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }} onClick={handleCardClick}>
        <Typography gutterBottom variant="h5" component="h2">
          {plant.name}
        </Typography>

        {plant.species && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <em>{plant.species}</em>
          </Typography>
        )}

        {plant.plant_type && (
          <Chip
            label={plant.plant_type}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ mb: 1 }}
          />
        )}

        {plant.location && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {plant.location}
            </Typography>
          </Box>
        )}

        {plant.notes && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {plant.notes.length > 100 ? `${plant.notes.substring(0, 100)}...` : plant.notes}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
        <IconButton
          size="small"
          color="primary"
          onClick={(e) => { e.stopPropagation(); handleEdit(); }}
          aria-label="edit plant"
        >
          <EditIcon />
        </IconButton>
        <IconButton
          size="small"
          color="error"
          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          aria-label="delete plant"
          disabled={deletePlant.isPending}
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}
