import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useNotificationPreferences = () => {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => notificationsAPI.getPreferences(),
  });

  const updateMutation = useMutation({
    mutationFn: (updates) => notificationsAPI.updatePreferences(updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['notification-preferences']);
      toast.success('Preferences updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update preferences');
    },
  });

  return {
    preferences,
    isLoading,
    updatePreferences: updateMutation.mutate,
  };
};
