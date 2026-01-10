import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import {
  WaterDrop as WaterIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { usePlants } from '../hooks/usePlants';
import {
  useWateringSchedule,
  useRecordWatering,
  useCreateWateringSchedule,
  useUpdateWateringSchedule,
} from '../hooks/useSchedules';
import { getPhotoUrl } from '../services/api';

function PlantWateringCard({ plant }) {
  const navigate = useNavigate();
  const { data: schedule, isLoading } = useWateringSchedule(plant.id);
  const recordWatering = useRecordWatering();
  const createSchedule = useCreateWateringSchedule();
  const updateSchedule = useUpdateWateringSchedule();

  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [frequency, setFrequency] = useState('');

  const handleWaterNow = () => {
    recordWatering.mutate({
      plantId: plant.id,
      wateringData: { notes: '' },
    });
  };

  const handleSaveSchedule = () => {
    const scheduleData = { frequency_days: parseInt(frequency) };
    if (schedule) {
      updateSchedule.mutate({ plantId: plant.id, scheduleData });
    } else {
      createSchedule.mutate({ plantId: plant.id, scheduleData });
    }
    setScheduleDialogOpen(false);
  };

  const openScheduleDialog = () => {
    setFrequency(schedule?.frequency_days?.toString() || '7');
    setScheduleDialogOpen(true);
  };

  const getDaysUntilNext = () => {
    if (!schedule?.next_watering_date) return null;
    const next = new Date(schedule.next_watering_date);
    const now = new Date();
    const diffTime = next - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntilNext();
  const isOverdue = daysUntil !== null && daysUntil < 0;
  const isDueToday = daysUntil === 0;
  const isDueSoon = daysUntil !== null && daysUntil > 0 && daysUntil <= 2;

  const plantImage = getPhotoUrl(plant.photo_url) || 'https://via.placeholder.com/100x100?text=Plant';

  return (
    <>
      <Card
        sx={{
          display: 'flex',
          mb: 2,
          cursor: 'pointer',
          transition: 'transform 0.2s',
          '&:hover': { transform: 'translateX(4px)' },
          borderLeft: 4,
          borderColor: isOverdue ? 'error.main' : isDueToday ? 'warning.main' : isDueSoon ? 'info.main' : 'success.main',
        }}
      >
        <CardMedia
          component="img"
          sx={{ width: 100, height: 100, objectFit: 'cover' }}
          image={plantImage}
          alt={plant.name}
          onClick={() => navigate(`/plants/${plant.id}`)}
        />
        <CardContent sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box onClick={() => navigate(`/plants/${plant.id}`)}>
            <Typography variant="h6" component="div">
              {plant.name}
            </Typography>
            {isLoading ? (
              <CircularProgress size={16} />
            ) : schedule ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip
                  size="small"
                  icon={isOverdue ? <WarningIcon /> : <ScheduleIcon />}
                  label={
                    isOverdue
                      ? `${Math.abs(daysUntil)} days overdue`
                      : isDueToday
                      ? 'Due today'
                      : `Due in ${daysUntil} days`
                  }
                  color={isOverdue ? 'error' : isDueToday ? 'warning' : isDueSoon ? 'info' : 'success'}
                />
                <Typography variant="caption" color="text.secondary">
                  Every {schedule.frequency_days} days
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No schedule set
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ScheduleIcon />}
              onClick={(e) => { e.stopPropagation(); openScheduleDialog(); }}
            >
              {schedule ? 'Edit' : 'Set'}
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<WaterIcon />}
              onClick={(e) => { e.stopPropagation(); handleWaterNow(); }}
              disabled={recordWatering.isPending}
            >
              Water
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)}>
        <DialogTitle>
          {schedule ? 'Edit' : 'Set'} Watering Schedule for {plant.name}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Water every X days"
            type="number"
            fullWidth
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            inputProps={{ min: 1, max: 365 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveSchedule} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function WateringSchedulePage() {
  const { data, isLoading, isError } = usePlants();
  const plants = data?.plants || [];

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Failed to load plants</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <WaterIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" component="h1">
            Watering Schedule
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage watering for all your plants
          </Typography>
        </Box>
      </Box>

      {plants.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No plants yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add your first plant to start tracking watering schedules
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            href="/plants/add"
          >
            Add Plant
          </Button>
        </Paper>
      ) : (
        <>
          {/* Summary */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'white' }}>
            <Typography variant="h6">
              {plants.length} plant{plants.length !== 1 ? 's' : ''} in your collection
            </Typography>
          </Paper>

          {/* Plant List */}
          {plants.map((plant) => (
            <PlantWateringCard key={plant.id} plant={plant} />
          ))}
        </>
      )}
    </Container>
  );
}
