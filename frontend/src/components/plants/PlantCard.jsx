import { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDeletePlant } from '../../hooks/usePlants';
import { getPhotoUrl } from '../../services/api';

export default function PlantCard({ plant }) {
  const navigate = useNavigate();
  const deletePlant = useDeletePlant();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEdit = () => {
    navigate(`/plants/${plant.id}/edit`);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    deletePlant.mutate(plant.id);
    setDeleteDialogOpen(false);
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
          onClick={(e) => { e.stopPropagation(); handleDeleteClick(); }}
          aria-label="delete plant"
          disabled={deletePlant.isPending}
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Plant
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{plant.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deletePlant.isPending}
          >
            {deletePlant.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
