"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/context/themeContext";
import Link from "next/link";
import { useManga } from "@/context/mangaContext";
import Loading from "@/components/loading";

const BookmarksPage = () => {
  const { theme } = useTheme();
  const { bookmarks, removeBookmark } = useManga();
  const [sortMethod, setSortMethod] = useState("recent"); // recent, title
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set loading to false after component mounts since bookmarks are already loaded in context
    setIsLoading(false);
  }, []);

  const handleRemoveBookmark = (id) => {
    removeBookmark(id);
  };

  const handleClearAllBookmarks = () => {
    if (confirm("Are you sure you want to remove all bookmarks?")) {
      bookmarks.forEach((bookmark) => removeBookmark(bookmark.id));
    }
  };

  // Sort bookmarks based on selected sort method
  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    if (sortMethod === "recent") {
      return new Date(b.addedAt) - new Date(a.addedAt); // Most recent first
    } else if (sortMethod === "title") {
      return a.title.localeCompare(b.title); // Alphabetical by title
    }
    return 0;
  });

  return (
    <div
      className={`min-h-screen pt-24 pb-10 ${
        theme === "dark"
          ? "bg-zinc-900 text-white"
          : "bg-gray-100 text-zinc-800"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">My Bookmarks</h1>

          <div className="flex items-center gap-4">
            <div
              className={`rounded-lg overflow-hidden border ${
                theme === "dark" ? "border-zinc-700" : "border-gray-300"
              }`}
            >
              <select
                value={sortMethod}
                onChange={(e) => setSortMethod(e.target.value)}
                className={`px-3 py-2 ${
                  theme === "dark"
                    ? "bg-zinc-800 text-white"
                    : "bg-white text-zinc-800"
                } focus:outline-none`}
              >
                <option value="recent">Sort by Recent</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>

            {bookmarks.length > 0 && (
              <button
                onClick={handleClearAllBookmarks}
                className="px-4 py-2 text-sm rounded bg-[#d65d0e] text-white hover:bg-[#d65e0eaf] transition"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loading />
          </div>
        ) : (
          <>
            {bookmarks.length === 0 ? (
              <div className="text-center py-16">
                <div className="mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto opacity-20"
                    fill="none"
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
                </div>
                <h2 className="text-xl font-semibold mb-2">No Bookmarks Yet</h2>
                <p className="opacity-70 mb-6">
                  Start adding manga to your bookmarks to see them here.
                </p>
                <Link
                  href="/popularmanga"
                  className="px-4 py-2 rounded bg-[#d65d0e] text-white hover:bg-[#fe8019] transition"
                >
                  Browse Popular Manga
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedBookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className={`rounded-lg overflow-hidden shadow-lg ${
                      theme === "dark" ? "bg-zinc-800" : "bg-white"
                    }`}
                  >
                    <Link href={`/manga/${bookmark.id}`} className="group">
                      <div className="relative h-64 bg-gray-300">
                        <img
                          src={bookmark.coverUrl}
                          alt={`Cover for ${bookmark.title}`}
                          className="w-full h-full object-cover group-hover:opacity-90 transition"
                        />
                        <div
                          className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition ${
                            theme === "dark" ? "bg-black/60" : "bg-white/60"
                          }`}
                        >
                          <span className="px-3 py-2 rounded bg-[#d65d0e] text-white text-sm">
                            View Details
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2 group-hover:text-[#d65d0e] transition line-clamp-2">
                          {bookmark.title}
                        </h3>
                        <p className="text-sm opacity-70">
                          Added on{" "}
                          {new Date(bookmark.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                    <div className="px-4 pb-4">
                      <button
                        onClick={() => handleRemoveBookmark(bookmark.id)}
                        className={`w-full py-2 text-sm rounded ${
                          theme === "dark"
                            ? "bg-zinc-700 hover:bg-zinc-600"
                            : "bg-gray-100 hover:bg-gray-200"
                        } transition`}
                      >
                        Remove Bookmark
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;
