import { useState } from 'react';
import { Box, Chip, Tooltip, Typography, IconButton, Popover } from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon, HelpOutline as HelpIcon } from '@mui/icons-material';

// Dog head icon - simple recognizable dog face with floppy ears
const DogIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 4C8 4 5 7 5 11C5 12 5 13 5.5 14L4 17C3.5 18 4 19 5 19H7L8 17H16L17 19H19C20 19 20.5 18 20 17L18.5 14C19 13 19 12 19 11C19 7 16 4 12 4Z"
      fill={color}
    />
    <ellipse cx="6" cy="9" rx="2.5" ry="4" fill={color} />
    <ellipse cx="18" cy="9" rx="2.5" ry="4" fill={color} />
    <circle cx="9" cy="10" r="1.5" fill="white" />
    <circle cx="15" cy="10" r="1.5" fill="white" />
    <ellipse cx="12" cy="14" rx="2" ry="1.5" fill="white" />
  </svg>
);

// Cat head icon - simple recognizable cat face with pointed ears
const CatIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 5C8 5 5 8.5 5 13C5 17 8 20 12 20C16 20 19 17 19 13C19 8.5 16 5 12 5Z"
      fill={color}
    />
    <path d="M5 13L3 3L9 9L5 13Z" fill={color} />
    <path d="M19 13L21 3L15 9L19 13Z" fill={color} />
    <ellipse cx="9" cy="12" rx="1.2" ry="2" fill="white" />
    <ellipse cx="15" cy="12" rx="1.2" ry="2" fill="white" />
    <path d="M12 15L10.5 17H13.5L12 15Z" fill="white" />
  </svg>
);

// Toxicity info popover content
const ToxicityInfoContent = ({ isSafe }) => (
  <Box sx={{ p: 2, maxWidth: 300 }}>
    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
      {isSafe ? 'Pet Safe Plant' : 'Toxic Plant Warning'}
    </Typography>

    {isSafe ? (
      <>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
          <DogIcon size={20} color="#2e7d32" />
          <Box>
            <Typography variant="body2" fontWeight="medium" color="success.main">
              Safe for Dogs
            </Typography>
            <Typography variant="caption" color="text.secondary">
              This plant is non-toxic to dogs. Safe if chewed or ingested.
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <CatIcon size={20} color="#2e7d32" />
          <Box>
            <Typography variant="body2" fontWeight="medium" color="success.main">
              Safe for Cats
            </Typography>
            <Typography variant="caption" color="text.secondary">
              This plant is non-toxic to cats. Safe if chewed or ingested.
            </Typography>
          </Box>
        </Box>
      </>
    ) : (
      <>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
          <DogIcon size={20} color="#d32f2f" />
          <Box>
            <Typography variant="body2" fontWeight="medium" color="error.main">
              Toxic to Dogs
            </Typography>
            <Typography variant="caption" color="text.secondary">
              May cause vomiting, diarrhea, drooling, or more severe symptoms if ingested.
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
          <CatIcon size={20} color="#d32f2f" />
          <Box>
            <Typography variant="body2" fontWeight="medium" color="error.main">
              Toxic to Cats
            </Typography>
            <Typography variant="caption" color="text.secondary">
              May cause vomiting, lethargy, kidney issues, or other serious health problems.
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
          Keep this plant out of reach of pets. Contact your vet immediately if ingested.
        </Typography>
      </>
    )}
  </Box>
);

// Help button with toxicity info popover
const ToxicityHelpButton = ({ isSafe, size = 'small' }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          p: 0.25,
          color: 'text.secondary',
          '&:hover': {
            color: isSafe ? 'success.main' : 'error.main',
            bgcolor: isSafe ? 'rgba(46, 125, 50, 0.08)' : 'rgba(211, 47, 47, 0.08)',
          },
        }}
      >
        <HelpIcon sx={{ fontSize: iconSize }} />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ToxicityInfoContent isSafe={isSafe} />
      </Popover>
    </>
  );
};

// Paw print icon for general pet indicator
const PawIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M4.5 11c1.38 0 2.5-1.12 2.5-2.5S5.88 6 4.5 6 2 7.12 2 8.5 3.12 11 4.5 11zm5.5-3.5c1.38 0 2.5-1.12 2.5-2.5S11.38 2.5 10 2.5 7.5 3.62 7.5 5 8.62 7.5 10 7.5zm4 0c1.38 0 2.5-1.12 2.5-2.5S15.38 2.5 14 2.5s-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5zm5.5 7c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zM12 10c-2.76 0-5 2.24-5 5 0 1.93 1.57 3.5 3.5 3.5h3c1.93 0 3.5-1.57 3.5-3.5 0-2.76-2.24-5-5-5z"/>
  </svg>
);

