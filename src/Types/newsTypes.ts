export interface NewsItem {
  author: string | null;
  title: string;
  description: string;
  url: string;
  source: string;
  image: string | null;
  category: string;
  language: string;
  country: string;
  published_at: string;
}

export interface Pagination {
  limit: number;
  offset: number;
  count: number;
  total: number;
}

export interface NewsResponse {
  pagination: Pagination;
  data: NewsItem[];
}
