import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Chip,
  LinearProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Science as ScienceIcon,
  CloudDownload as DownloadIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
} from '@mui/icons-material';
import {
  useEnrichmentStats,
  useEnrichmentLogs,
  useCachedSpecies,
  useTriggerEnrichment,
} from '../hooks/useEnrichment';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ title, value, icon, color = 'primary' }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: `${color}.light`,
            color: `${color}.dark`,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const StatusChip = ({ status }) => {
  const statusConfig = {
    completed: { color: 'success', icon: <SuccessIcon fontSize="small" /> },
    running: { color: 'info', icon: <PendingIcon fontSize="small" /> },
    failed: { color: 'error', icon: <ErrorIcon fontSize="small" /> },
    pending: { color: 'warning', icon: <PendingIcon fontSize="small" /> },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Chip
      size="small"
      label={status}
      color={config.color}
      icon={config.icon}
      variant="outlined"
    />
  );
};

export default function EnrichmentPage() {
  const [speciesSearch, setSpeciesSearch] = useState('');

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useEnrichmentStats();
  const { data: logs, isLoading: logsLoading } = useEnrichmentLogs(10);
  const { data: cachedSpecies, isLoading: speciesLoading } = useCachedSpecies(
    speciesSearch || null,
    20
  );
  const triggerEnrichment = useTriggerEnrichment();

  const handleTriggerEnrichment = () => {
    triggerEnrichment.mutate(null);
  };

  const apiUsagePercent = stats
    ? Math.round((stats.today_api_requests / stats.api_request_limit) * 100)
    : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ScienceIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1">
              Data Enrichment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enhance plant data with care information from Perenual API
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={triggerEnrichment.isPending ? <CircularProgress size={20} /> : <DownloadIcon />}
          onClick={handleTriggerEnrichment}
          disabled={triggerEnrichment.isPending}
        >
          {triggerEnrichment.isPending ? 'Enriching...' : 'Run Enrichment'}
        </Button>
      </Box>

      {/* Stats Cards */}
      {statsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : stats ? (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Plants Needing Data"
              value={stats.plants_needing_enrichment}
              icon={<ScienceIcon />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Plants Enriched"
              value={stats.plants_enriched}
              icon={<SuccessIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Cached Species"
              value={stats.cached_species_count}
              icon={<DownloadIcon />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  API Usage Today
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.today_api_requests} / {stats.api_request_limit}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={apiUsagePercent}
                  color={apiUsagePercent > 80 ? 'error' : apiUsagePercent > 50 ? 'warning' : 'success'}
                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Alert severity="error" sx={{ mb: 4 }}>
          Failed to load enrichment statistics
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Recent Enrichment Runs */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Recent Enrichment Runs</Typography>
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                onClick={() => refetchStats()}
              >
                Refresh
              </Button>
            </Box>

            {logsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : logs && logs.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Enriched</TableCell>
                      <TableCell align="right">API Calls</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.run_date}</TableCell>
                        <TableCell>
                          <StatusChip status={log.status} />
                        </TableCell>
                        <TableCell align="right">
                          {log.plants_enriched} / {log.plants_processed}
                        </TableCell>
                        <TableCell align="right">
                          {log.api_requests_used}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No enrichment runs yet
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Cached Species */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Cached Species Data
            </Typography>

            <TextField
              fullWidth
              size="small"
              placeholder="Search species..."
              value={speciesSearch}
              onChange={(e) => setSpeciesSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {speciesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : cachedSpecies && cachedSpecies.length > 0 ? (
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Species</TableCell>
                      <TableCell>Care Level</TableCell>
                      <TableCell>Watering</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cachedSpecies.map((species) => (
                      <TableRow key={species.id}>
                        <TableCell>
                          <Typography variant="body2">
                            {species.common_name || species.scientific_name}
                          </Typography>
                          {species.common_name && species.scientific_name && (
                            <Typography variant="caption" color="text.secondary">
                              <em>{species.scientific_name}</em>
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {species.care_level && (
                            <Chip
                              size="small"
                              label={species.care_level}
                              color={
                                species.care_level === 'Low'
                                  ? 'success'
                                  : species.care_level === 'High'
                                  ? 'error'
                                  : 'warning'
                              }
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {species.watering_frequency_days
                            ? `Every ${species.watering_frequency_days} days`
                            : species.watering || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                {speciesSearch ? 'No species found matching your search' : 'No cached species yet'}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
