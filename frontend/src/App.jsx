import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Box, Button, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Spa, Login, Logout, CameraAlt, Menu as MenuIcon, WaterDrop, Grass, Lightbulb, Science } from '@mui/icons-material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PlantsPage from './pages/PlantsPage';
import AddPlantPage from './pages/AddPlantPage';
import PlantDetailPage from './pages/PlantDetailPage';
import EditPlantPage from './pages/EditPlantPage';
import DiagnosisPage from './pages/DiagnosisPage';
import IdentifyPlantPage from './pages/IdentifyPlantPage';
import SettingsPage from './pages/SettingsPage';
import CareTipsPage from './pages/CareTipsPage';
import WateringSchedulePage from './pages/WateringSchedulePage';
import FeedingSchedulePage from './pages/FeedingSchedulePage';
import EnrichmentPage from './pages/EnrichmentPage';
import WateringPreviewPage from './pages/WateringPreviewPage';
import FeedingPreviewPage from './pages/FeedingPreviewPage';
import DiagnosisPreviewPage from './pages/DiagnosisPreviewPage';
import RemindersPreviewPage from './pages/RemindersPreviewPage';
import DashboardPreviewPage from './pages/DashboardPreviewPage';
import DiagnosisSelectPage from './pages/DiagnosisSelectPage';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import NotificationCenter from './components/notifications/NotificationCenter';

// Hooks
import { usePushNotifications } from './hooks/usePushNotifications';
import { useWebSocket } from './hooks/useWebSocket';
import { useNotifications } from './hooks/useNotifications';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Create MUI theme with plant-themed colors
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4caf50', // Green
      light: '#81c784',
      dark: '#388e3c'
    },
    secondary: {
      main: '#8bc34a', // Light green
      light: '#aed581',
      dark: '#689f38'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600
    },
    h2: {
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 12
  }
});

// Navigation component that uses auth context
function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuNavigate = (path) => {
    navigate(path);
    handleMenuClose();
  };

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Box
          component="img"
          src="/logo.png"
          alt="Don't Kill It!"
          sx={{ height: 40, mr: 2, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        />
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer', display: { xs: 'none', sm: 'block' } }}
          onClick={() => navigate('/')}
        >
          Don't Kill It!
        </Typography>

        {isAuthenticated ? (
          <>
            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
              <Button
                color="inherit"
                onClick={() => navigate('/plants')}
              >
                My Plants
              </Button>
              <Button
                color="inherit"
                startIcon={<CameraAlt />}
                onClick={() => navigate('/identify')}
              >
                Identify
              </Button>
              <Button
                color="inherit"
                startIcon={<Lightbulb />}
                onClick={() => navigate('/care-tips')}
              >
                Care Tips
              </Button>
              <Button
                color="inherit"
                startIcon={<WaterDrop />}
                onClick={() => navigate('/watering')}
              >
                Watering
              </Button>
              <Button
                color="inherit"
                startIcon={<Grass />}
                onClick={() => navigate('/feeding')}
              >
                Feeding
              </Button>
              <NotificationCenter />
              <Button
                color="inherit"
                startIcon={<Logout />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>

            {/* Mobile Navigation */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
              <NotificationCenter />
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => handleMenuNavigate('/plants')}>
                  <Spa sx={{ mr: 1 }} /> My Plants
                </MenuItem>
                <MenuItem onClick={() => handleMenuNavigate('/identify')}>
                  <CameraAlt sx={{ mr: 1 }} /> Identify Plant
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleMenuNavigate('/care-tips')}>
                  <Lightbulb sx={{ mr: 1 }} /> Care Tips
                </MenuItem>
                <MenuItem onClick={() => handleMenuNavigate('/watering')}>
                  <WaterDrop sx={{ mr: 1 }} /> Watering Schedule
                </MenuItem>
                <MenuItem onClick={() => handleMenuNavigate('/feeding')}>
                  <Grass sx={{ mr: 1 }} /> Feeding Schedule
                </MenuItem>
                <MenuItem onClick={() => handleMenuNavigate('/enrichment')}>
                  <Science sx={{ mr: 1 }} /> Data Enrichment
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </Box>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              startIcon={<Login />}
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

// Main App component
function AppContent() {
  const { addNotification } = useNotifications();

  // Initialize push notifications (mobile only)
  usePushNotifications();

  // Initialize WebSocket for real-time notifications
  useWebSocket((notification) => {
    addNotification(notification);
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Navigation />

      {/* Routes */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Feature Preview Pages (no login required) */}
        <Route path="/preview/watering" element={<WateringPreviewPage />} />
        <Route path="/preview/feeding" element={<FeedingPreviewPage />} />
        <Route path="/preview/diagnosis" element={<DiagnosisPreviewPage />} />
        <Route path="/preview/reminders" element={<RemindersPreviewPage />} />
        <Route path="/preview/dashboard" element={<DashboardPreviewPage />} />

        {/* Protected routes - Plants */}
        <Route path="/plants" element={
          <ProtectedRoute>
            <PlantsPage />
          </ProtectedRoute>
        } />
        <Route path="/plants/add" element={
          <ProtectedRoute>
            <AddPlantPage />
          </ProtectedRoute>
        } />
        <Route path="/plants/:id" element={
          <ProtectedRoute>
            <PlantDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/plants/:id/edit" element={
          <ProtectedRoute>
            <EditPlantPage />
          </ProtectedRoute>
        } />
        <Route path="/plants/:id/diagnosis" element={
          <ProtectedRoute>
            <DiagnosisPage />
          </ProtectedRoute>
        } />
        <Route path="/identify" element={
          <ProtectedRoute>
            <IdentifyPlantPage />
          </ProtectedRoute>
        } />
        <Route path="/diagnosis" element={
          <ProtectedRoute>
            <DiagnosisSelectPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        <Route path="/care-tips" element={
          <ProtectedRoute>
            <CareTipsPage />
          </ProtectedRoute>
        } />
        <Route path="/watering" element={
          <ProtectedRoute>
            <WateringSchedulePage />
          </ProtectedRoute>
        } />
        <Route path="/feeding" element={
          <ProtectedRoute>
            <FeedingSchedulePage />
          </ProtectedRoute>
        } />
        <Route path="/enrichment" element={
          <ProtectedRoute>
            <EnrichmentPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Box>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>

        {/* Toast notifications */}
        <Toaster position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