/**
 * PetSafetyIndicator - Shows pet safety status with dog/cat icons
 *
 * @param {boolean|null} petFriendly - Whether the plant is pet-friendly
 * @param {string} variant - 'chip' | 'icon' | 'detailed' | 'compact'
 * @param {string} size - 'small' | 'medium' | 'large'
 * @param {boolean} showLabel - Whether to show text label
 */
export default function PetSafetyIndicator({
  petFriendly,
  variant = 'chip',
  size = 'medium',
  showLabel = true
}) {
  // Don't render if pet safety is unknown
  if (petFriendly === null || petFriendly === undefined) {
    return null;
  }

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  const isSafe = petFriendly === true;
  const color = isSafe ? '#2e7d32' : '#d32f2f'; // green or red
  const bgColor = isSafe ? 'rgba(46, 125, 50, 0.08)' : 'rgba(211, 47, 47, 0.08)';

  // Compact variant - dog and cat head icons with help
  if (variant === 'compact') {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          p: 0.5,
          borderRadius: 1,
          bgcolor: bgColor,
        }}
      >
        <Tooltip title={isSafe ? 'Safe for dogs & cats' : 'Toxic to dogs & cats'}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <DogIcon size={iconSize} color={color} />
            <CatIcon size={iconSize} color={color} />
          </Box>
        </Tooltip>
        <ToxicityHelpButton isSafe={isSafe} size={size} />
      </Box>
    );
  }

  // Icon variant - shows dog and cat icons with status indicator and help
  if (variant === 'icon') {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.25,
          p: 0.75,
          borderRadius: 1,
          bgcolor: bgColor,
          border: '1px solid',
          borderColor: color,
        }}
      >
        <Tooltip title={isSafe ? 'Safe for dogs and cats' : 'Toxic to dogs and cats'}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            <DogIcon size={iconSize} color={color} />
            <CatIcon size={iconSize} color={color} />
            {isSafe ? (
              <CheckIcon sx={{ fontSize: iconSize * 0.8, color }} />
            ) : (
              <CloseIcon sx={{ fontSize: iconSize * 0.8, color }} />
            )}
          </Box>
        </Tooltip>
        <ToxicityHelpButton isSafe={isSafe} size={size} />
      </Box>
    );
  }

  // Detailed variant - shows both dog and cat chips with help button
  if (variant === 'detailed') {
    return (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <Chip
          icon={<Box sx={{ display: 'flex', ml: 0.5 }}><DogIcon size={18} color={color} /></Box>}
          label={isSafe ? 'Dog Safe' : 'Toxic to Dogs'}
          size={size}
          color={isSafe ? 'success' : 'error'}
          variant="outlined"
          sx={{
            '& .MuiChip-icon': { color },
            fontWeight: 500,
          }}
        />
        <Chip
          icon={<Box sx={{ display: 'flex', ml: 0.5 }}><CatIcon size={18} color={color} /></Box>}
          label={isSafe ? 'Cat Safe' : 'Toxic to Cats'}
          size={size}
          color={isSafe ? 'success' : 'error'}
          variant="outlined"
          sx={{
            '& .MuiChip-icon': { color },
            fontWeight: 500,
          }}
        />
        <ToxicityHelpButton isSafe={isSafe} size={size} />
      </Box>
    );
  }

  // Default chip variant with help button
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      <Chip
        icon={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, ml: 0.5 }}>
            <DogIcon size={16} color={isSafe ? '#2e7d32' : '#d32f2f'} />
            <CatIcon size={16} color={isSafe ? '#2e7d32' : '#d32f2f'} />
          </Box>
        }
        label={showLabel ? (isSafe ? 'Pet Safe' : 'Toxic') : undefined}
        size={size}
        color={isSafe ? 'success' : 'error'}
        variant="outlined"
        sx={{
          fontWeight: 500,
          ...(!showLabel && {
            '& .MuiChip-label': { display: 'none' },
            px: 0.5,
          }),
        }}
      />
      <ToxicityHelpButton isSafe={isSafe} size={size} />
    </Box>
  );
}

// Export individual icons and components for direct use
export { DogIcon, CatIcon, PawIcon, ToxicityHelpButton };
