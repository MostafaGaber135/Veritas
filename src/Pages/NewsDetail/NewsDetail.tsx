import { useEffect, useState } from "react";
import { FaArrowLeft, FaCalendar, FaGlobe, FaNewspaper, FaUser } from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FALLBACK_IMAGE } from "../../Services/newsApi";
import type { NewsItem } from "../../Types/newsTypes";

export default function NewsDetail() {
  const { articleUrl } = useParams<{ articleUrl: string }>();

  const navigate = useNavigate();
  const location = useLocation();

  const passedArticle = (location.state as { article?: NewsItem })?.article;

  const [currentArticle, setCurrentArticle] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasImageError, setHasImageError] = useState<boolean>(false);

  const tryParseJson = (value: string) => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (passedArticle) {
      setCurrentArticle(passedArticle);
      setHasImageError(false);
      setIsLoading(false);
      return;
    }

    if (articleUrl) {
      const decodedValue = (() => {
        try {
          return decodeURIComponent(articleUrl);
        } catch {
          return null;
        }
      })();

      if (decodedValue) {
        const parsedFromUrl = tryParseJson(decodedValue);
        if (parsedFromUrl) {
          setCurrentArticle(parsedFromUrl as NewsItem);
          setHasImageError(false);
          setIsLoading(false);
          return;
        }

        const cached = sessionStorage.getItem(`news:${decodedValue}`);
        if (cached) {
          const parsedFromCache = tryParseJson(cached);
          if (parsedFromCache) {
            setCurrentArticle(parsedFromCache as NewsItem);
            setHasImageError(false);
            setIsLoading(false);
            return;
          }
        }
      }
    }

    navigate("/");
  }, [articleUrl, navigate, passedArticle]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-dots loading-xl"></span>
      </div>
    );
  }

  if (!currentArticle) return null;

  const formatDate = (value: string) => {
    try {
      const date = new Date(value);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return value;
    }
  };

  return (
    <div className="min-h-screen ">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost bg-[#0f1f26] mb-6 text-teal-400 hover:text-teal-300"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>

        <article className="card bg-base-100 shadow-xl">
          <figure className="w-full bg-base-200">
            <img
              src={hasImageError || !currentArticle.image ? FALLBACK_IMAGE : currentArticle.image}
              alt={currentArticle.title}
              className="w-full h-96 object-cover"
              onError={() => setHasImageError(true)}
            />
          </figure>

          <div className="card-body">
            <h1 className="card-title text-2xl">{currentArticle.title}</h1>
            <p className="opacity-80">{currentArticle.description}</p>

            <div className="divider my-4"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {currentArticle.author && (
                <div className="flex items-center gap-2">
                  <FaUser className="text-teal-400" />
                  <span>{currentArticle.author}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <FaNewspaper className="text-teal-400" />
                <span>{currentArticle.source}</span>
              </div>

              <div className="flex items-center gap-2">
                <FaCalendar className="text-teal-400" />
                <span>{formatDate(currentArticle.published_at)}</span>
              </div>

              <div className="flex items-center gap-2">
                <FaGlobe className="text-teal-400" />
                <span>
                  {(currentArticle.country ? currentArticle.country.toUpperCase() : "N/A") +
                    " • " +
                    (currentArticle.language ? currentArticle.language.toUpperCase() : "N/A")}
                </span>
              </div>
            </div>

            <div className="card-actions justify-end mt-4">
              <a
                href={currentArticle.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
              >
                Open Source
              </a>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
