import { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { notificationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const usePushNotifications = () => {
  const { isAuthenticated } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState('prompt');

  useEffect(() => {
    if (!isAuthenticated) return;

    // Only initialize on native platforms
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications only available on native platforms');
      return;
    }

    initializePushNotifications();
  }, [isAuthenticated]);

  const initializePushNotifications = async () => {
    try {
      // Request permission
      const permResult = await PushNotifications.requestPermissions();
      setPermissionStatus(permResult.receive);

      if (permResult.receive === 'granted') {
        // Register with OS
        await PushNotifications.register();
      } else {
        console.log('Push notification permission denied');
        return;
      }

      // Listen for registration
      await PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token:', token.value);

        // Get device ID
        const deviceId = await getDeviceId();
        const platform = Capacitor.getPlatform(); // 'ios' or 'android'

        // Register token with backend
        try {
          await notificationsAPI.registerPushToken({
            device_id: deviceId,
            platform: platform,
            token: token.value
          });
          console.log('Token registered with backend');
        } catch (error) {
          console.error('Failed to register token with backend:', error);
        }
      });

      // Listen for registration errors
      await PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error);
      });

      // Listen for push notifications received
      await PushNotifications.addListener(
        'pushNotificationReceived',
        (notification) => {
          console.log('Push notification received:', notification);

          // Show toast for foreground notifications
          toast(notification.body, {
            icon: '🌱',
            duration: 5000
          });
        }
      );

      // Listen for push notification actions
      await PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (notification) => {
          console.log('Push notification action performed:', notification);

          // Handle deep linking
          const data = notification.notification.data;
          if (data && data.deep_link) {
            // Navigate to deep link
            window.location.href = data.deep_link;
          }
        }
      );
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  };

  const getDeviceId = async () => {
    // Get unique device ID (you may want to use a plugin for this)
    // For now, use a combination of platform and a stored UUID
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = `${Capacitor.getPlatform()}-${crypto.randomUUID()}`;
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  };

  const requestPermission = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast.error('Push notifications only available on mobile');
      return false;
    }

    const permResult = await PushNotifications.requestPermissions();
    setPermissionStatus(permResult.receive);

    if (permResult.receive === 'granted') {
      await PushNotifications.register();
      return true;
    }
    return false;
  };

  return {
    permissionStatus,
    requestPermission
  };
};
