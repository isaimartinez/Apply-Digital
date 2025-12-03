import axios from 'axios';
import { HackerNewsAPI } from '@/services/api';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HackerNewsAPI', () => {
  let api: HackerNewsAPI;

  beforeEach(() => {
    api = HackerNewsAPI.getInstance();
    jest.clearAllMocks();
  });

  describe('fetchArticles', () => {
    it('should fetch articles successfully', async () => {
      const mockResponse = {
        data: {
          hits: [
            {
              objectID: '1',
              title: 'Test Article',
              author: 'testuser',
              created_at: '2024-01-01T00:00:00.000Z',
              url: 'https://example.com',
              story_text: null,
              story_title: null,
              story_url: null,
            },
          ],
          nbHits: 1,
          page: 0,
          nbPages: 1,
          hitsPerPage: 20,
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await api.fetchArticles('mobile');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://hn.algolia.com/api/v1/search_by_date',
        {
          params: {
            query: 'mobile',
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
      expect(result.hits).toHaveLength(1);
      expect(result.hits[0].title).toBe('Test Article');
    });

    it('should use default query when none provided', async () => {
      const mockResponse = {
        data: {
          hits: [],
          nbHits: 0,
          page: 0,
          nbPages: 0,
          hitsPerPage: 20,
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await api.fetchArticles();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://hn.algolia.com/api/v1/search_by_date',
        {
          params: {
            query: 'mobile',
          },
        }
      );
    });

    it('should throw error when request fails', async () => {
      const errorMessage = 'Network Error';
      mockedAxios.get.mockRejectedValueOnce({
        isAxiosError: true,
        message: errorMessage,
      });

      mockedAxios.isAxiosError = jest.fn().mockReturnValue(true);

      await expect(api.fetchArticles('mobile')).rejects.toThrow(
        `Failed to fetch articles: ${errorMessage}`
      );
    });
  });

  describe('searchArticles', () => {
    it('should search articles with pagination', async () => {
      const mockResponse = {
        data: {
          hits: [],
          nbHits: 100,
          page: 2,
          nbPages: 5,
          hitsPerPage: 20,
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await api.searchArticles('react native', 2);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://hn.algolia.com/api/v1/search_by_date',
        {
          params: {
            query: 'react native',
            page: 2,
          },
        }
      );
      expect(result.page).toBe(2);
    });

    it('should use default page when none provided', async () => {
      const mockResponse = {
        data: {
          hits: [],
          nbHits: 0,
          page: 0,
          nbPages: 0,
          hitsPerPage: 20,
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await api.searchArticles('test');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://hn.algolia.com/api/v1/search_by_date',
        {
          params: {
            query: 'test',
            page: 0,
          },
        }
      );
    });
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = HackerNewsAPI.getInstance();
      const instance2 = HackerNewsAPI.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});
