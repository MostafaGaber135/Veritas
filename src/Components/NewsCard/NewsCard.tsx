import { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FALLBACK_IMAGE, fetchNewsByCategory } from "../../Services/newsApi";
import type { NewsItem } from "../../Types/newsTypes";

type NewsCardProps = { category: string };
const PAGE_SIZE = 8;

export default function NewsCard({ category }: NewsCardProps) {
  
  const categoryValue = (category || "general").toLowerCase();
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [currentOffset, setCurrentOffset] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setArticles([]);
    setCurrentOffset(0);
    setTotalCount(0);
    setErrorMessage(null);
    setIsLoading(true);

    fetchNewsByCategory(categoryValue, PAGE_SIZE, 0)
      .then((res) => {
        setArticles(res.data);
        setTotalCount(res.pagination.total);
      })
      .catch(() => setErrorMessage("Failed to load news"))
      .finally(() => setIsLoading(false));
  }, [categoryValue]);

  const canLoadMore = articles.length < totalCount;

  const handleLoadMore = () => {
    const nextOffset = currentOffset + PAGE_SIZE;
    setIsLoadingMore(true);

    fetchNewsByCategory(categoryValue, PAGE_SIZE, nextOffset)
      .then((response) => {
        setArticles((prev) => [...prev, ...response.data]);
        setCurrentOffset(nextOffset);
        setTotalCount(response.pagination.total);
      })
      .catch(() => setErrorMessage("Failed to load more news"))
      .finally(() => setIsLoadingMore(false));
  };

  return (
    <div className="w-full px-10 pt-8">
      {isLoading && (
        <div className="flex justify-center py-10">
          <span className="loading loading-dots loading-xl"></span>
        </div>
      )}

      {errorMessage && !isLoading && (
        <div className="alert alert-error my-6">
          <span>{errorMessage}</span>
        </div>
      )}

      {!isLoading && !errorMessage && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
            {articles.map((item) => (
              <article
                key={item.url}
                className="card bg-base-100 shadow-sm h-full overflow-hidden"
              >
                <figure className="w-full">
                  <img
                    src={item.image ?? FALLBACK_IMAGE}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = FALLBACK_IMAGE;
                    }}
                  />
                </figure>

                <div className="card-body p-5 flex flex-col">
                  <span className="text-xs opacity-70">{item.category}</span>

                  <h2 className="text-base font-semibold leading-snug line-clamp-2">
                    {item.title}
                  </h2>

                  <div className="mt-auto pt-3">
                    <Link
                      to={`/news/${encodeURIComponent(JSON.stringify(item))}`}
                      className="group inline-flex items-center gap-2 text-teal-400 no-underline transition-colors hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/40"
                    >
                      Read More
                      <FaArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="flex justify-center py-10">
            {canLoadMore ? (
              <button
                onClick={handleLoadMore}
                className="btn btn-accent cursor-pointer"
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <span className="loading loading-dots"></span>
                ) : (
                  "Load More Articles"
                )}
              </button>
            ) : (
              <button className="btn btn-ghost" disabled>
                No more articles
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
