import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { hackerNewsAPI } from './api';
import { notificationService } from './notifications';
import { storageService } from './storage';

const BACKGROUND_FETCH_TASK = 'FETCH_NEW_ARTICLES';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    console.log('Background fetch started');

    const preferences = await storageService.getUserPreferences();

    if (!preferences.notificationsEnabled) {
      console.log('Notifications disabled, skipping fetch');
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    const cachedArticles = await storageService.getArticles();
    const cachedIds = new Set(cachedArticles.map(a => a.objectID));

    const allNewArticles = [];

    for (const topic of preferences.selectedTopics) {
      const response = await hackerNewsAPI.fetchArticles(topic);
      const newArticles = response.hits.filter(article => !cachedIds.has(article.objectID));
      allNewArticles.push(...newArticles);
    }

    if (allNewArticles.length > 0) {
      console.log(`Found ${allNewArticles.length} new articles`);

      const updatedArticles = [...allNewArticles, ...cachedArticles];
      await storageService.saveArticles(updatedArticles);

      if (allNewArticles.length === 1) {
        await notificationService.scheduleNewArticleNotification(allNewArticles[0]);
      } else {
        await notificationService.scheduleMultipleArticlesNotification(allNewArticles.length);
      }

      return BackgroundTask.BackgroundTaskResult.Success;
    }

    console.log('No new articles found');
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.error('Background fetch failed:', error);
    return BackgroundTask.BackgroundTaskResult.Failed;
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
      await BackgroundTask.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 15, 
      });

      console.log('Background fetch registered successfully');
    } catch (error) {
      console.error('Failed to register background fetch:', error);
    }
  }

  async unregisterBackgroundFetch(): Promise<void> {
    try {
      await BackgroundTask.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
      console.log('Background fetch unregistered successfully');
    } catch (error) {
      console.error('Failed to unregister background fetch:', error);
    }
  }

  async getStatus(): Promise<BackgroundTask.BackgroundTaskStatus> {
    return await BackgroundTask.getStatusAsync();
  }

  async isRegistered(): Promise<boolean> {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    return isRegistered;
  }
}

export const backgroundFetchService = BackgroundFetchService.getInstance();
