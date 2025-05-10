"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/themeContext";
import { useManga } from "../../context/mangaContext";
import Link from "next/link";
import Loading from "../../components/loading";

const PopularManga = () => {
  const { theme } = useTheme();
  const {
    getPopularManga,
    getMangaByTags,
    getMangaTags,
    loading: apiLoading,
    getCoverImageUrl,
  } = useManga();
  const [activeGenre, setActiveGenre] = useState("popular");
  const [mangaList, setMangaList] = useState([]);
  const [genres, setGenres] = useState([{ id: "popular", name: "Popular" }]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 24;

  // Fetch all manga tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await getMangaTags();
        const genreTags = tags
          .filter((tag) => tag.attributes.group === "genre")
          .map((tag) => ({
            id: tag.id,
            name: tag.attributes.name.en,
          }));
        setGenres([{ id: "popular", name: "Popular" }, ...genreTags]);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchTags();
  }, [getMangaTags]);

  // Fetch manga when active genre changes
  useEffect(() => {
    const fetchManga = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let data;
        if (activeGenre === "popular") {
          data = await getPopularManga(
            itemsPerPage,
            currentPage * itemsPerPage
          );
        } else {
          const selectedTag = genres.find((g) => g.id === activeGenre);
          if (selectedTag) {
            data = await getMangaByTags(
              [activeGenre],
              itemsPerPage,
              currentPage * itemsPerPage
            );
          }
        }

        if (data && Array.isArray(data)) {
          setMangaList(data);
        } else {
          setMangaList([]);
        }
      } catch (error) {
        console.error("Error fetching manga:", error);
        setError("Failed to load manga");
      } finally {
        setIsLoading(false);
      }
    };

    if (activeGenre) {
      fetchManga();
    }
  }, [activeGenre, genres, currentPage, getPopularManga, getMangaByTags]);

  // Reset pagination when genre changes
  useEffect(() => {
    setCurrentPage(0);
  }, [activeGenre]);

  if (isLoading && currentPage === 0) {
    return (
      <div
        className={`min-h-screen pt-24 flex items-center justify-center ${
          theme === "dark"
            ? "bg-zinc-900 text-white"
            : "bg-gray-100 text-zinc-800"
        }`}
      >
        <Loading />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pt-24 pb-10 ${
        theme === "dark"
          ? "bg-zinc-900 text-white"
          : "bg-gray-100 text-zinc-800"
      }`}
    >
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Browse Manga</h1>

        {/* Genre Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setActiveGenre(genre.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeGenre === genre.id
                    ? "bg-[#d65d0e] text-white"
                    : theme === "dark"
                    ? "bg-zinc-800 hover:bg-zinc-700"
                    : "bg-white hover:bg-gray-200"
                } transition`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {/* Manga Grid */}
        {error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#d65d0e] text-white rounded"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mangaList.map((manga) => {
                const title =
                  manga.attributes.title.en ||
                  manga.attributes.title.ja ||
                  Object.values(manga.attributes.title)[0];
                const coverUrl = getCoverImageUrl(manga);

                return (
                  <Link
                    key={manga.id}
                    href={`/manga/${manga.id}`}
                    className={`block rounded-lg overflow-hidden shadow-md hover:shadow-lg ${
                      theme === "dark" ? "bg-zinc-800" : "bg-white"
                    } transition`}
                  >
                    <div className="aspect-[2/3] relative">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">
                            No Cover
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium mb-1 line-clamp-2">
                        {title}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {mangaList.length > 0 && (
              <div className="mt-8 flex justify-center space-x-4">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className={`px-4 py-2 rounded ${
                    theme === "dark" ? "bg-zinc-800" : "bg-white"
                  } shadow-sm disabled:opacity-50`}
                >
                  Previous
                </button>
                <span
                  className={`px-4 py-2 ${
                    theme === "dark" ? "bg-zinc-800" : "bg-white"
                  } rounded`}
                >
                  Page {currentPage + 1}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className={`px-4 py-2 rounded ${
                    theme === "dark" ? "bg-zinc-800" : "bg-white"
                  } shadow-sm`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {mangaList.length === 0 && !isLoading && !error && (
          <div className="text-center py-12">
            <p>No manga found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PopularManga;
