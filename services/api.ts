import axios from 'axios';
import { HackerNewsResponse } from '@/types/article';

const API_BASE_URL = 'https://hn.algolia.com/api/v1';

export class HackerNewsAPI {
  private static instance: HackerNewsAPI;

  private constructor() {}

  static getInstance(): HackerNewsAPI {
    if (!HackerNewsAPI.instance) {
      HackerNewsAPI.instance = new HackerNewsAPI();
    }
    return HackerNewsAPI.instance;
  }

  async fetchArticles(query: string = 'mobile'): Promise<HackerNewsResponse> {
    try {
      const response = await axios.get<HackerNewsResponse>(
        `${API_BASE_URL}/search_by_date`,
        {
          params: {
            query,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch articles: ${error.message}`);
      }
      throw error;
    }
  }

  async searchArticles(
    query: string,
    page: number = 0
  ): Promise<HackerNewsResponse> {
    try {
      const response = await axios.get<HackerNewsResponse>(
        `${API_BASE_URL}/search_by_date`,
        {
          params: {
            query,
            page,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to search articles: ${error.message}`);
      }
      throw error;
    }
  }
}

export const hackerNewsAPI = HackerNewsAPI.getInstance();
