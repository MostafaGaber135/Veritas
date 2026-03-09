const GNEWS_BASE_URL = "https://gnews.io/api/v4/top-headlines";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const category = searchParams.get("category") || "general";
        const lang = searchParams.get("lang") || "en";
        const country = searchParams.get("country") || "us";
        const max = searchParams.get("max") || "12";
        const page = searchParams.get("page");

        const apiKey = process.env.GNEWS_API_KEY;

        if (!apiKey) {
            return Response.json({ message: "Missing GNEWS_API_KEY" }, { status: 500 });
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
        const data = await response.json();

        return Response.json(data, { status: response.status });
    } catch (error) {
        return Response.json(
            {
                message: "Failed to fetch top headlines",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}