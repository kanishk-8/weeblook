"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTheme } from "../../../context/themeContext";
import { useManga } from "../../../context/mangaContext";
import Link from "next/link";
import Loading from "../../../components/loading";

const MangaPage = () => {
  const params = useParams();
  const mangaId = params.id;
  const { theme } = useTheme();
  const {
    getMangaById,
    getMangaChapters,
    loading: apiLoading,
    getCoverImageUrl,
  } = useManga();

  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchManga = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch manga details
        const mangaData = await getMangaById(mangaId);
        setManga(mangaData);

        // Check if manga is bookmarked
        const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
        setIsBookmarked(bookmarks.some((b) => b.id === mangaId));

        // Fetch chapters
        const chaptersData = await getMangaChapters(mangaId);
        console.log(`Got ${chaptersData.length} chapters for manga ${mangaId}`);

        // Sort chapters by number
        const sortedChapters = chaptersData.sort((a, b) => {
          const chapterA = parseFloat(a.attributes.chapter || "0");
          const chapterB = parseFloat(b.attributes.chapter || "0");
          return chapterB - chapterA; // Descending order (newest first)
        });

        setChapters(sortedChapters);
      } catch (error) {
        console.error("Error fetching manga details:", error);
        setError(error.message || "Failed to load manga");
      } finally {
        setIsLoading(false);
      }
    };

    if (mangaId) {
      fetchManga();
    }
  }, [mangaId, getMangaById, getMangaChapters]);

  const toggleBookmark = () => {
    if (!manga) return;

    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");

    if (isBookmarked) {
      // Remove from bookmarks
      const updatedBookmarks = bookmarks.filter((b) => b.id !== mangaId);
      localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
      setIsBookmarked(false);
    } else {
      // Add to bookmarks
      const newBookmark = {
        id: manga.id,
        title:
          manga.attributes.title.en ||
          manga.attributes.title.ja ||
          Object.values(manga.attributes.title)[0],
        coverUrl: getCoverImageUrl(manga),
        addedAt: new Date().toISOString(),
      };
      bookmarks.push(newBookmark);
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };

  if (isLoading || apiLoading) {
    return (
      <div
        className={`min-h-screen pt-24 pb-10 flex justify-center items-center ${
          theme === "dark"
            ? "bg-zinc-900 text-white"
            : "bg-gray-100 text-zinc-800"
        }`}
      >
        <Loading />
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div
        className={`min-h-screen pt-24 pb-10 ${
          theme === "dark"
            ? "bg-zinc-900 text-white"
            : "bg-gray-100 text-zinc-800"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Manga Not Found</h1>
            <p className="mb-4">
              {error || "The manga you are looking for could not be found."}
            </p>
            <Link
              href="/popularmanga"
              className="text-[#d65d0e] hover:underline"
            >
              Browse Popular Manga
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Extract manga data
  const title =
    manga.attributes.title.en ||
    manga.attributes.title.ja ||
    Object.values(manga.attributes.title)[0];
  const description =
    manga.attributes.description?.en || "No description available";
  const status = manga.attributes.status || "Unknown";
  const coverUrl = getCoverImageUrl(manga);

  // Extract authors and artists
  const authors = manga.relationships
    ?.filter((rel) => rel.type === "author")
    .map((author) => author.attributes?.name || "Unknown Author");

  const artists = manga.relationships
    ?.filter((rel) => rel.type === "artist")
    .map((artist) => artist.attributes?.name || "Unknown Artist");

  // Extract genres/tags
  const tags = manga.attributes.tags
    ?.filter((tag) => tag.attributes.group === "genre")
    .map((tag) => tag.attributes.name.en);

  return (
    <div
      className={`min-h-screen pt-24 pb-10 ${
        theme === "dark"
          ? "bg-zinc-900 text-white"
          : "bg-gray-100 text-zinc-800"
      }`}
    >
      <div className="container mx-auto px-4">
        {/* Manga Header with Cover and Basic Info */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Cover Image */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div
              className={`rounded-lg overflow-hidden shadow-lg ${
                theme === "dark" ? "bg-zinc-800" : "bg-white"
              }`}
            >
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={`Cover for ${title}`}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="aspect-[2/3] bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">No Cover Available</span>
                </div>
              )}
            </div>

            {/* Bookmark Button */}
            <button
              onClick={toggleBookmark}
              className={`w-full py-3 mt-4 rounded-lg font-medium transition ${
                isBookmarked
                  ? "bg-[#d65d0e] text-white"
                  : theme === "dark"
                  ? "bg-zinc-800 text-white hover:bg-zinc-700"
                  : "bg-white text-zinc-800 hover:bg-gray-200"
              }`}
            >
              {isBookmarked ? "Remove from Bookmarks" : "Add to Bookmarks"}
            </button>
          </div>

          {/* Manga Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{title}</h1>

            {/* Authors & Artists */}
            <div className="mb-4">
              {authors?.length > 0 && (
                <p className="text-sm">
                  <span className="opacity-70">Author:</span>{" "}
                  {authors.join(", ")}
                </p>
              )}
              {artists?.length > 0 && (
                <p className="text-sm">
                  <span className="opacity-70">Artist:</span>{" "}
                  {artists.join(", ")}
                </p>
              )}
              <p className="text-sm">
                <span className="opacity-70">Status:</span>{" "}
                <span
                  className={`font-medium ${
                    status === "completed"
                      ? "text-green-500"
                      : status === "ongoing"
                      ? "text-blue-500"
                      : ""
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </p>
            </div>

            {/* Tags/Genres */}
            {tags?.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/popularmanga?tag=${tag.toLowerCase()}`}
                      className={`px-3 py-1 text-sm rounded-full ${
                        theme === "dark"
                          ? "bg-zinc-800 hover:bg-zinc-700"
                          : "bg-white hover:bg-gray-200"
                      }`}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <p className="text-base leading-relaxed opacity-90 whitespace-pre-line">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs for Info and Chapters */}
        <div className="mb-6">
          <div className="flex border-b border-gray-300 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("info")}
              className={`py-3 px-6 font-medium ${
                activeTab === "info"
                  ? "border-b-2 border-[#d65d0e] text-[#d65d0e]"
                  : ""
              }`}
            >
              Information
            </button>
            <button
              onClick={() => setActiveTab("chapters")}
              className={`py-3 px-6 font-medium ${
                activeTab === "chapters"
                  ? "border-b-2 border-[#d65d0e] text-[#d65d0e]"
                  : ""
              }`}
            >
              Chapters {chapters.length > 0 && `(${chapters.length})`}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === "info" && (
            <div
              className={`p-4 rounded-lg ${
                theme === "dark" ? "bg-zinc-800" : "bg-white"
              }`}
            >
              <h2 className="text-xl font-bold mb-4">Additional Information</h2>

              {/* Publication Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Publication</h3>
                  <p className="text-sm mb-1">
                    <span className="opacity-70">Status:</span>{" "}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="opacity-70">Year:</span>{" "}
                    {manga.attributes.year || "Unknown"}
                  </p>
                  {manga.attributes.publicationDemographic && (
                    <p className="text-sm mb-1">
                      <span className="opacity-70">Demographic:</span>{" "}
                      {manga.attributes.publicationDemographic
                        .charAt(0)
                        .toUpperCase() +
                        manga.attributes.publicationDemographic.slice(1)}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Content Rating</h3>
                  <p className="text-sm">
                    <span
                      className={`px-2 py-1 rounded text-white ${
                        manga.attributes.contentRating === "safe"
                          ? "bg-green-500"
                          : manga.attributes.contentRating === "suggestive"
                          ? "bg-yellow-500"
                          : manga.attributes.contentRating === "erotica"
                          ? "bg-red-500"
                          : "bg-gray-500"
                      }`}
                    >
                      {manga.attributes.contentRating.charAt(0).toUpperCase() +
                        manga.attributes.contentRating.slice(1)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Alternative Titles */}
              {manga.attributes.altTitles &&
                manga.attributes.altTitles.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">
                      Alternative Titles
                    </h3>
                    <ul className="space-y-1">
                      {manga.attributes.altTitles.map((title, index) => {
                        const langCode = Object.keys(title)[0];
                        const titleText = title[langCode];
                        return (
                          <li key={index} className="text-sm">
                            <span className="opacity-70">
                              {langCode.toUpperCase()}:
                            </span>{" "}
                            {titleText}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
            </div>
          )}

          {activeTab === "chapters" && (
            <div
              className={`rounded-lg ${
                theme === "dark" ? "bg-zinc-800" : "bg-white"
              }`}
            >
              {chapters.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {chapters.map((chapter) => (
                    <Link
                      key={chapter.id}
                      href={`/manga/${mangaId}/${chapter.attributes.chapter}`}
                      className="flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-zinc-700"
                    >
                      <div>
                        <p className="font-medium">
                          Chapter {chapter.attributes.chapter}:{" "}
                          {chapter.attributes.title || "No Title"}
                        </p>
                        <p className="text-sm opacity-70">
                          {new Date(
                            chapter.attributes.publishAt
                          ).toLocaleDateString()}
                          {chapter.relationships?.find(
                            (rel) => rel.type === "scanlation_group"
                          )?.attributes?.name &&
                            ` • ${
                              chapter.relationships.find(
                                (rel) => rel.type === "scanlation_group"
                              ).attributes.name
                            }`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            theme === "dark" ? "bg-zinc-700" : "bg-gray-200"
                          }`}
                        >
                          {chapter.attributes.pages || "?"} pages
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-[#d65d0e]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p>No chapters available for this manga.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MangaPage;
