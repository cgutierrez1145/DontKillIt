import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Spa } from '@mui/icons-material';
import HomePage from './pages/HomePage';

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Box sx={{ flexGrow: 1 }}>
            {/* Navigation Bar */}
            <AppBar position="static" elevation={0}>
              <Toolbar>
                <Spa sx={{ mr: 2 }} />
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  DontKillIt
                </Typography>
              </Toolbar>
            </AppBar>

            {/* Routes */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              {/* More routes will be added in future sprints */}
            </Routes>
          </Box>
        </BrowserRouter>

        {/* Toast notifications */}
        <Toaster position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
