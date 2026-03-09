import { useState } from "react";
import { FaArrowRight, FaSearch, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FALLBACK_IMAGE, searchNews } from "../../Services/newsApi";
import type { NewsItem } from "../../Types/newsTypes";

const PAGE_SIZE = 10;
const CATEGORIES = ["General", "Business", "Entertainment", "Health", "Science", "Sports", "Technology"];
const DATE_RANGES = [
  { label: "Past 24 hours", value: "24h" },
  { label: "Past Week", value: "7d" },
  { label: "Past Month", value: "30d" },
];

export default function SearchPage() {
  const [queryText, setQueryText] = useState<string>("");
  const [results, setResults] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [chosenCategories, setChosenCategories] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<string>("24h");
  const [sortBy, setSortBy] = useState<"publishedAt" | "relevance">("relevance");
  const buildDateRange = (range: string) => {
    const now = new Date();
    const to = now.toISOString().split("T")[0];
    let fromDate: Date;

    if (range === "24h") {
      fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (range === "7d") {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === "30d") {
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    return { from: fromDate.toISOString().split("T")[0], to };
  };
  const runSearch = async (query: string, page: number = 1) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { from, to } = buildDateRange(selectedDateRange);
      const singleCategory = chosenCategories.length === 1 ? chosenCategories[0] : undefined;

      const response = await searchNews(query, {
        category: singleCategory,
        sortBy,
        from,
        to,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });

      setResults(response.data);
      setTotalCount(response.pagination.total);
      setPageNumber(page);
    } catch (err) {
      setErrorMessage("Failed to search news. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (queryText.trim()) {
      runSearch(queryText.trim(), 1);
    }
  };
  const handleApplyFilters = () => {
    if (queryText.trim()) {
      runSearch(queryText.trim(), 1);
    }
  };
  const handleClearAll = () => {
    setChosenCategories([]);
    setSelectedDateRange("24h");
    setSortBy("relevance");
    if (queryText.trim()) {
      runSearch(queryText.trim(), 1);
    }
  };
  const toggleCategory = (category: string) => {
    setChosenCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const startResult = totalCount > 0 ? (pageNumber - 1) * PAGE_SIZE + 1 : 0;
  const endResult = Math.min(pageNumber * PAGE_SIZE, totalCount);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <form onSubmit={handleSubmitSearch} className="relative">
            <div className="relative flex items-center bg-[#1f2937] rounded-lg shadow-sm border border-base-300">
              <FaSearch className="absolute left-4 text-base-content/50" />
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Search..."
                className="w-full pl-12 pr-12 py-3 md:py-4 bg-transparent text-base-content placeholder-base-content/50 focus:outline-none"
              />
              {queryText && (
                <button
                  type="button"
                  onClick={() => {
                    setQueryText("");
                    setResults([]);
                    setTotalCount(0);
                  }}
                  className="absolute right-4 text-base-content/50 hover:text-base-content"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-[#1f2937] rounded-lg shadow-sm p-4 md:p-6 lg:sticky lg:top-4">
              <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-base-content">Filter Results</h2>

              <div className="mb-4 md:mb-6">
                <h3 className="text-xs md:text-sm font-semibold mb-2 md:mb-3 text-base-content/70 uppercase">
                  Categories
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                  {CATEGORIES.map((categories) => (
                    <label key={categories} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={chosenCategories.includes(categories)}
                        onChange={() => toggleCategory(categories)}
                        className="checkbox checkbox-sm checkbox-color"
                      />
                      <span className="text-sm text-base-content">{categories}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4 md:mb-6">
                <h3 className="text-xs md:text-sm font-semibold mb-2 md:mb-3 text-base-content/70 uppercase">
                  Date Range
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                  {DATE_RANGES.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => setSelectedDateRange(range.value)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedDateRange === range.value
                        ? "bg-[#00a9a5] text-primary-content cursor-pointer"
                        : "bg-base-200 text-base-content hover:bg-base-300 cursor-pointer"
                        }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4 md:mb-6">
                <h3 className="text-xs md:text-sm font-semibold mb-2 md:mb-3 text-base-content/70 uppercase">
                  Sort By
                </h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "publishedAt" | "relevance")}
                  className="select select-bordered select-sm w-full cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  <option value="publishedAt">Published Date</option>
                </select>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                <button
                  onClick={handleApplyFilters}
                  className="btn bg-[#00a9a5] btn-sm w-full cursor-pointer"
                  disabled={isLoading}
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleClearAll}
                  className="btn btn-ghost btn-sm w-full text-base-content/70"
                >
                  Clear All
                </button>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {isLoading && (
              <div className="flex justify-center py-16 md:py-20">
                <span className="loading loading-dots loading-lg md:loading-xl"></span>
              </div>
            )}

            {errorMessage && (
              <div className="alert alert-error mb-4 md:mb-6">
                <span>{errorMessage}</span>
              </div>
            )}

            {!isLoading && !errorMessage && results.length > 0 && (
              <>
                <div className="mb-4 md:mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2 text-base-content">Search Results</h1>
                  <p className="text-sm md:text-base text-base-content/70">
                    Showing {startResult.toLocaleString()} to {endResult.toLocaleString()} of{" "}
                    {totalCount.toLocaleString()} results for '{queryText}'
                  </p>
                </div>

                <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
                  {results.map((item) => (
                    <Link
                      key={item.url}
                      to={`/news/${encodeURIComponent(JSON.stringify(item))}`}
                      className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="card-body p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                          <figure className="w-full sm:w-32 h-48 sm:h-32 shrink-0">
                            <img
                              src={item.image ?? FALLBACK_IMAGE}
                              alt={item.title}
                              className="w-full h-full object-cover rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = FALLBACK_IMAGE;
                              }}
                            />
                          </figure>
                          <div className="flex-1">
                            <div className="badge badge-primary badge-sm mb-2">
                              {item.category.toUpperCase()}
                            </div>
                            <h2 className="text-lg md:text-xl font-bold mb-2 text-base-content line-clamp-2">
                              {item.title}
                            </h2>
                            <p className="text-xs md:text-sm text-base-content/70 mb-2">
                              By {item.author || "Unknown"} • {item.source} •{" "}
                              {new Date(item.published_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-sm md:text-base text-base-content/80 line-clamp-2 mb-3">
                              {item.description}
                            </p>
                            <div className="inline-flex items-center gap-2 text-primary hover:text-primary-focus transition-colors">
                              Read More
                              <FaArrowRight className="text-xs" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-col items-center lg:items-end gap-2">
                    <div className="join">
                      <button
                        onClick={() => {
                          if (pageNumber > 1) {
                            runSearch(queryText, pageNumber - 1);
                          }
                        }}
                        disabled={pageNumber === 1}
                        className="join-item btn btn-sm"
                      >
                        ‹
                      </button>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageToShow: number;

                        if (totalPages <= 5) {
                          pageToShow = i + 1;
                        } else if (pageNumber <= 3) {
                          pageToShow = i + 1;
                        } else if (pageNumber >= totalPages - 2) {
                          pageToShow = totalPages - 4 + i;
                        } else {
                          pageToShow = pageNumber - 2 + i;
                        }

                        return (
                          <button
                            key={pageToShow}
                            onClick={() => runSearch(queryText, pageToShow)}
                            className={`join-item btn btn-sm ${pageNumber === pageToShow ? "btn-active" : ""}`}
                          >
                            {pageToShow}
                          </button>
                        );
                      })}

                      {totalPages > 5 && pageNumber < totalPages - 2 && (
                        <button className="join-item btn btn-sm btn-disabled">...</button>
                      )}

                      {totalPages > 5 && (
                        <button
                          onClick={() => runSearch(queryText, totalPages)}
                          className={`join-item btn btn-sm ${pageNumber === totalPages ? "btn-active" : ""}`}
                        >
                          {totalPages}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (pageNumber < totalPages) {
                            runSearch(queryText, pageNumber + 1);
                          }
                        }}
                        disabled={pageNumber === totalPages}
                        className="join-item btn btn-sm"
                      >
                        ›
                      </button>
                    </div>

                    <p className="text-xs md:text-sm text-base-content/70">
                      Showing {startResult} to {endResult} of {totalCount.toLocaleString()} results
                    </p>
                  </div>
                )}
              </>
            )}

            {!isLoading && !errorMessage && results.length === 0 && queryText && (
              <div className="text-center py-16 md:py-20">
                <p className="text-lg md:text-xl text-base-content/70">No results found for '{queryText}'</p>
                <p className="text-base-content/50 mt-2">Try adjusting your search or filters</p>
              </div>
            )}

            {!isLoading && !errorMessage && !queryText && (
              <div className="text-center py-16 md:py-20">
                <FaSearch className="mx-auto text-5xl md:text-6xl text-base-content/30 mb-4" />
                <p className="text-lg md:text-xl text-base-content/70">Start searching for news</p>
                <p className="text-base-content/50 mt-2">Enter a search query above</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
