import { useNavigate } from 'react-router-dom';
import { IconButton, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

/**
 * Reusable back button component
 * @param {string} to - Optional specific path to navigate to
 * @param {string} label - Optional label for button variant
 * @param {string} variant - 'icon' (default) or 'button'
 */
export default function BackButton({ to, label = 'Back', variant = 'icon' }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  if (variant === 'button') {
    return (
      <Button
        startIcon={<BackIcon />}
        onClick={handleBack}
        sx={{ mb: 2 }}
      >
        {label}
      </Button>
    );
  }

  return (
    <IconButton onClick={handleBack} aria-label="Go back">
      <BackIcon />
    </IconButton>
  );
}
