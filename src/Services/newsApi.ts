import axios, { type AxiosError, type AxiosResponse } from "axios";
import type { NewsResponse } from "../Types/newsTypes";
import NoImageAvailable from "../assets/No_image_available.png";

const TOP_HEADLINES_URL = "https://gnews.io/api/v4/top-headlines";
const SEARCH_URL = "https://gnews.io/api/v4/search";

const DEFAULT_LIMIT = 12;
const DEFAULT_LANG = "en";
const DEFAULT_COUNTRY = "us";

const API_KEY: string =
  (import.meta as unknown as { env?: { VITE_GNEWS_KEY?: string } })?.env?.VITE_GNEWS_KEY ??
  "40e6fe183be26d9b349a7a5caaeda0cd";

async function getWithRetry<T>(
  url: string,
  config: { params?: Record<string, unknown> } = {},
  maxRetries = 6
): Promise<AxiosResponse<T>> {
  let delayMs = 500;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get<T>(url, config);

      const headers = response.headers as Record<string, string | undefined>;
      if (headers) {
        const limit = headers["x-ratelimit-limit"];
        const remaining = headers["x-ratelimit-remaining"];
        const reset = headers["x-ratelimit-reset"];
        if (limit || remaining || reset) {
          console.debug("RateLimit:", { limit, remaining, reset });
        }
      }

      return response;
    } catch (error) {
      const axiosErr = error as AxiosError;
      const status = axiosErr.response?.status;

      if (status !== 429 && status !== 503) throw error;

      if (attempt === maxRetries) throw error;

      const retryAfterHeader = axiosErr.response?.headers?.["retry-after"] as unknown as string | undefined;
      const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : null;
      const jitter = Math.random() * 0.3 + 0.85;
      const waitMs = retryAfterSeconds ? retryAfterSeconds * 1000 : Math.min(30000, delayMs) * jitter;

      await new Promise((resolve) => setTimeout(resolve, waitMs));
      delayMs *= 2;
    }
  }

  throw new Error("Unreachable");
}
export async function fetchNewsByCategory(
  category: string,
  limit: number = DEFAULT_LIMIT,
  offset: number = 0
): Promise<NewsResponse> {
  const lang = DEFAULT_LANG;
  const country = DEFAULT_COUNTRY;

  const page = limit > 0 ? Math.floor(offset / limit) + 1 : 1;

  const requestParams: Record<string, string | number> = {
    category: (category || "general").toLowerCase(),
    lang,
    country,
    max: limit,
    apikey: API_KEY,
  };
  if (page > 1) requestParams.page = page;

  type GNewsArticle = {
    title: string;
    description: string | null;
    url: string;
    image: string | null;
    publishedAt: string;
    source: { name: string; url: string };
  };
  type GNewsResponse = { totalArticles: number; articles: GNewsArticle[] };

  const { data } = await getWithRetry<GNewsResponse>(TOP_HEADLINES_URL, { params: requestParams });

  const items = (data.articles || []).map((a) => ({
    author: null,
    title: a.title,
    description: a.description ?? "",
    url: a.url,
    source: a.source?.name ?? "",
    image: a.image,
    category: (category || "general").toLowerCase(),
    language: lang,
    country: country,
    published_at: a.publishedAt,
  }));

  return {
    pagination: {
      limit,
      offset,
      count: items.length,
      total: data.totalArticles ?? items.length,
    },
    data: items,
  };
}

export async function searchNews(
  query: string,
  options?: {
    category?: string;
    sortBy?: "publishedAt" | "relevance";
    from?: string;
    to?: string;
    lang?: string;
    country?: string;
    limit?: number;
    offset?: number;
  }
): Promise<NewsResponse> {
  const limit = options?.limit ?? DEFAULT_LIMIT;
  const offset = options?.offset ?? 0;
  const page = limit > 0 ? Math.floor(offset / limit) + 1 : 1;

  const requestParams: Record<string, string | number> = {
    q: query,
    apikey: API_KEY,
    max: limit,
  };

  if (options?.category) requestParams.category = options.category.toLowerCase();
  if (options?.sortBy) requestParams.sortby = options.sortBy;
  if (options?.from) requestParams.from = options.from;
  if (options?.to) requestParams.to = options.to;
  if (options?.lang) requestParams.lang = options.lang;
  if (options?.country) requestParams.country = options.country;
  if (page > 1) requestParams.page = page;

  type GNewsArticle = {
    title: string;
    description: string | null;
    url: string;
    image: string | null;
    publishedAt: string;
    source: { name: string; url: string };
  };
  type GNewsResponse = { totalArticles: number; articles: GNewsArticle[] };

  const { data } = await getWithRetry<GNewsResponse>(SEARCH_URL, { params: requestParams });

  const items = (data.articles || []).map((a) => ({
    author: null,
    title: a.title,
    description: a.description ?? "",
    url: a.url,
    source: a.source?.name ?? "",
    image: a.image,
    category: options?.category?.toLowerCase() ?? "general",
    language: options?.lang ?? DEFAULT_LANG,
    country: options?.country ?? DEFAULT_COUNTRY,
    published_at: a.publishedAt,
  }));

  return {
    pagination: {
      limit,
      offset,
      count: items.length,
      total: data.totalArticles ?? items.length,
    },
    data: items,
  };
}

export const FALLBACK_IMAGE = NoImageAvailable;
