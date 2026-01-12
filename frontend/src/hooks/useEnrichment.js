import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrichmentAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useEnrichmentStats = () => {
  return useQuery({
    queryKey: ['enrichment', 'stats'],
    queryFn: () => enrichmentAPI.getStats(),
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useEnrichmentLogs = (limit = 10) => {
  return useQuery({
    queryKey: ['enrichment', 'logs', limit],
    queryFn: () => enrichmentAPI.getLogs(limit),
  });
};

export const useCachedSpecies = (search = null, limit = 20) => {
  return useQuery({
    queryKey: ['enrichment', 'cache', search, limit],
    queryFn: () => enrichmentAPI.getCachedSpecies(search, limit),
  });
};

export const useTriggerEnrichment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (maxPlants) => enrichmentAPI.triggerEnrichment(maxPlants),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['enrichment']);
      queryClient.invalidateQueries(['plants']);
      if (data.success) {
        toast.success(
          `Enrichment complete! ${data.plants_enriched || 0} plants enriched.`
        );
      } else {
        toast.error(data.error || 'Enrichment failed');
      }
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.detail || 'Failed to trigger enrichment'
      );
    },
  });
};
