"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useManga } from "@/context/mangaContext";
import { useTheme } from "@/context/themeContext";
import Loading from "@/components/loading";
import Image from "next/image";

const MangaPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const {
    getMangaDetails,
    getMangaChapters,
    getCoverImageUrl,
    loading,
    addBookmark,
    removeBookmark,
    isBookmarked,
  } = useManga();

  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [loadingState, setLoadingState] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchMangaData = async () => {
      try {
        setLoadingState(true);
        const mangaData = await getMangaDetails(id);
        if (!mangaData) {
          setError("Manga not found");
          return;
        }
        setManga(mangaData);
        setBookmarked(isBookmarked(id));

        // Fetch chapters
        const chaptersData = await getMangaChapters(id);
        setChapters(chaptersData);
      } catch (error) {
        console.error("Error fetching manga data:", error);
        setError("Failed to load manga data");
      } finally {
        setLoadingState(false);
      }
    };

    if (id) {
      fetchMangaData();
    }
  }, [id, getMangaDetails, getMangaChapters, isBookmarked]);

  const handleBookmarkToggle = () => {
    if (bookmarked) {
      removeBookmark(id);
      setBookmarked(false);
    } else if (manga) {
      addBookmark(manga);
      setBookmarked(true);
    }
  };

  if (loadingState) {
    return (
      <div
        className={`min-h-screen pt-24 ${
          theme === "dark"
            ? "bg-zinc-900 text-white"
            : "bg-gray-100 text-zinc-800"
        }`}
      >
        <div className="container mx-auto px-4 flex justify-center items-center h-64">
          <Loading />
        </div>
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div
        className={`min-h-screen pt-24 ${
          theme === "dark"
            ? "bg-zinc-900 text-white"
            : "bg-gray-100 text-zinc-800"
        }`}
      >
        <div className="container mx-auto px-4 text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="mb-6">{error || "Failed to load manga"}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded bg-[#d65d0e] text-white hover:bg-[#fe8019] transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const coverUrl = getCoverImageUrl(manga);
  const title =
    manga.attributes.title.en ||
    manga.attributes.title.ja ||
    Object.values(manga.attributes.title)[0];
  const description =
    manga.attributes.description?.en || "No description available.";
  const status = manga.attributes.status
    ? manga.attributes.status.charAt(0).toUpperCase() +
      manga.attributes.status.slice(1)
    : "Unknown";

  // Find author and artist
  const author =
    manga.relationships?.find((rel) => rel.type === "author")?.attributes
      ?.name || "Unknown";
  const artist =
    manga.relationships?.find((rel) => rel.type === "artist")?.attributes
      ?.name || "Unknown";

  // Get genres/tags
  const tags =
    manga.attributes.tags?.map((tag) => tag.attributes?.name?.en) || [];

  // Process chapters for display
  const processedChapters = chapters
    .filter((chapter) => chapter.attributes.chapter) // Filter out chapters without numbers
    .sort((a, b) => {
      const chapterA = parseFloat(a.attributes.chapter);
      const chapterB = parseFloat(b.attributes.chapter);
      return chapterB - chapterA; // Sort in descending order (newest first)
    });

  return (
    <div
      className={`min-h-screen pt-24 pb-10 ${
        theme === "dark"
          ? "bg-zinc-900 text-white"
          : "bg-gray-100 text-zinc-800"
      }`}
    >
      <div className="container mx-auto px-4">
        <div
          className={`rounded-lg overflow-hidden shadow-lg mb-6 ${
            theme === "dark" ? "bg-zinc-800" : "bg-white"
          }`}
        >
          {/* Manga Header */}
          <div className="flex flex-col md:flex-row p-6">
            {/* Cover Image */}
            <div className="relative w-48 h-72 md:w-64 md:h-96 flex-shrink-0 mx-auto md:mx-0 mb-6 md:mb-0">
              <Image
                fill
                sizes="(max-width: 768px) 192px, 256px"
                quality={90}
                priority={true}
                src={coverUrl}
                alt={`Cover for ${title}`}
                className="object-cover rounded shadow-md"
              />
            </div>

            {/* Manga Info */}
            <div className="md:ml-8 flex-1">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h1 className="text-3xl font-bold">{title}</h1>
                <button
                  onClick={handleBookmarkToggle}
                  className={`mt-4 md:mt-0 px-4 py-2 rounded-full flex items-center transition ${
                    bookmarked
                      ? "bg-[#d65d0e] text-white"
                      : theme === "dark"
                      ? "bg-zinc-700 text-gray-200 hover:bg-[#d65d0e] hover:text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-[#d65d0e] hover:text-white"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill={bookmarked ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  {bookmarked ? "Bookmarked" : "Add Bookmark"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm opacity-70 mb-1">Status</p>
                  <p className="font-medium">{status}</p>
                </div>
                <div>
                  <p className="text-sm opacity-70 mb-1">Author</p>
                  <p className="font-medium">{author}</p>
                </div>
                <div>
                  <p className="text-sm opacity-70 mb-1">Artist</p>
                  <p className="font-medium">{artist}</p>
                </div>
                <div>
                  <p className="text-sm opacity-70 mb-1">Chapters</p>
                  <p className="font-medium">
                    {processedChapters.length || "N/A"}
                  </p>
                </div>
              </div>

              {/* Tags/Genres */}
              {tags.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm opacity-70 mb-2">Genres</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm ${
                          theme === "dark"
                            ? "bg-zinc-700 text-gray-200"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {processedChapters.length > 0 && (
                <div className="mt-auto">
                  <Link
                    href={`/manga/${id}/${
                      processedChapters[processedChapters.length - 1].id
                    }`}
                    className="px-2 md:px-4 text-sm md:text-lg py-2 rounded bg-[#d65d0e] text-white hover:bg-[#fe8019] transition mr-2 md:mr-4"
                  >
                    Read First Chapter
                  </Link>
                  <Link
                    href={`/manga/${id}/${processedChapters[0].id}`}
                    className={`px-2 md:px-4 text-sm md:text-lg py-2 rounded transition ${
                      theme === "dark"
                        ? "bg-zinc-700 text-white hover:bg-zinc-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Latest Chapter
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Tabs Navigation */}
          <div
            className={`flex border-b ${
              theme === "dark" ? "border-zinc-700" : "border-gray-200"
            }`}
          >
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-3 text-center font-medium ${
                activeTab === "overview"
                  ? "text-[#d65d0e] border-b-2 border-[#d65d0e]"
                  : "text-opacity-70 hover:text-opacity-100"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("chapters")}
              className={`px-6 py-3 text-center font-medium ${
                activeTab === "chapters"
                  ? "text-[#d65d0e] border-b-2 border-[#d65d0e]"
                  : "text-opacity-70 hover:text-opacity-100"
              }`}
            >
              Chapters
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "overview" ? (
              <div>
                <h2 className="text-xl font-bold mb-4">Synopsis</h2>
                <p className="whitespace-pre-line">{description}</p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold mb-4">Chapters</h2>
                {processedChapters.length === 0 ? (
                  <p>No chapters available.</p>
                ) : (
                  <div
                    className={`rounded-lg overflow-hidden ${
                      theme === "dark" ? "bg-zinc-700" : "bg-gray-50"
                    }`}
                  >
                    {processedChapters.map((chapter, index) => (
                      <Link
                        href={`/manga/${id}/${chapter.id}`}
                        key={chapter.id}
                        className={`flex items-center justify-between px-4 py-3 hover:bg-[#d65d0e] hover:text-white transition ${
                          index !== processedChapters.length - 1
                            ? theme === "dark"
                              ? "border-b border-zinc-600"
                              : "border-b border-gray-200"
                            : ""
                        }`}
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            Chapter {chapter.attributes.chapter}
                            {chapter.attributes.title &&
                              `: ${chapter.attributes.title}`}
                          </p>
                          <p className="text-sm opacity-70">
                            {new Date(
                              chapter.attributes.publishAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
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
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaPage;
