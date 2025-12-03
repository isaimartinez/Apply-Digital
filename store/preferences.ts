import { create } from 'zustand';
import { storageService, UserPreferences } from '@/services/storage';
import { notificationService } from '@/services/notifications';
import { backgroundFetchService } from '@/services/background-fetch';

interface PreferencesStore extends UserPreferences {
  loading: boolean;

  // Actions
  loadPreferences: () => Promise<void>;
  toggleNotifications: () => Promise<void>;
  toggleTopic: (topic: string) => Promise<void>;
  addTopic: (topic: string) => Promise<void>;
  removeTopic: (topic: string) => Promise<void>;
}

const DEFAULT_TOPICS = ['mobile', 'iOS', 'Android', 'React Native'];

export const usePreferencesStore = create<PreferencesStore>((set, get) => ({
  notificationsEnabled: false,
  selectedTopics: ['mobile'],
  loading: false,

  loadPreferences: async () => {
    set({ loading: true });
    try {
      const preferences = await storageService.getUserPreferences();
      set({ ...preferences, loading: false });
    } catch (error) {
      console.error('Failed to load preferences:', error);
      set({ loading: false });
    }
  },

  toggleNotifications: async () => {
    const { notificationsEnabled, selectedTopics } = get();
    const newValue = !notificationsEnabled;

    try {
      if (newValue) {
        // Request permission
        const granted = await notificationService.requestPermissions();

        if (granted) {
          // Register background fetch
          await backgroundFetchService.registerBackgroundFetch();

          // Save preference
          await storageService.saveUserPreferences({
            notificationsEnabled: true,
            selectedTopics,
          });

          set({ notificationsEnabled: true });
        }
      } else {
        // Unregister background fetch
        await backgroundFetchService.unregisterBackgroundFetch();

        // Cancel all notifications
        await notificationService.cancelAllNotifications();

        // Save preference
        await storageService.saveUserPreferences({
          notificationsEnabled: false,
          selectedTopics,
        });

        set({ notificationsEnabled: false });
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
    }
  },

  toggleTopic: async (topic: string) => {
    const { selectedTopics, notificationsEnabled } = get();
    const isSelected = selectedTopics.includes(topic);

    let newTopics: string[];
    if (isSelected) {
      // Don't allow removing last topic
      if (selectedTopics.length === 1) {
        return;
      }
      newTopics = selectedTopics.filter(t => t !== topic);
    } else {
      newTopics = [...selectedTopics, topic];
    }

    await storageService.saveUserPreferences({
      notificationsEnabled,
      selectedTopics: newTopics,
    });

    set({ selectedTopics: newTopics });
  },

  addTopic: async (topic: string) => {
    const { selectedTopics, notificationsEnabled } = get();

    if (selectedTopics.includes(topic)) {
      return;
    }

    const newTopics = [...selectedTopics, topic];

    await storageService.saveUserPreferences({
      notificationsEnabled,
      selectedTopics: newTopics,
    });

    set({ selectedTopics: newTopics });
  },

  removeTopic: async (topic: string) => {
    const { selectedTopics, notificationsEnabled } = get();

    // Don't allow removing last topic
    if (selectedTopics.length === 1) {
      return;
    }

    const newTopics = selectedTopics.filter(t => t !== topic);

    await storageService.saveUserPreferences({
      notificationsEnabled,
      selectedTopics: newTopics,
    });

    set({ selectedTopics: newTopics });
  },
}));

export { DEFAULT_TOPICS };
