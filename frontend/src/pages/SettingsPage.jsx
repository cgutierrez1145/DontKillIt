import { Container, Typography, Grid } from '@mui/material';
import NotificationSettings from '../components/notifications/NotificationSettings';

const SettingsPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <NotificationSettings />
        </Grid>
      </Grid>
    </Container>
  );
};

export default SettingsPage;
