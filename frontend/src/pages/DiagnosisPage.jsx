import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Card,
  CardContent,
  Link,
  CircularProgress,
  Alert,
  IconButton,
  Grid,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  ArrowBack as BackIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { usePlant } from '../hooks/usePlants';
import { useUploadDiagnosis } from '../hooks/useDiagnosis';

export default function DiagnosisPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: plant, isLoading: plantLoading } = usePlant(id);
  const uploadDiagnosis = useUploadDiagnosis();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [description, setDescription] = useState('');
  const [diagnosisResult, setDiagnosisResult] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDiagnosisResult(null); // Clear previous results
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !description.trim()) {
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('description', description);

    uploadDiagnosis.mutate(
      { plantId: parseInt(id), formData },
      {
        onSuccess: (data) => {
          setDiagnosisResult(data);
          setSelectedFile(null);
          setPreviewUrl(null);
          setDescription('');
        },
      }
    );
  };

  const handleBack = () => {
    navigate(`/plants/${id}`);
  };

  if (plantLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={handleBack}>
          <BackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h3" component="h1">
            Plant Diagnosis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {plant?.name}
          </Typography>
        </Box>
      </Box>

      {/* Upload Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Upload Photo & Describe Problem
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Take a photo of your plant showing the problem and describe what you're seeing.
        </Typography>

        {/* File Upload */}
        <Box sx={{ mb: 3 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="photo-upload"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="photo-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadIcon />}
              fullWidth
              sx={{ mb: 2 }}
            >
              {selectedFile ? 'Change Photo' : 'Choose Photo'}
            </Button>
          </label>

          {previewUrl && (
            <Box
              component="img"
              src={previewUrl}
              alt="Preview"
              sx={{
                width: '100%',
                maxHeight: 300,
                objectFit: 'contain',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
          )}
        </Box>

        {/* Description */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Describe the problem"
          placeholder="e.g., Yellow leaves on bottom, brown spots appearing, wilting stems..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Submit Button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleSubmit}
          disabled={!selectedFile || !description.trim() || uploadDiagnosis.isPending}
          startIcon={uploadDiagnosis.isPending ? <CircularProgress size={20} /> : <SearchIcon />}
        >
          {uploadDiagnosis.isPending ? 'Searching for Solutions...' : 'Get Diagnosis'}
        </Button>
      </Paper>

      {/* Results Section */}
      {diagnosisResult && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Possible Solutions ({diagnosisResult.total_solutions} found)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Problem: {diagnosisResult.photo.description}
          </Typography>

          <Grid container spacing={2}>
            {diagnosisResult.solutions.map((solution) => (
              <Grid item xs={12} key={solution.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          minWidth: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          flexShrink: 0,
                        }}
                      >
                        {solution.rank}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }}>
                        <Link
                          href={solution.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{ display: 'block', mb: 1 }}
                        >
                          <Typography variant="h6" component="span">
                            {solution.title}
                          </Typography>
                        </Link>
                        {solution.snippet && (
                          <Typography variant="body2" color="text.secondary">
                            {solution.snippet}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {new URL(solution.url).hostname}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Alert severity="info" sx={{ mt: 3 }}>
            These are suggested solutions based on web searches. Always verify the information and consult with a plant expert if you're unsure.
          </Alert>
        </Box>
      )}
    </Container>
  );
}
