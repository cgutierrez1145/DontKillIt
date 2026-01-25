import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import BackButton from '../components/common/BackButton';
import {
  ExpandMore as ExpandMoreIcon,
  WaterDrop as WaterIcon,
  WbSunny as SunIcon,
  Thermostat as TempIcon,
  Grass as SoilIcon,
  BugReport as PestIcon,
  Spa as PlantIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

const careTips = [
  {
    id: 'watering',
    title: 'Watering Tips',
    icon: WaterIcon,
    color: '#2196f3',
    tips: [
      'Check soil moisture before watering - stick your finger 1-2 inches into the soil',
      'Water thoroughly until it drains from the bottom',
      'Empty saucers after 30 minutes to prevent root rot',
      'Most plants prefer room temperature water',
      'Water less frequently in winter when growth slows',
      'Morning watering is ideal - leaves dry before evening',
    ],
  },
  {
    id: 'light',
    title: 'Light Requirements',
    icon: SunIcon,
    color: '#ff9800',
    tips: [
      'South-facing windows provide the most light',
      'Rotate plants weekly for even growth',
      'Yellow leaves may indicate too much direct sun',
      'Leggy growth often means insufficient light',
      'Most houseplants prefer bright, indirect light',
      'Supplement with grow lights in darker months',
    ],
  },
  {
    id: 'temperature',
    title: 'Temperature & Humidity',
    icon: TempIcon,
    color: '#f44336',
    tips: [
      'Most houseplants thrive between 65-75°F (18-24°C)',
      'Avoid placing plants near heating/cooling vents',
      'Group plants together to increase humidity',
      'Use pebble trays or humidifiers for tropical plants',
      'Keep plants away from cold drafts and windows in winter',
      'Misting can help but isn\'t a substitute for proper humidity',
    ],
  },
  {
    id: 'soil',
    title: 'Soil & Potting',
    icon: SoilIcon,
    color: '#8bc34a',
    tips: [
      'Use well-draining potting mix appropriate for your plant type',
      'Repot when roots grow out of drainage holes',
      'Spring is the best time for repotting',
      'Go only 1-2 inches larger when sizing up pots',
      'Ensure pots have drainage holes',
      'Add perlite to improve drainage in heavy soils',
    ],
  },
  {
    id: 'pests',
    title: 'Pest Prevention',
    icon: PestIcon,
    color: '#9c27b0',
    tips: [
      'Inspect new plants before bringing them home',
      'Quarantine new plants for 2 weeks',
      'Check undersides of leaves regularly',
      'Wipe leaves with neem oil solution monthly',
      'Isolate infected plants immediately',
      'Yellow sticky traps help monitor for flying pests',
    ],
  },
  {
    id: 'general',
    title: 'General Care',
    icon: PlantIcon,
    color: '#4caf50',
    tips: [
      'Remove dead or yellowing leaves promptly',
      'Clean leaves regularly to improve photosynthesis',
      'Fertilize during growing season (spring/summer)',
      'Learn your specific plant\'s needs - they vary!',
      'Be patient - plants take time to adjust to new environments',
      'Consistency is key - establish a regular care routine',
    ],
  },
];

export default function CareTipsPage() {
  const [expanded, setExpanded] = useState('watering');

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 4 }}>
        <BackButton />
        <Box sx={{ textAlign: 'center', flexGrow: 1 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Plant Care Tips
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Essential tips to keep your plants healthy and thriving
          </Typography>
        </Box>
      </Box>

      {/* Quick Tips Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {careTips.map((category) => {
          const Icon = category.icon;
          return (
            <Grid item xs={6} sm={4} md={2} key={category.id}>
              <Card
                sx={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                  border: expanded === category.id ? 2 : 0,
                  borderColor: category.color,
                }}
                onClick={() => setExpanded(category.id)}
              >
                <CardContent>
                  <Icon sx={{ fontSize: 40, color: category.color, mb: 1 }} />
                  <Typography variant="body2" fontWeight="medium">
                    {category.title.split(' ')[0]}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Detailed Tips Accordions */}
      <Paper elevation={2}>
        {careTips.map((category) => {
          const Icon = category.icon;
          return (
            <Accordion
              key={category.id}
              expanded={expanded === category.id}
              onChange={handleChange(category.id)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Icon sx={{ color: category.color }} />
                  <Typography variant="h6">{category.title}</Typography>
                  <Chip
                    label={`${category.tips.length} tips`}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {category.tips.map((tip, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckIcon sx={{ color: category.color }} />
                      </ListItemIcon>
                      <ListItemText primary={tip} />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Paper>

      {/* Pro Tip */}
      <Paper
        sx={{
          mt: 4,
          p: 3,
          background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Pro Tip
        </Typography>
        <Typography>
          The most common cause of houseplant death is overwatering. When in doubt,
          wait a day or two before watering. Most plants recover better from being
          slightly dry than from sitting in soggy soil.
        </Typography>
      </Paper>
    </Container>
  );
}
