"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useManga } from "@/context/mangaContext";
import { useTheme } from "@/context/themeContext";
import Loading from "@/components/loading";

const Chapter = () => {
  const { id: mangaId, chapterNum: chapterId } = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { getChapterPages, getMangaDetails, getMangaChapters } = useManga();

  const [chapterPages, setChapterPages] = useState(null);
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [readingMode, setReadingMode] = useState("vertical"); // vertical, horizontal
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("chapters"); // chapters, settings

  // Memoized function to sort and filter chapters
  const processChapters = useCallback((chaptersData) => {
    if (!chaptersData || chaptersData.length === 0) return [];
    return chaptersData
      .filter((chapter) => chapter.attributes.chapter)
      .sort(
        (a, b) =>
          parseFloat(a.attributes.chapter) - parseFloat(b.attributes.chapter)
      );
  }, []);

  // Optimized chapter data fetching
  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        setLoading(true);

        // Use Promise.all to fetch data in parallel
        const [pagesData, mangaData, chaptersData] = await Promise.all([
          getChapterPages(chapterId),
          getMangaDetails(mangaId),
          getMangaChapters(mangaId),
        ]);

        if (!pagesData) {
          setError("Failed to load chapter pages");
          setLoading(false);
          return;
        }
        setChapterPages(pagesData);

        if (!mangaData) {
          setError("Failed to load manga details");
          setLoading(false);
          return;
        }
        setManga(mangaData);

        if (chaptersData && chaptersData.length > 0) {
          const sortedChapters = processChapters(chaptersData);
          setChapters(sortedChapters);

          // Find current chapter index
          const index = sortedChapters.findIndex(
            (chapter) => chapter.id === chapterId
          );
          setCurrentChapterIndex(index);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading chapter:", error);
        setError("Failed to load chapter");
        setLoading(false);
      }
    };

    if (mangaId && chapterId) {
      fetchChapterData();
    }
    // Only re-fetch when manga ID or chapter ID changes
  }, [mangaId, chapterId, processChapters]);

  useEffect(() => {
    // Reset page to top when chapter changes
    setCurrentPage(0);
    window.scrollTo(0, 0);
  }, [chapterId]);

  const handleNextPage = () => {
    if (
      readingMode === "horizontal" &&
      chapterPages &&
      currentPage < chapterPages.pages.length - 1
    ) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (readingMode === "horizontal" && currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleKeyNavigation = (e) => {
    if (readingMode === "horizontal") {
      if (e.key === "ArrowRight" || e.key === "d") {
        handleNextPage();
      } else if (e.key === "ArrowLeft" || e.key === "a") {
        handlePrevPage();
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyNavigation);
    return () => window.removeEventListener("keydown", handleKeyNavigation);
  }, [currentPage, chapterPages, readingMode]);

  const navigateToChapter = (chapterId) => {
    router.push(`/manga/${mangaId}/${chapterId}`);
  };

  const toggleReadingMode = () => {
    setReadingMode((prev) => (prev === "vertical" ? "horizontal" : "vertical"));
    setCurrentPage(0); // Reset to first page when toggling modes
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          theme === "dark"
            ? "bg-zinc-900 text-white"
            : "bg-gray-100 text-zinc-800"
        }`}
      >
        <div className="container mx-auto px-4 flex justify-center items-center h-screen">
          <Loading />
        </div>
      </div>
    );
  }

  if (error || !chapterPages || !manga) {
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
          <p className="mb-6">{error || "Failed to load chapter"}</p>
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

  const title =
    manga.attributes.title.en ||
    manga.attributes.title.ja ||
    Object.values(manga.attributes.title)[0];
  const currentChapter = chapters[currentChapterIndex];
  const prevChapter =
    currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null;
  const nextChapter =
    currentChapterIndex < chapters.length - 1
      ? chapters[currentChapterIndex + 1]
      : null;

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-zinc-900 text-white"
          : "bg-gray-100 text-zinc-800"
      }`}
    >
      {/* Collapsible Sidebar */}
      <div
        className={`fixed top-0 ${
          sidebarOpen ? "left-0" : "left-[-250px]"
        } bottom-0 w-[250px] z-50 transition-all duration-300 ease-in-out
          ${theme === "dark" ? "bg-zinc-800" : "bg-white"} shadow-lg`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold">
              <Link
                href={`/manga/${mangaId}`}
                className="hover:text-[#d65d0e] transition"
              >
                Back to Details
              </Link>
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-[#d65d0e]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setSidebarTab("chapters")}
              className={`flex-1 py-3 px-4 text-center ${
                sidebarTab === "chapters"
                  ? "border-b-2 border-[#d65d0e] font-medium"
                  : ""
              }`}
            >
              Chapters
            </button>
            <button
              onClick={() => setSidebarTab("settings")}
              className={`flex-1 py-3 px-4 text-center ${
                sidebarTab === "settings"
                  ? "border-b-2 border-[#d65d0e] font-medium"
                  : ""
              }`}
            >
              Settings
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {sidebarTab === "chapters" ? (
              <div className="p-2">
                {manga && (
                  <div className="p-2 mb-2 text-center">
                    <div className="font-bold text-lg line-clamp-2">
                      {manga.attributes.title.en ||
                        manga.attributes.title.ja ||
                        Object.values(manga.attributes.title)[0]}
                    </div>
                  </div>
                )}

                {/* Chapter List */}
                <div className="space-y-1 mt-2">
                  {chapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      onClick={() => {
                        navigateToChapter(chapter.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded ${
                        chapter.id === chapterId
                          ? "bg-[#d65d0e] text-white"
                          : theme === "dark"
                          ? "hover:bg-zinc-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="font-medium">
                        Chapter {chapter.attributes.chapter}
                      </div>
                      {chapter.attributes.title && (
                        <div className="text-sm opacity-75 truncate">
                          {chapter.attributes.title}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4">
                {/* Reading Mode Settings */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Reading Mode</h3>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => {
                        setReadingMode("vertical");
                      }}
                      className={`px-4 py-2 rounded-lg text-left flex items-center ${
                        readingMode === "vertical"
                          ? "bg-[#d65d0e] text-white"
                          : theme === "dark"
                          ? "bg-zinc-700 hover:bg-zinc-600"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5z" />
                        <path d="M13 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5z" />
                        <path d="M13 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Vertical Scrolling
                    </button>

                    <button
                      onClick={() => {
                        setReadingMode("horizontal");
                      }}
                      className={`px-4 py-2 rounded-lg text-left flex items-center ${
                        readingMode === "horizontal"
                          ? "bg-[#d65d0e] text-white"
                          : theme === "dark"
                          ? "bg-zinc-700 hover:bg-zinc-600"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path
                          fillRule="evenodd"
                          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Paged Reading
                    </button>
                  </div>
                </div>

                {/* Chapter Navigation */}
                <div className="space-y-2">
                  <h3 className="font-medium mb-2">Navigation</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {prevChapter && (
                      <button
                        onClick={() => {
                          navigateToChapter(prevChapter.id);
                          setSidebarOpen(false);
                        }}
                        className="px-4 py-2 rounded bg-[#d65d0e] text-white hover:bg-[#fe8019] transition flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Previous
                      </button>
                    )}

                    {nextChapter && (
                      <button
                        onClick={() => {
                          navigateToChapter(nextChapter.id);
                          setSidebarOpen(false);
                        }}
                        className="px-4 py-2 rounded bg-[#d65d0e] text-white hover:bg-[#fe8019] transition flex items-center justify-center"
                      >
                        Next
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 ml-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toggle sidebar button - always visible */}
      <button
        onClick={() => setSidebarOpen(true)}
        className={`fixed top-4 left-4 z-40 p-2 rounded-full opacity-80 hover:opacity-100 ${
          theme === "dark" ? "bg-zinc-800" : "bg-white"
        } shadow-lg`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Main content area */}
      <div className={`pt-16 transition-all duration-300`}>
        <div className="container mx-auto px-0 sm:px-4">
          {!loading && chapterPages && (
            <>
              {readingMode === "vertical" ? (
                // Vertical reading mode - Optimized for performance with virtualization
                <div className="flex flex-col items-center py-4 mb-4">
                  {/* Using lazy loading for images */}
                  {chapterPages.pages.map((page, index) => (
                    <div key={index} className="mb-4 max-w-full">
                      <img
                        src={`${chapterPages.baseUrl}/data/${chapterPages.hash}/${page}`}
                        alt={`Page ${index + 1}`}
                        className="max-w-full h-auto"
                        loading={index < 3 ? "eager" : "lazy"} // Only eagerly load first 3 images
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                      />
                    </div>
                  ))}

                  {/* Chapter navigation buttons */}
                  <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 p-4 rounded-full flex gap-4 bg-black/50 backdrop-blur-sm">
                    {prevChapter && (
                      <button
                        onClick={() => navigateToChapter(prevChapter.id)}
                        className="px-4 py-2 rounded-full bg-[#d65d0e] text-white hover:bg-[#fe8019] transition flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Prev
                      </button>
                    )}

                    <button
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className={`px-4 py-2 rounded-full ${
                        theme === "dark"
                          ? "bg-zinc-700 text-white hover:bg-zinc-600"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      } transition`}
                    >
                      Chapters
                    </button>

                    {nextChapter && (
                      <button
                        onClick={() => navigateToChapter(nextChapter.id)}
                        className="px-4 py-2 rounded-full bg-[#d65d0e] text-white hover:bg-[#fe8019] transition flex items-center"
                      >
                        Next
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 ml-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                // Horizontal reading mode - Optimized with preloading adjacent pages
                <div className="flex flex-col items-center justify-center min-h-screen relative">
                  <div className="relative max-w-full max-h-[calc(100vh-8rem)] mb-4">
                    {chapterPages.pages[currentPage] && (
                      <img
                        src={`${chapterPages.baseUrl}/data/${chapterPages.hash}/${chapterPages.pages[currentPage]}`}
                        alt={`Page ${currentPage + 1}`}
                        className="max-h-[calc(100vh-8rem)] w-auto mx-auto"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                      />
                    )}

                    {/* Preload next and previous images */}
                    {currentPage < chapterPages.pages.length - 1 && (
                      <link
                        rel="preload"
                        href={`${chapterPages.baseUrl}/data/${
                          chapterPages.hash
                        }/${chapterPages.pages[currentPage + 1]}`}
                        as="image"
                      />
                    )}

                    {currentPage > 0 && (
                      <link
                        rel="preload"
                        href={`${chapterPages.baseUrl}/data/${
                          chapterPages.hash
                        }/${chapterPages.pages[currentPage - 1]}`}
                        as="image"
                      />
                    )}
                  </div>

                  {/* Page navigation controls */}
                  <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center justify-between py-2 px-4 gap-4 bg-black/50 backdrop-blur-sm rounded-full">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 0}
                      className={`px-4 py-2 rounded-full ${
                        currentPage === 0 ? "opacity-50 cursor-not-allowed" : ""
                      } bg-[#d65d0e] text-white hover:bg-[#fe8019] transition flex items-center`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    <div className="px-3 text-white text-sm sm:text-base">
                      {currentPage + 1}/{chapterPages.pages.length}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === chapterPages.pages.length - 1}
                      className={`px-4 py-2 rounded-full ${
                        currentPage === chapterPages.pages.length - 1
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      } bg-[#d65d0e] text-white hover:bg-[#fe8019] transition flex items-center`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chapter;
