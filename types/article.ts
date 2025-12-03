export interface Article {
  objectID: string;
  title: string;
  author: string;
  created_at: string;
  url: string | null;
  story_text: string | null;
  story_title: string | null;
  story_url: string | null;
}

export interface ArticleState {
  isFavorite: boolean;
  isDeleted: boolean;
}

export interface ArticleWithState extends Article {
  state: ArticleState;
}

export interface HackerNewsResponse {
  hits: Article[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
}
