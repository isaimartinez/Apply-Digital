import { useEffect } from 'react';
import { router } from 'expo-router';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { notificationService } from '@/services/notifications';
import { backgroundFetchService } from '@/services/background-fetch';
import { storageService } from '@/services/storage';

export function useNotifications() {
  useEffect(() => {
    // Skip notification setup on simulator/emulator
    if (!Device.isDevice) {
      console.log('Notifications are not supported on simulator/emulator');
      return;
    }

    // Request permissions on first launch
    const requestPermissions = async () => {
      try {
        const preferences = await storageService.getUserPreferences();

        // Only request if not already configured
        const hasPermission = await notificationService.checkPermissionStatus();

        if (!hasPermission && !preferences.notificationsEnabled) {
          const granted = await notificationService.requestPermissions();

          if (granted) {
            // Enable notifications in preferences
            await storageService.saveUserPreferences({
              ...preferences,
              notificationsEnabled: true,
            });

            // Register background fetch
            await backgroundFetchService.registerBackgroundFetch();
          }
        } else if (hasPermission && preferences.notificationsEnabled) {
          // Ensure background fetch is registered
          const isRegistered = await backgroundFetchService.isRegistered();
          if (!isRegistered) {
            await backgroundFetchService.registerBackgroundFetch();
          }
        }
      } catch (error) {
        console.log('Notification setup error (this is normal on simulator):', error);
      }
    };

    requestPermissions();

    // Handle notification taps
    const responseSubscription = notificationService.addNotificationResponseListener(
      (response) => {
        const data = response.notification.request.content.data;

        if (data.articleId && data.url) {
          // Navigate to article
          router.push({
            pathname: '/article/[id]',
            params: { id: data.articleId, url: data.url },
          });
        }
      }
    );

    // Handle notifications received while app is foregrounded
    const receivedSubscription = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
      }
    );

    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, []);
}
