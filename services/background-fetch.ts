import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { hackerNewsAPI } from './api';
import { storageService } from './storage';
import { notificationService } from './notifications';

const BACKGROUND_FETCH_TASK = 'FETCH_NEW_ARTICLES';

// Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    console.log('Background fetch started');

    // Get user preferences
    const preferences = await storageService.getUserPreferences();

    if (!preferences.notificationsEnabled) {
      console.log('Notifications disabled, skipping fetch');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Get cached articles to compare
    const cachedArticles = await storageService.getArticles();
    const cachedIds = new Set(cachedArticles.map(a => a.objectID));

    // Fetch new articles for each selected topic
    const allNewArticles = [];

    for (const topic of preferences.selectedTopics) {
      const response = await hackerNewsAPI.fetchArticles(topic);
      const newArticles = response.hits.filter(article => !cachedIds.has(article.objectID));
      allNewArticles.push(...newArticles);
    }

    if (allNewArticles.length > 0) {
      console.log(`Found ${allNewArticles.length} new articles`);

      // Save new articles
      const updatedArticles = [...allNewArticles, ...cachedArticles];
      await storageService.saveArticles(updatedArticles);

      // Send notification
      if (allNewArticles.length === 1) {
        await notificationService.scheduleNewArticleNotification(allNewArticles[0]);
      } else {
        await notificationService.scheduleMultipleArticlesNotification(allNewArticles.length);
      }

      return BackgroundFetch.BackgroundFetchResult.NewData;
    }

    console.log('No new articles found');
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('Background fetch failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export class BackgroundFetchService {
  private static instance: BackgroundFetchService;

  private constructor() {}

  static getInstance(): BackgroundFetchService {
    if (!BackgroundFetchService.instance) {
      BackgroundFetchService.instance = new BackgroundFetchService();
    }
    return BackgroundFetchService.instance;
  }

  async registerBackgroundFetch(): Promise<void> {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 60 * 15, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });

      console.log('Background fetch registered successfully');
    } catch (error) {
      console.error('Failed to register background fetch:', error);
    }
  }

  async unregisterBackgroundFetch(): Promise<void> {
    try {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
      console.log('Background fetch unregistered successfully');
    } catch (error) {
      console.error('Failed to unregister background fetch:', error);
    }
  }

  async getStatus(): Promise<BackgroundFetch.BackgroundFetchStatus> {
    return await BackgroundFetch.getStatusAsync();
  }

  async isRegistered(): Promise<boolean> {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    return isRegistered;
  }
}

export const backgroundFetchService = BackgroundFetchService.getInstance();
