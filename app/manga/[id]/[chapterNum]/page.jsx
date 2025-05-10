"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "../../../../context/themeContext";
import { useManga } from "../../../../context/mangaContext";
import Loading from "../../../../components/loading";

const Chapter = () => {
  const router = useRouter();
  const params = useParams();
  const { id, chapterNum } = params;
  const { theme } = useTheme();
  const {
    getChapterWithPages,
    getMangaChapters,
    loading: apiLoading,
  } = useManga();

  const [chapter, setChapter] = useState(null);
  const [chapterData, setChapterData] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [allChapters, setAllChapters] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching chapters for manga ${id}`);
        const chapters = await getMangaChapters(id);
        console.log(`Got ${chapters.length} chapters`);
        setAllChapters(chapters);

        // Debug: Log all chapter numbers
        console.log(
          "Available chapters:",
          chapters.map((ch) => ch.attributes.chapter)
        );

        // Find the specific chapter with exact string matching first
        let targetChapter = chapters.find(
          (ch) => ch.attributes.chapter === chapterNum
        );

        // If not found with exact match, try numerical comparison
        if (!targetChapter) {
          console.log(
            `Chapter ${chapterNum} not found by exact match, trying numerical comparison`
          );
          targetChapter = chapters.find(
            (ch) =>
              ch.attributes.chapter &&
              parseFloat(ch.attributes.chapter) === parseFloat(chapterNum)
          );
        }

        if (!targetChapter) {
          console.error(
            `Chapter ${chapterNum} not found in available chapters`
          );
          throw new Error(`Chapter ${chapterNum} not found`);
        }

        console.log(`Found chapter: ${targetChapter.id}`);

        // Now fetch the chapter with pages
        const result = await getChapterWithPages(id, targetChapter.id);
        console.log(`Got chapter data and ${result.pages.length} pages`);

        if (result.chapterData) {
          setChapter(result.chapterData);
          setChapterData({
            id: result.chapterData.id,
            title: result.chapterData.attributes.title,
            chapter: result.chapterData.attributes.chapter,
            volume: result.chapterData.attributes.volume,
            mangaId: id,
          });
          setPages(result.pages);
        } else {
          throw new Error("Chapter data is empty");
        }
      } catch (err) {
        console.error("Error fetching chapter:", err);
        setError(err.message || "Error loading chapter");
      } finally {
        setLoading(false);
      }
    };

    if (id && chapterNum) {
      fetchData();
    }
  }, [id, chapterNum, getChapterWithPages, getMangaChapters]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        // Next page
        setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1));
      } else if (e.key === "ArrowLeft") {
        // Previous page
        setCurrentPage((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pages.length]);

  // Navigate to next/prev chapter
  const navigateToChapter = (type) => {
    if (!chapterData || !chapterNum || allChapters.length === 0) return;

    // Sort chapters numerically for proper navigation
    const sortedChapters = [...allChapters].sort((a, b) => {
      return (
        parseFloat(a.attributes.chapter) - parseFloat(b.attributes.chapter)
      );
    });

    const currentIndex = sortedChapters.findIndex(
      (ch) =>
        ch.attributes.chapter === chapterNum ||
        parseFloat(ch.attributes.chapter) === parseFloat(chapterNum)
    );

    if (currentIndex === -1) return;

    const targetIndex = type === "next" ? currentIndex + 1 : currentIndex - 1;

    if (targetIndex >= 0 && targetIndex < sortedChapters.length) {
      const targetChapter = sortedChapters[targetIndex];
      router.push(`/manga/${id}/${targetChapter.attributes.chapter}`);
    }
  };

  if (loading || apiLoading) {
    return (
      <div
        className={`min-h-screen pt-24 flex items-center justify-center ${
          theme === "dark"
            ? "bg-zinc-900 text-white"
            : "bg-gray-100 text-zinc-800"
        }`}
      >
        <div className="text-center">
          <Loading />
          <p className="mt-4">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (error || !chapterData) {
    return (
      <div
        className={`min-h-screen pt-24 flex items-center justify-center ${
          theme === "dark"
            ? "bg-zinc-900 text-white"
            : "bg-gray-100 text-zinc-800"
        }`}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p>{error || "Chapter not found"}</p>
          <Link href={`/manga/${id}`}>
            <button className="mt-4 px-4 py-2 bg-[#d65d0e] text-white rounded">
              Back to Manga
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pt-16 pb-10 ${
        theme === "dark"
          ? "bg-zinc-900 text-white"
          : "bg-gray-100 text-zinc-800"
      }`}
    >
      {/* Chapter Header */}
      <div
        className={`fixed top-0 left-0 right-0 z-10 py-3 px-4 flex justify-between items-center ${
          theme === "dark" ? "bg-zinc-800" : "bg-white"
        } shadow-md`}
      >
        <div>
          <Link
            href={`/manga/${id}`}
            className="font-medium hover:text-[#d65d0e] transition"
          >
            Back to Manga
          </Link>
          <h1 className="text-lg font-bold truncate">
            {`Chapter ${chapterData.chapter}${
              chapterData.title ? `: ${chapterData.title}` : ""
            }`}
          </h1>
        </div>
        <div className="flex space-x-2 items-center">
          <span className="text-sm">
            Page {currentPage + 1} of {pages.length}
          </span>
        </div>
      </div>

      {/* Reader Area */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        {pages.length > 0 ? (
          <div className="relative flex flex-col items-center">
            {/* Page Image */}
            <div className="relative w-full h-[80vh] bg-black flex items-center justify-center">
              {/* Using regular img tag instead of Next.js Image component for better compatibility */}
              <img
                src={pages[currentPage]}
                alt={`Page ${currentPage + 1}`}
                className="w-auto h-auto max-h-[80vh] object-contain"
                onError={(e) => {
                  e.target.src = "/placeholder.png";
                  console.error("Failed to load image:", pages[currentPage]);
                }}
              />

              {/* Navigation Overlays */}
              <div
                className="absolute left-0 top-0 h-full w-1/2 cursor-pointer"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                title="Previous Page"
              />
              <div
                className="absolute right-0 top-0 h-full w-1/2 cursor-pointer"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1))
                }
                title="Next Page"
              />
            </div>

            {/* Page Navigation */}
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={() => setCurrentPage(0)}
                disabled={currentPage === 0}
                className={`px-4 py-2 rounded ${
                  theme === "dark" ? "bg-zinc-800" : "bg-white"
                } shadow-sm disabled:opacity-50`}
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
                className={`px-4 py-2 rounded ${
                  theme === "dark" ? "bg-zinc-800" : "bg-white"
                } shadow-sm disabled:opacity-50`}
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1))
                }
                disabled={currentPage === pages.length - 1}
                className={`px-4 py-2 rounded ${
                  theme === "dark" ? "bg-zinc-800" : "bg-white"
                } shadow-sm disabled:opacity-50`}
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(pages.length - 1)}
                disabled={currentPage === pages.length - 1}
                className={`px-4 py-2 rounded ${
                  theme === "dark" ? "bg-zinc-800" : "bg-white"
                } shadow-sm disabled:opacity-50`}
              >
                Last
              </button>
            </div>

            {/* Chapter Navigation */}
            <div className="flex justify-between w-full mt-12">
              <button
                onClick={() => navigateToChapter("prev")}
                className={`px-6 py-3 rounded-lg ${
                  theme === "dark" ? "bg-zinc-800" : "bg-white"
                } shadow-sm`}
              >
                Previous Chapter
              </button>
              <button
                onClick={() => navigateToChapter("next")}
                className={`px-6 py-3 rounded-lg bg-[#d65d0e] text-white`}
              >
                Next Chapter
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p>No pages available for this chapter.</p>
            <Link href={`/manga/${id}`}>
              <button className="mt-4 px-6 py-3 bg-[#d65d0e] text-white rounded-lg">
                Back to Manga
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Keyboard Navigation Tip */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-opacity-90 px-4 py-2 rounded-full text-sm">
        <p>
          💡 <strong>Tip:</strong> Use ← and → arrow keys to navigate between
          pages
        </p>
      </div>
    </div>
  );
};

export default Chapter;
