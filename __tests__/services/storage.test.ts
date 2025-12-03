import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '@/services/storage';
import { Article } from '@/types/article';

jest.mock('@react-native-async-storage/async-storage');

describe('StorageService', () => {
  let storageService: StorageService;

  const mockArticle: Article = {
    objectID: '1',
    title: 'Test Article',
    author: 'testuser',
    created_at: '2024-01-01T00:00:00.000Z',
    url: 'https://example.com',
    story_text: null,
    story_title: null,
    story_url: null,
  };

  beforeEach(() => {
    storageService = StorageService.getInstance();
    jest.clearAllMocks();
  });

  describe('saveArticles', () => {
    it('should save articles to storage', async () => {
      const articles = [mockArticle];

      await storageService.saveArticles(articles);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@articles',
        JSON.stringify(articles)
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@last_fetch',
        expect.any(String)
      );
    });
  });

  describe('getArticles', () => {
    it('should retrieve articles from storage', async () => {
      const articles = [mockArticle];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(articles)
      );

      const result = await storageService.getArticles();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@articles');
      expect(result).toEqual(articles);
    });

    it('should return empty array when no articles stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await storageService.getArticles();

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      const result = await storageService.getArticles();

      expect(result).toEqual([]);
    });
  });

  describe('saveArticleState', () => {
    it('should save article state', async () => {
      const existingStates = {
        '1': { isFavorite: true, isDeleted: false },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(existingStates)
      );

      await storageService.saveArticleState('2', {
        isFavorite: false,
        isDeleted: true,
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@article_states',
        JSON.stringify({
          '1': { isFavorite: true, isDeleted: false },
          '2': { isFavorite: false, isDeleted: true },
        })
      );
    });
  });

  describe('getArticleStates', () => {
    it('should retrieve article states', async () => {
      const states = {
        '1': { isFavorite: true, isDeleted: false },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(states)
      );

      const result = await storageService.getArticleStates();

      expect(result).toEqual(states);
    });

    it('should return empty object when no states stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await storageService.getArticleStates();

      expect(result).toEqual({});
    });
  });

  describe('getArticleState', () => {
    it('should retrieve specific article state', async () => {
      const states = {
        '1': { isFavorite: true, isDeleted: false },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(states)
      );

      const result = await storageService.getArticleState('1');

      expect(result).toEqual({ isFavorite: true, isDeleted: false });
    });

    it('should return null when state not found', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({})
      );

      const result = await storageService.getArticleState('999');

      expect(result).toBeNull();
    });
  });

  describe('getUserPreferences', () => {
    it('should retrieve user preferences', async () => {
      const preferences = {
        notificationsEnabled: true,
        selectedTopics: ['mobile', 'iOS'],
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(preferences)
      );

      const result = await storageService.getUserPreferences();

      expect(result).toEqual(preferences);
    });

    it('should return default preferences when none stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await storageService.getUserPreferences();

      expect(result).toEqual({
        notificationsEnabled: false,
        selectedTopics: ['mobile'],
      });
    });
  });

  describe('saveUserPreferences', () => {
    it('should save user preferences', async () => {
      const preferences = {
        notificationsEnabled: true,
        selectedTopics: ['mobile'],
      };

      await storageService.saveUserPreferences(preferences);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@user_preferences',
        JSON.stringify(preferences)
      );
    });
  });

  describe('clearAll', () => {
    it('should clear all storage', async () => {
      await storageService.clearAll();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        '@articles',
        '@article_states',
        '@last_fetch',
        '@user_preferences',
      ]);
    });
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = StorageService.getInstance();
      const instance2 = StorageService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});
