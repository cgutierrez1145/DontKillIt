import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Spa, Login, Logout } from '@mui/icons-material';
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
import DiagnosisPage from './pages/DiagnosisPage';
import SettingsPage from './pages/SettingsPage';

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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Box
          component="img"
          src="/logo.png"
          alt="DontKillIt"
          sx={{ height: 40, mr: 2, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        />
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          DontKillIt
        </Typography>

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              color="inherit"
              onClick={() => navigate('/plants')}
            >
              My Plants
            </Button>
            <NotificationCenter />
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.email}
            </Typography>
            <Button
              color="inherit"
              startIcon={<Logout />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
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
        <Route path="/plants/:id/diagnosis" element={
          <ProtectedRoute>
            <DiagnosisPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
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
