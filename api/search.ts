const GNEWS_BASE_URL = "https://gnews.io/api/v4/search";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const sortby = searchParams.get("sortby");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const lang = searchParams.get("lang");
    const country = searchParams.get("country");
    const max = searchParams.get("max") || "12";
    const page = searchParams.get("page");

    const apiKey = process.env.GNEWS_API_KEY;

    if (!apiKey) {
      return Response.json({ message: "Missing GNEWS_API_KEY" }, { status: 500 });
    }

    if (!q || !q.trim()) {
      return Response.json({ message: "Missing search query" }, { status: 400 });
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
    const data = await response.json();

    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      {
        message: "Failed to search news",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}