import { useMutation } from '@tanstack/react-query';
import { identificationAPI } from '../services/api';
import toast from 'react-hot-toast';

// Identify plant from image
export function useIdentifyPlant() {
  return useMutation({
    mutationFn: (formData) => identificationAPI.identify(formData),
    onSuccess: (data) => {
      if (data.total_results > 0) {
        toast.success(`Found ${data.total_results} possible matches!`);
      } else {
        toast.info('No matches found. Try a clearer photo.');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to identify plant');
    },
  });
}
