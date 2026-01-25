import { Container, Typography, Grid, Box } from '@mui/material';
import NotificationSettings from '../components/notifications/NotificationSettings';
import BackButton from '../components/common/BackButton';

const SettingsPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <BackButton />
        <Typography variant="h4">
          Settings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <NotificationSettings />
        </Grid>
      </Grid>
    </Container>
  );
};

export default SettingsPage;
