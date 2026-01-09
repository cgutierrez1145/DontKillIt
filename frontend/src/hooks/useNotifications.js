import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  // Get all notifications - only when authenticated
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.getAll(),
    refetchInterval: 30000, // Refetch every 30 seconds as backup to WebSocket
    enabled: isAuthenticated,
    retry: false,
  });

  // Get unread count - only when authenticated
  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsAPI.getUnreadCount(),
    refetchInterval: 30000,
    enabled: isAuthenticated,
    retry: false,
  });

  // Mark notifications as read
  const markReadMutation = useMutation({
    mutationFn: (notificationIds) => notificationsAPI.markRead(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notifications', 'unread-count']);
    },
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsAPI.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notifications', 'unread-count']);
      toast.success('All notifications marked as read');
    },
  });

  // Delete notification
  const deleteMutation = useMutation({
    mutationFn: (notificationId) => notificationsAPI.delete(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notifications', 'unread-count']);
    },
  });

  // Add new notification (called from WebSocket)
  const addNotification = (notification) => {
    queryClient.setQueryData(['notifications'], (old) => {
      return [notification, ...(old || [])];
    });

    queryClient.setQueryData(['notifications', 'unread-count'], (old) => {
      return { count: (old?.count || 0) + 1 };
    });

    // Show toast
    toast(notification.message, {
      icon: getNotificationIcon(notification.type),
      duration: 5000,
    });
  };

  return {
    notifications: notifications || [],
    unreadCount: unreadCount?.count || 0,
    isLoading,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
    deleteNotification: deleteMutation.mutate,
    addNotification,
  };
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'WATERING':
      return '💧';
    case 'FEEDING':
      return '🌱';
    case 'DIAGNOSIS':
      return '🔬';
    default:
      return '📬';
  }
};
