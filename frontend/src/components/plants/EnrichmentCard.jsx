import {
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  WaterDrop,
  WbSunny,
  Thermostat,
  Grass,
  Science,
  Person,
  LocalFlorist,
  Public,
  ContentCut,
  Speed,
  Build,
  Loop,
} from '@mui/icons-material';
import PetSafetyIndicator, { DogIcon, CatIcon, ToxicityHelpButton } from '../common/PetSafetyIndicator';

const InfoItem = ({ icon, label, value, tooltip }) => {
  if (!value) return null;

  const content = (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
      <Box sx={{ color: 'primary.main', mt: 0.3 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body2">{value}</Typography>
      </Box>
    </Box>
  );

  return tooltip ? <Tooltip title={tooltip}>{content}</Tooltip> : content;
};

const StatusChip = ({ label, value, color = 'default' }) => {
  if (!value) return null;
  return (
    <Chip
      size="small"
      label={`${label}: ${value}`}
      color={color}
      variant="outlined"
      sx={{ mr: 0.5, mb: 0.5 }}
    />
  );
};

export default function EnrichmentCard({ enrichment }) {
  if (!enrichment) {
    return null;
  }

  // Calculate completeness
  const completenessFields = [
    enrichment.has_watering_data,
    enrichment.has_sunlight_data,
    enrichment.has_care_level_data,
    enrichment.has_toxicity_data,
    enrichment.has_soil_data,
    enrichment.has_description,
  ];
  const completeness = Math.round(
    (completenessFields.filter(Boolean).length / completenessFields.length) * 100
  );

  // Format watering info
  const wateringInfo = enrichment.watering_category
    ? enrichment.watering_benchmark_value
      ? `${enrichment.watering_category} (every ${enrichment.watering_benchmark_value} ${enrichment.watering_benchmark_unit || 'days'})`
      : enrichment.watering_category
    : null;

  // Format hardiness zones
  const hardinessZone =
    enrichment.hardiness_min && enrichment.hardiness_max
      ? `Zones ${enrichment.hardiness_min}-${enrichment.hardiness_max}`
      : enrichment.hardiness_min || enrichment.hardiness_max
      ? `Zone ${enrichment.hardiness_min || enrichment.hardiness_max}`
      : null;

  // Format origin
  const originText = enrichment.origin?.length > 0 ? enrichment.origin.join(', ') : null;

  // Format propagation methods
  const propagationText =
    enrichment.propagation_methods?.length > 0
      ? enrichment.propagation_methods.join(', ')
      : null;

  // Format soil types
  const soilText = enrichment.soil_types?.length > 0 ? enrichment.soil_types.join(', ') : null;

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Science color="primary" />
          Plant Care Data
        </Typography>
        <Tooltip title={`Data completeness: ${completeness}%`}>
          <Box sx={{ width: 100 }}>
            <LinearProgress
              variant="determinate"
              value={completeness}
              color={completeness >= 80 ? 'success' : completeness >= 50 ? 'warning' : 'error'}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        </Tooltip>
      </Box>

      {enrichment.description && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {enrichment.description}
          </Typography>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Quick stats chips */}
      <Box sx={{ mb: 2 }}>
        <StatusChip
          label="Care Level"
          value={enrichment.care_level}
          color={
            enrichment.care_level === 'Low'
              ? 'success'
              : enrichment.care_level === 'High'
              ? 'error'
              : 'warning'
          }
        />
        <StatusChip label="Growth" value={enrichment.growth_rate} />
        <StatusChip label="Maintenance" value={enrichment.maintenance} />
        <StatusChip label="Cycle" value={enrichment.cycle} />
        {enrichment.drought_tolerant && (
          <Chip
            size="small"
            label="Drought Tolerant"
            color="info"
            variant="outlined"
            sx={{ mr: 0.5, mb: 0.5 }}
          />
        )}
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <InfoItem
            icon={<WaterDrop fontSize="small" />}
            label="Watering"
            value={wateringInfo}
            tooltip="How often this plant needs water"
          />

          <InfoItem
            icon={<Grass fontSize="small" />}
            label="Soil Type"
            value={soilText}
          />

          <InfoItem
            icon={<Thermostat fontSize="small" />}
            label="Hardiness"
            value={hardinessZone}
            tooltip="USDA Plant Hardiness Zones"
          />

          <InfoItem
            icon={<LocalFlorist fontSize="small" />}
            label="Flowering Season"
            value={enrichment.flowering_season}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <InfoItem
            icon={<Public fontSize="small" />}
            label="Origin"
            value={originText}
          />

          <InfoItem
            icon={<ContentCut fontSize="small" />}
            label="Propagation"
            value={propagationText}
          />

          {/* Toxicity info */}
          {(enrichment.poisonous_to_pets !== null || enrichment.poisonous_to_humans !== null) && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                Toxicity
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                {enrichment.poisonous_to_pets !== null && (
                  <>
                    <Chip
                      size="small"
                      icon={<Box sx={{ display: 'flex', ml: 0.5 }}><DogIcon size={16} color={enrichment.poisonous_to_pets ? '#d32f2f' : '#2e7d32'} /></Box>}
                      label={enrichment.poisonous_to_pets ? 'Toxic to Dogs' : 'Dog Safe'}
                      color={enrichment.poisonous_to_pets ? 'error' : 'success'}
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      icon={<Box sx={{ display: 'flex', ml: 0.5 }}><CatIcon size={16} color={enrichment.poisonous_to_pets ? '#d32f2f' : '#2e7d32'} /></Box>}
                      label={enrichment.poisonous_to_pets ? 'Toxic to Cats' : 'Cat Safe'}
                      color={enrichment.poisonous_to_pets ? 'error' : 'success'}
                      variant="outlined"
                    />
                    <ToxicityHelpButton isSafe={!enrichment.poisonous_to_pets} size="small" />
                  </>
                )}
                {enrichment.poisonous_to_humans !== null && (
                  <Chip
                    size="small"
                    icon={<Person />}
                    label={enrichment.poisonous_to_humans ? 'Toxic to Humans' : 'Human Safe'}
                    color={enrichment.poisonous_to_humans ? 'error' : 'success'}
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Scientific name if different from common */}
      {enrichment.scientific_name && (
        <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Scientific name: <em>{enrichment.scientific_name}</em>
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
