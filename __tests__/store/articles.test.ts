import { renderHook, act } from '@testing-library/react-native';
import { useArticlesStore } from '@/store/articles';
import { hackerNewsAPI } from '@/services/api';
import { storageService } from '@/services/storage';
import { Article } from '@/types/article';

jest.mock('@/services/api');
jest.mock('@/services/storage');

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

describe('useArticlesStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    const { result } = renderHook(() => useArticlesStore());
    act(() => {
      result.current.articles = [];
      result.current.articleStates = {};
      result.current.loading = false;
      result.current.error = null;
    });
  });

  describe('fetchArticles', () => {
    it('should fetch and store articles successfully', async () => {
      const mockResponse = {
        hits: [mockArticle],
        nbHits: 1,
        page: 0,
        nbPages: 1,
        hitsPerPage: 20,
      };

      (hackerNewsAPI.fetchArticles as jest.Mock).mockResolvedValueOnce(mockResponse);
      (storageService.saveArticles as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useArticlesStore());

      await act(async () => {
        await result.current.fetchArticles('mobile');
      });

      expect(result.current.articles).toEqual([mockArticle]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(storageService.saveArticles).toHaveBeenCalledWith([mockArticle]);
    });

    it('should handle fetch errors and load from cache', async () => {
      const cachedArticles = [mockArticle];

      (hackerNewsAPI.fetchArticles as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );
      (storageService.getArticles as jest.Mock).mockResolvedValueOnce(cachedArticles);

      const { result } = renderHook(() => useArticlesStore());

      await act(async () => {
        await result.current.fetchArticles('mobile');
      });

      expect(result.current.articles).toEqual(cachedArticles);
      expect(result.current.error).toBe('Network error');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite state', async () => {
      (storageService.saveArticleState as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useArticlesStore());

      await act(async () => {
        await result.current.toggleFavorite('1');
      });

      expect(result.current.articleStates['1']).toEqual({
        isFavorite: true,
        isDeleted: false,
      });

      await act(async () => {
        await result.current.toggleFavorite('1');
      });

      expect(result.current.articleStates['1']).toEqual({
        isFavorite: false,
        isDeleted: false,
      });
    });
  });

  describe('deleteArticle', () => {
    it('should mark article as deleted', async () => {
      (storageService.saveArticleState as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useArticlesStore());

      await act(async () => {
        await result.current.deleteArticle('1');
      });

      expect(result.current.articleStates['1']).toEqual({
        isFavorite: false,
        isDeleted: true,
      });
    });
  });

  describe('restoreArticle', () => {
    it('should restore deleted article', async () => {
      (storageService.saveArticleState as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useArticlesStore());

      // First delete
      await act(async () => {
        await result.current.deleteArticle('1');
      });

      expect(result.current.articleStates['1'].isDeleted).toBe(true);

      // Then restore
      await act(async () => {
        await result.current.restoreArticle('1');
      });

      expect(result.current.articleStates['1'].isDeleted).toBe(false);
    });
  });

  describe('getVisibleArticles', () => {
    it('should return only non-deleted articles', () => {
      const { result } = renderHook(() => useArticlesStore());

      act(() => {
        result.current.articles = [
          { ...mockArticle, objectID: '1' },
          { ...mockArticle, objectID: '2' },
          { ...mockArticle, objectID: '3' },
        ];
        result.current.articleStates = {
          '1': { isFavorite: false, isDeleted: false },
          '2': { isFavorite: true, isDeleted: true },
          '3': { isFavorite: false, isDeleted: false },
        };
      });

      const visible = result.current.getVisibleArticles();

      expect(visible).toHaveLength(2);
      expect(visible.map(a => a.objectID)).toEqual(['1', '3']);
    });
  });

  describe('getFavoriteArticles', () => {
    it('should return only favorited non-deleted articles', () => {
      const { result } = renderHook(() => useArticlesStore());

      act(() => {
        result.current.articles = [
          { ...mockArticle, objectID: '1' },
          { ...mockArticle, objectID: '2' },
          { ...mockArticle, objectID: '3' },
        ];
        result.current.articleStates = {
          '1': { isFavorite: true, isDeleted: false },
          '2': { isFavorite: true, isDeleted: true },
          '3': { isFavorite: false, isDeleted: false },
        };
      });

      const favorites = result.current.getFavoriteArticles();

      expect(favorites).toHaveLength(1);
      expect(favorites[0].objectID).toBe('1');
    });
  });

  describe('getDeletedArticles', () => {
    it('should return only deleted articles', () => {
      const { result } = renderHook(() => useArticlesStore());

      act(() => {
        result.current.articles = [
          { ...mockArticle, objectID: '1' },
          { ...mockArticle, objectID: '2' },
          { ...mockArticle, objectID: '3' },
        ];
        result.current.articleStates = {
          '1': { isFavorite: false, isDeleted: true },
          '2': { isFavorite: true, isDeleted: true },
          '3': { isFavorite: false, isDeleted: false },
        };
      });

      const deleted = result.current.getDeletedArticles();

      expect(deleted).toHaveLength(2);
      expect(deleted.map(a => a.objectID)).toEqual(['1', '2']);
    });
  });
});
