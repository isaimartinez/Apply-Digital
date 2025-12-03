import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article, ArticleState } from '@/types/article';

const STORAGE_KEYS = {
  ARTICLES: '@articles',
  ARTICLE_STATES: '@article_states',
  LAST_FETCH: '@last_fetch',
  USER_PREFERENCES: '@user_preferences',
} as const;

export interface UserPreferences {
  notificationsEnabled: boolean;
  selectedTopics: string[];
}

export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Articles
  async saveArticles(articles: Article[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_FETCH, new Date().toISOString());
    } catch (error) {
      console.error('Failed to save articles:', error);
      throw error;
    }
  }

  async getArticles(): Promise<Article[]> {
    try {
      const articlesJson = await AsyncStorage.getItem(STORAGE_KEYS.ARTICLES);
      return articlesJson ? JSON.parse(articlesJson) : [];
    } catch (error) {
      console.error('Failed to get articles:', error);
      return [];
    }
  }

  async getLastFetchTime(): Promise<Date | null> {
    try {
      const lastFetch = await AsyncStorage.getItem(STORAGE_KEYS.LAST_FETCH);
      return lastFetch ? new Date(lastFetch) : null;
    } catch (error) {
      console.error('Failed to get last fetch time:', error);
      return null;
    }
  }

  // Article States (favorites, deleted)
  async saveArticleState(articleId: string, state: ArticleState): Promise<void> {
    try {
      const states = await this.getArticleStates();
      states[articleId] = state;
      await AsyncStorage.setItem(STORAGE_KEYS.ARTICLE_STATES, JSON.stringify(states));
    } catch (error) {
      console.error('Failed to save article state:', error);
      throw error;
    }
  }

  async getArticleStates(): Promise<Record<string, ArticleState>> {
    try {
      const statesJson = await AsyncStorage.getItem(STORAGE_KEYS.ARTICLE_STATES);
      return statesJson ? JSON.parse(statesJson) : {};
    } catch (error) {
      console.error('Failed to get article states:', error);
      return {};
    }
  }

  async getArticleState(articleId: string): Promise<ArticleState | null> {
    try {
      const states = await this.getArticleStates();
      return states[articleId] || null;
    } catch (error) {
      console.error('Failed to get article state:', error);
      return null;
    }
  }

  // User Preferences
  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
      throw error;
    }
  }

  async getUserPreferences(): Promise<UserPreferences> {
    try {
      const preferencesJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return preferencesJson
        ? JSON.parse(preferencesJson)
        : { notificationsEnabled: false, selectedTopics: ['mobile'] };
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return { notificationsEnabled: false, selectedTopics: ['mobile'] };
    }
  }

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }
}

export const storageService = StorageService.getInstance();
