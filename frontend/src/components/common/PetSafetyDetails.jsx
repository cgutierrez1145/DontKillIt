import { Box, Paper, Typography, Divider } from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon, Warning as WarningIcon } from '@mui/icons-material';
import { DogIcon, CatIcon } from './PetSafetyIndicator';

// Toxicity descriptions based on common plant toxicity information
const getToxicityInfo = (isSafe, species) => {
  if (isSafe) {
    return {
      dog: {
        title: 'Safe for Dogs',
        description: 'This plant is considered non-toxic to dogs. If your dog chews or ingests parts of this plant, it should not cause any serious health issues.',
        details: 'While generally safe, some dogs may still experience mild stomach upset if they eat large quantities. Monitor your pet and ensure they don\'t make a habit of eating plants.',
      },
      cat: {
        title: 'Safe for Cats',
        description: 'This plant is considered non-toxic to cats. Cats can safely be around this plant without risk of poisoning.',
        details: 'Even though this plant is non-toxic, cats may still experience minor digestive upset if they chew on leaves. This is normal and usually resolves on its own.',
      },
    };
  } else {
    return {
      dog: {
        title: 'Toxic to Dogs',
        description: 'This plant contains compounds that are harmful to dogs. Ingestion can cause adverse health effects ranging from mild to severe.',
        details: 'Common symptoms include: vomiting, diarrhea, excessive drooling, loss of appetite, lethargy, and in severe cases, difficulty breathing or organ damage. Keep this plant out of reach.',
        warning: 'If your dog ingests any part of this plant, contact your veterinarian or the ASPCA Animal Poison Control Center (888-426-4435) immediately.',
      },
      cat: {
        title: 'Toxic to Cats',
        description: 'This plant is poisonous to cats. Cats are particularly sensitive to many plant toxins and even small amounts can cause serious harm.',
        details: 'Symptoms may include: vomiting, diarrhea, drooling, difficulty swallowing, lethargy, loss of appetite, and potentially kidney or liver damage. Cats often chew on plants, making them especially vulnerable.',
        warning: 'If your cat ingests any part of this plant, seek veterinary care immediately. Early treatment is critical for the best outcome.',
      },
    };
  }
};

/**
 * PetSafetyDetails - Detailed pet safety information with dog/cat icons and descriptions
 *
 * @param {boolean|null} petFriendly - Whether the plant is pet-friendly
 * @param {string} species - Plant species name (optional, for context)
 */
export default function PetSafetyDetails({ petFriendly, species }) {
  // Don't render if pet safety is unknown
  if (petFriendly === null || petFriendly === undefined) {
    return null;
  }

  const isSafe = petFriendly === true;
  const info = getToxicityInfo(isSafe, species);
  const safeColor = '#2e7d32';
  const toxicColor = '#d32f2f';

  const AnimalSection = ({ animal, data, icon: Icon }) => {
    const color = isSafe ? safeColor : toxicColor;
    const bgColor = isSafe ? 'rgba(46, 125, 50, 0.04)' : 'rgba(211, 47, 47, 0.04)';
    const borderColor = isSafe ? 'rgba(46, 125, 50, 0.2)' : 'rgba(211, 47, 47, 0.2)';

    return (
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: bgColor,
          border: '1px solid',
          borderColor: borderColor,
        }}
      >
        {/* Header with icon and title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: isSafe ? 'rgba(46, 125, 50, 0.1)' : 'rgba(211, 47, 47, 0.1)',
            }}
          >
            <Icon size={32} color={color} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color }}>
                {data.title}
              </Typography>
              {isSafe ? (
                <CheckIcon sx={{ fontSize: 20, color: safeColor }} />
              ) : (
                <CloseIcon sx={{ fontSize: 20, color: toxicColor }} />
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {animal === 'dog' ? 'Canine Safety Information' : 'Feline Safety Information'}
            </Typography>
          </Box>
        </Box>

        {/* Description */}
        <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.6 }}>
          {data.description}
        </Typography>

        {/* Details */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: data.warning ? 1.5 : 0, lineHeight: 1.6 }}>
          {data.details}
        </Typography>

        {/* Warning for toxic plants */}
        {data.warning && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'rgba(211, 47, 47, 0.08)',
              border: '1px solid',
              borderColor: 'rgba(211, 47, 47, 0.3)',
            }}
          >
            <WarningIcon sx={{ fontSize: 20, color: toxicColor, mt: 0.25 }} />
            <Typography variant="caption" sx={{ color: toxicColor, fontWeight: 500, lineHeight: 1.5 }}>
              {data.warning}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Pet Safety
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Dog Section */}
        <AnimalSection animal="dog" data={info.dog} icon={DogIcon} />

        {/* Cat Section */}
        <AnimalSection animal="cat" data={info.cat} icon={CatIcon} />
      </Box>

      {/* General advice */}
      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
          {isSafe ? (
            <>
              <strong>General Advice:</strong> Even non-toxic plants can cause mild digestive upset if consumed in large quantities.
              It's always best to discourage pets from chewing on houseplants and provide them with safe alternatives like cat grass.
            </>
          ) : (
            <>
              <strong>Emergency Resources:</strong> ASPCA Animal Poison Control: (888) 426-4435 (fee may apply).
              Pet Poison Helpline: (855) 764-7661. Always keep your vet's emergency number handy.
            </>
          )}
        </Typography>
      </Box>
    </Box>
  );
}
