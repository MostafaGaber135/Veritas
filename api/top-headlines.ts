type QueryValue = string | string[] | undefined;

interface ApiRequest {
  query: Record<string, QueryValue>;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
}

const GNEWS_BASE_URL = "https://gnews.io/api/v4/top-headlines";

const getQueryValue = (value: QueryValue): string | undefined => {
  if (Array.isArray(value)) return value[0];
  return value;
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    const category = getQueryValue(req.query.category) || "general";
    const lang = getQueryValue(req.query.lang) || "en";
    const country = getQueryValue(req.query.country) || "us";
    const max = getQueryValue(req.query.max) || "12";
    const page = getQueryValue(req.query.page);

    const apiKey = process.env.GNEWS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: "Missing GNEWS_API_KEY" });
    }

    const params = new URLSearchParams({
      category,
      lang,
      country,
      max,
      apikey: apiKey,
    });

    if (page) {
      params.set("page", page);
    }

    const response = await fetch(`${GNEWS_BASE_URL}?${params.toString()}`);
    const data: unknown = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch top headlines",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}