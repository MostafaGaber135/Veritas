type QueryValue = string | string[] | undefined;

interface ApiRequest {
  query: Record<string, QueryValue>;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
}

const GNEWS_BASE_URL = "https://gnews.io/api/v4/search";

const getQueryValue = (value: QueryValue): string | undefined => {
  if (Array.isArray(value)) return value[0];
  return value;
};


export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    const q = getQueryValue(req.query.q);
    const category = getQueryValue(req.query.category);
    const sortby = getQueryValue(req.query.sortby);
    const from = getQueryValue(req.query.from);
    const to = getQueryValue(req.query.to);
    const lang = getQueryValue(req.query.lang);
    const country = getQueryValue(req.query.country);
    const max = getQueryValue(req.query.max) || "12";
    const page = getQueryValue(req.query.page);

    const apiKey = process.env.GNEWS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: "Missing GNEWS_API_KEY" });
    }

    if (!q || !q.trim()) {
      return res.status(400).json({ message: "Missing search query" });
    }

    const params = new URLSearchParams({
      q,
      max,
      apikey: apiKey,
    });

    if (category) params.set("category", category);
    if (sortby) params.set("sortby", sortby);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (lang) params.set("lang", lang);
    if (country) params.set("country", country);
    if (page) params.set("page", page);

    const response = await fetch(`${GNEWS_BASE_URL}?${params.toString()}`);
    const data: unknown = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to search news",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}