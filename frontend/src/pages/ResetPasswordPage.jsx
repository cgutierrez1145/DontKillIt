import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Lock, Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import { authAPI } from '../services/api';

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Get token from URL params
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const validatePassword = () => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(token, password);
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Don't Kill It!"
              sx={{ height: 80, mb: 2 }}
            />

            <Typography component="h1" variant="h4" gutterBottom>
              Reset Password
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Enter your new password below.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            {success ? (
              <Box sx={{ width: '100%', textAlign: 'center' }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Your password has been reset successfully! Redirecting to login...
                </Alert>
                <CircularProgress size={24} sx={{ mt: 2 }} />
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                {!searchParams.get('token') && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="token"
                    label="Reset Token"
                    name="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    disabled={loading}
                    placeholder="Paste your reset token here"
                  />
                )}

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  helperText="Password must be at least 8 characters"
                  InputProps={{
                    startAdornment: <Lock color="action" sx={{ mr: 1 }} />,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  error={confirmPassword && password !== confirmPassword}
                  helperText={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : ''}
                  InputProps={{
                    startAdornment: <Lock color="action" sx={{ mr: 1 }} />
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading || !token || !password || !confirmPassword}
                >
                  {loading ? <CircularProgress size={24} /> : 'Reset Password'}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Link component={RouterLink} to="/login" variant="body2">
                    <ArrowBack sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                    Back to Login
                  </Link>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default ResetPasswordPage;
