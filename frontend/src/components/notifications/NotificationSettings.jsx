import {
  Card,
  CardContent,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Divider,
  Box,
  TextField,
  Grid,
  Alert
} from '@mui/material';
import { useNotificationPreferences } from '../../hooks/useNotificationPreferences';
import { usePushNotifications } from '../../hooks/usePushNotifications';

const NotificationSettings = () => {
  const { preferences, updatePreferences } = useNotificationPreferences();
  const { permissionStatus, requestPermission } = usePushNotifications();

  const handleToggle = (field) => {
    if (preferences) {
      updatePreferences({ [field]: !preferences[field] });
    }
  };

  const handleTimeChange = (field, value) => {
    updatePreferences({ [field]: value });
  };

  if (!preferences) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Notification Settings
        </Typography>

        {permissionStatus === 'denied' && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Push notifications are disabled. Please enable them in your device settings.
          </Alert>
        )}

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Notification Channels
        </Typography>

        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={preferences.push_enabled}
                onChange={() => handleToggle('push_enabled')}
              />
            }
            label="Push Notifications (Mobile)"
          />
          <FormControlLabel
            control={
              <Switch
                checked={preferences.in_app_enabled}
                onChange={() => handleToggle('in_app_enabled')}
              />
            }
            label="In-App Notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={preferences.email_enabled}
                onChange={() => handleToggle('email_enabled')}
                disabled
              />
            }
            label="Email Notifications (Coming Soon)"
          />
        </FormGroup>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Notification Types
        </Typography>

        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={preferences.watering_reminders}
                onChange={() => handleToggle('watering_reminders')}
              />
            }
            label="Watering Reminders"
          />
          <FormControlLabel
            control={
              <Switch
                checked={preferences.feeding_reminders}
                onChange={() => handleToggle('feeding_reminders')}
              />
            }
            label="Feeding Reminders"
          />
          <FormControlLabel
            control={
              <Switch
                checked={preferences.diagnosis_alerts}
                onChange={() => handleToggle('diagnosis_alerts')}
              />
            }
            label="Plant Health Alerts"
          />
          <FormControlLabel
            control={
              <Switch
                checked={preferences.system_notifications}
                onChange={() => handleToggle('system_notifications')}
              />
            }
            label="System Notifications"
          />
        </FormGroup>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Quiet Hours
        </Typography>

        <Box sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Start Time"
                type="time"
                value={preferences.quiet_hours_start || ''}
                onChange={(e) => handleTimeChange('quiet_hours_start', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="End Time"
                type="time"
                value={preferences.quiet_hours_end || ''}
                onChange={(e) => handleTimeChange('quiet_hours_end', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
