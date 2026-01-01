import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plantsAPI } from '../services/api';
import toast from 'react-hot-toast';

// Query keys
export const plantKeys = {
  all: ['plants'],
  lists: () => [...plantKeys.all, 'list'],
  list: (filters) => [...plantKeys.lists(), { filters }],
  details: () => [...plantKeys.all, 'detail'],
  detail: (id) => [...plantKeys.details(), id],
};

// Get all plants
export function usePlants() {
  return useQuery({
    queryKey: plantKeys.lists(),
    queryFn: plantsAPI.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get single plant by ID
export function usePlant(id) {
  return useQuery({
    queryKey: plantKeys.detail(id),
    queryFn: () => plantsAPI.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

// Create plant mutation
export function useCreatePlant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: plantsAPI.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: plantKeys.lists() });
      toast.success(`Plant "${data.name}" created successfully!`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create plant');
    },
  });
}

// Update plant mutation
export function useUpdatePlant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => plantsAPI.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: plantKeys.lists() });
      queryClient.invalidateQueries({ queryKey: plantKeys.detail(data.id) });
      toast.success(`Plant "${data.name}" updated successfully!`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update plant');
    },
  });
}

// Delete plant mutation
export function useDeletePlant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: plantsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plantKeys.lists() });
      toast.success('Plant deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete plant');
    },
  });
}
