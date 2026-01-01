import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from '@mui/material';
import { Opacity as WaterIcon, LocalFlorist as FeedIcon, Add as AddIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import {
  useWateringSchedule,
  useFeedingSchedule,
  useCreateWateringSchedule,
  useCreateFeedingSchedule,
  useUpdateWateringSchedule,
  useUpdateFeedingSchedule,
  useRecordWatering,
  useRecordFeeding,
} from '../../hooks/useSchedules';

function ScheduleSection({ title, icon: Icon, schedule, isLoading, onCreate, onUpdate, onRecord, type }) {
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [recordDialog, setRecordDialog] = useState(false);
  const [frequencyDays, setFrequencyDays] = useState(schedule?.frequency_days || 7);
  const [notes, setNotes] = useState('');

  const handleSaveSchedule = () => {
    if (schedule) {
      onUpdate({ frequency_days: frequencyDays });
    } else {
      onCreate({ frequency_days: frequencyDays });
    }
    setScheduleDialog(false);
  };

  const handleRecordEvent = () => {
    onRecord({ notes: notes.trim() || null });
    setNotes('');
    setRecordDialog(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  const hasSchedule = !!schedule;
  const isOverdue = schedule?.next_watering || schedule?.next_feeding;
  const nextDate = type === 'watering' ? schedule?.next_watering : schedule?.next_feeding;
  const lastDate = type === 'watering' ? schedule?.last_watered : schedule?.last_fed;

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Icon sx={{ mr: 1, color: type === 'watering' ? 'primary.main' : 'secondary.main' }} />
          <Typography variant="h6">{title}</Typography>
        </Box>

        {!hasSchedule ? (
          <Box sx={{ textAlign: 'center', py: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              No schedule set
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => {
                setFrequencyDays(type === 'watering' ? 7 : 14);
                setScheduleDialog(true);
              }}
            >
              Create Schedule
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Frequency</Typography>
              <Typography variant="body1" fontWeight="medium">
                Every {schedule.frequency_days} day{schedule.frequency_days !== 1 ? 's' : ''}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Last {type === 'watering' ? 'Watered' : 'Fed'}</Typography>
              <Typography variant="body1" fontWeight="medium">
                {lastDate ? format(parseISO(lastDate), 'MMM d, yyyy') : 'Never'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Next {type === 'watering' ? 'Watering' : 'Feeding'}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Typography variant="body1" fontWeight="medium">
                  {nextDate ? format(parseISO(nextDate), 'MMM d, yyyy') : 'Not scheduled'}
                </Typography>
                {nextDate && new Date(nextDate) < new Date() && (
                  <Chip label="Overdue" color="error" size="small" />
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setRecordDialog(true)}
                  color={type === 'watering' ? 'primary' : 'secondary'}
                >
                  Record {type === 'watering' ? 'Watering' : 'Feeding'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setFrequencyDays(schedule.frequency_days);
                    setScheduleDialog(true);
                  }}
                >
                  Edit Schedule
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialog} onClose={() => setScheduleDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{hasSchedule ? 'Edit' : 'Create'} {title} Schedule</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Frequency (days)"
            type="number"
            fullWidth
            value={frequencyDays}
            onChange={(e) => setFrequencyDays(parseInt(e.target.value) || 1)}
            inputProps={{ min: 1, max: 365 }}
            helperText={`${type === 'watering' ? 'Water' : 'Feed'} every ${frequencyDays} day${frequencyDays !== 1 ? 's' : ''}`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveSchedule} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Record Event Dialog */}
      <Dialog open={recordDialog} onClose={() => setRecordDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Record {title}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Notes (optional)"
            multiline
            rows={3}
            fullWidth
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={`Add any notes about this ${type}...`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setNotes(''); setRecordDialog(false); }}>Cancel</Button>
          <Button onClick={handleRecordEvent} variant="contained">
            Record
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function ScheduleCard({ plantId }) {
  const { data: wateringSchedule, isLoading: wateringLoading } = useWateringSchedule(plantId);
  const { data: feedingSchedule, isLoading: feedingLoading } = useFeedingSchedule(plantId);

  const createWatering = useCreateWateringSchedule();
  const updateWatering = useUpdateWateringSchedule();
  const recordWatering = useRecordWatering();

  const createFeeding = useCreateFeedingSchedule();
  const updateFeeding = useUpdateFeedingSchedule();
  const recordFeeding = useRecordFeeding();

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Care Schedule
        </Typography>

        <ScheduleSection
          title="Watering"
          icon={WaterIcon}
          schedule={wateringSchedule}
          isLoading={wateringLoading}
          type="watering"
          onCreate={(data) => createWatering.mutate({ plantId, scheduleData: data })}
          onUpdate={(data) => updateWatering.mutate({ plantId, scheduleData: data })}
          onRecord={(data) => recordWatering.mutate({ plantId, wateringData: data })}
        />

        <ScheduleSection
          title="Feeding"
          icon={FeedIcon}
          schedule={feedingSchedule}
          isLoading={feedingLoading}
          type="feeding"
          onCreate={(data) => createFeeding.mutate({ plantId, scheduleData: data })}
          onUpdate={(data) => updateFeeding.mutate({ plantId, scheduleData: data })}
          onRecord={(data) => recordFeeding.mutate({ plantId, feedingData: data })}
        />
      </CardContent>
    </Card>
  );
}
