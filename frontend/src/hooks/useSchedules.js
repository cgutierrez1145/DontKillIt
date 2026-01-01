import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wateringAPI, feedingAPI } from '../services/api';
import toast from 'react-hot-toast';

// Query keys
export const scheduleKeys = {
  watering: (plantId) => ['watering', 'schedule', plantId],
  wateringHistory: (plantId) => ['watering', 'history', plantId],
  feeding: (plantId) => ['feeding', 'schedule', plantId],
  feedingHistory: (plantId) => ['feeding', 'history', plantId],
};

// ==================== WATERING HOOKS ====================

// Get watering schedule
export function useWateringSchedule(plantId) {
  return useQuery({
    queryKey: scheduleKeys.watering(plantId),
    queryFn: () => wateringAPI.getSchedule(plantId),
    enabled: !!plantId,
    retry: false, // Don't retry if schedule doesn't exist (404)
  });
}

// Get watering history
export function useWateringHistory(plantId) {
  return useQuery({
    queryKey: scheduleKeys.wateringHistory(plantId),
    queryFn: () => wateringAPI.getHistory(plantId),
    enabled: !!plantId,
  });
}

// Create watering schedule
export function useCreateWateringSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ plantId, scheduleData }) => wateringAPI.createSchedule(plantId, scheduleData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.watering(variables.plantId) });
      toast.success('Watering schedule created!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create watering schedule');
    },
  });
}

// Update watering schedule
export function useUpdateWateringSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ plantId, scheduleData }) => wateringAPI.updateSchedule(plantId, scheduleData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.watering(variables.plantId) });
      toast.success('Watering schedule updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update watering schedule');
    },
  });
}

// Record watering event
export function useRecordWatering() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ plantId, wateringData }) => wateringAPI.recordWatering(plantId, wateringData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.watering(variables.plantId) });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.wateringHistory(variables.plantId) });
      toast.success('Watering recorded!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to record watering');
    },
  });
}

// ==================== FEEDING HOOKS ====================

// Get feeding schedule
export function useFeedingSchedule(plantId) {
  return useQuery({
    queryKey: scheduleKeys.feeding(plantId),
    queryFn: () => feedingAPI.getSchedule(plantId),
    enabled: !!plantId,
    retry: false, // Don't retry if schedule doesn't exist (404)
  });
}

// Get feeding history
export function useFeedingHistory(plantId) {
  return useQuery({
    queryKey: scheduleKeys.feedingHistory(plantId),
    queryFn: () => feedingAPI.getHistory(plantId),
    enabled: !!plantId,
  });
}

// Create feeding schedule
export function useCreateFeedingSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ plantId, scheduleData }) => feedingAPI.createSchedule(plantId, scheduleData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.feeding(variables.plantId) });
      toast.success('Feeding schedule created!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create feeding schedule');
    },
  });
}

// Update feeding schedule
export function useUpdateFeedingSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ plantId, scheduleData }) => feedingAPI.updateSchedule(plantId, scheduleData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.feeding(variables.plantId) });
      toast.success('Feeding schedule updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update feeding schedule');
    },
  });
}

// Record feeding event
export function useRecordFeeding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ plantId, feedingData }) => feedingAPI.recordFeeding(plantId, feedingData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.feeding(variables.plantId) });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.feedingHistory(variables.plantId) });
      toast.success('Feeding recorded!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to record feeding');
    },
  });
}
