import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { diagnosisAPI } from '../services/api';
import toast from 'react-hot-toast';

// Query keys
export const diagnosisKeys = {
  all: ['diagnosis'],
  plant: (plantId) => [...diagnosisKeys.all, 'plant', plantId],
  detail: (photoId) => [...diagnosisKeys.all, 'detail', photoId],
};

// Get all diagnoses for a plant
export function usePlantDiagnoses(plantId) {
  return useQuery({
    queryKey: diagnosisKeys.plant(plantId),
    queryFn: () => diagnosisAPI.getPlantDiagnoses(plantId),
    enabled: !!plantId,
  });
}

// Get single diagnosis with solutions
export function useDiagnosis(photoId) {
  return useQuery({
    queryKey: diagnosisKeys.detail(photoId),
    queryFn: () => diagnosisAPI.getDiagnosis(photoId),
    enabled: !!photoId,
  });
}

// Upload diagnosis mutation (with new photo)
export function useUploadDiagnosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ plantId, formData }) => diagnosisAPI.uploadDiagnosis(plantId, formData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: diagnosisKeys.plant(variables.plantId) });
      toast.success('Diagnosis completed! Check the solutions below.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to upload diagnosis');
    },
  });
}

// Text-only diagnosis mutation (using existing plant photo)
export function useTextDiagnosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ plantId, description }) => diagnosisAPI.textDiagnosis(plantId, description),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: diagnosisKeys.plant(variables.plantId) });
      toast.success('Diagnosis completed! Check the solutions below.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to get diagnosis');
    },
  });
}

// Delete diagnosis mutation
export function useDeleteDiagnosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: diagnosisAPI.deleteDiagnosis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diagnosisKeys.all });
      toast.success('Diagnosis deleted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete diagnosis');
    },
  });
}
