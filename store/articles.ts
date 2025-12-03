import { hackerNewsAPI } from '@/services/api';
import { storageService } from '@/services/storage';
import { Article, ArticleState } from '@/types/article';
import { create } from 'zustand';

interface ArticlesStore {
  articles: Article[];
  articleStates: Record<string, ArticleState>;
  loading: boolean;
  error: string | null;

  // Actions
  fetchArticles: (query?: string) => Promise<void>;
  toggleFavorite: (articleId: string) => Promise<void>;
  deleteArticle: (articleId: string) => Promise<void>;
  restoreArticle: (articleId: string) => Promise<void>;
  loadFromStorage: () => Promise<void>;

  // Getters
  getVisibleArticles: () => Article[];
  getFavoriteArticles: () => Article[];
  getDeletedArticles: () => Article[];
}

export const useArticlesStore = create<ArticlesStore>((set, get) => ({
  articles: [],
  articleStates: {},
  loading: false,
  error: null,

  fetchArticles: async (query = 'mobile') => {
    set({ loading: true, error: null });
    try {
      const response = await hackerNewsAPI.fetchArticles(query);
      const articles = response.hits;

      // Save to storage
      await storageService.saveArticles(articles);

      set({ articles, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch articles';
      set({ error: errorMessage, loading: false });

      // Load from storage on error (offline mode)
      const cachedArticles = await storageService.getArticles();
      if (cachedArticles.length > 0) {
        set({ articles: cachedArticles });
      }
    }
  },

  loadFromStorage: async () => {
    try {
      const [articles, articleStates] = await Promise.all([
        storageService.getArticles(),
        storageService.getArticleStates(),
      ]);

      set({ articles, articleStates });
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
  },

  toggleFavorite: async (articleId: string) => {
    const { articleStates } = get();
    const currentState = articleStates[articleId] || { isFavorite: false, isDeleted: false };
    const newState = { ...currentState, isFavorite: !currentState.isFavorite };

    await storageService.saveArticleState(articleId, newState);

    set({
      articleStates: {
        ...articleStates,
        [articleId]: newState,
      },
    });
  },

  deleteArticle: async (articleId: string) => {
    const { articleStates } = get();
    const currentState = articleStates[articleId] || { isFavorite: false, isDeleted: false };
    const newState = { ...currentState, isDeleted: true };

    await storageService.saveArticleState(articleId, newState);

    set({
      articleStates: {
        ...articleStates,
        [articleId]: newState,
      },
    });
  },

  restoreArticle: async (articleId: string) => {
    const { articleStates } = get();
    const currentState = articleStates[articleId] || { isFavorite: false, isDeleted: false };
    const newState = { ...currentState, isDeleted: false };

    await storageService.saveArticleState(articleId, newState);

    set({
      articleStates: {
        ...articleStates,
        [articleId]: newState,
      },
    });
  },

  getVisibleArticles: () => {
    const { articles, articleStates } = get();
    return articles.filter(article => {
      const state = articleStates[article.objectID];
      return !state?.isDeleted;
    });
  },

  getFavoriteArticles: () => {
    const { articles, articleStates } = get();
    return articles.filter(article => {
      const state = articleStates[article.objectID];
      return state?.isFavorite && !state?.isDeleted;
    });
  },

  getDeletedArticles: () => {
    const { articles, articleStates } = get();
    return articles.filter(article => {
      const state = articleStates[article.objectID];
      return state?.isDeleted;
    });
  },
}));
