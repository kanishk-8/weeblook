"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useTheme } from "../context/themeContext";
import { useManga } from "../context/mangaContext";

export default function Home() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const { searchManga, loading, getCoverImageUrl } = useManga();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchManga(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  return (
    <div
      className={`min-h-screen pt-20 pb-10 px-4 md:px-8 ${
        theme === "dark"
          ? "bg-zinc-900 text-white"
          : "bg-gray-100 text-zinc-800"
      }`}
    >
      {/* Hero Section */}
      <section className="text-center py-16 max-w-5xl mx-auto flex flex-col items-center">
        <h1 className="text-5xl font-bold mb-6">
          <span className="text-[#d65d0e]">WeebLook</span> Manga Reader
        </h1>
        <p className="text-xl mb-8 opacity-80">
          Search and read your favorite manga from the vast MangaDex library
        </p>
        <Image
          src={"/logo.png"}
          alt="WeebLook Logo"
          width={400}
          height={400}
          className="my-3"
        />
        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="max-w-2xl w-full mx-auto mb-12"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for manga titles..."
              className={`flex-1 p-3 rounded-lg border ${
                theme === "dark"
                  ? "bg-[#3c3836] border-gray-700 text-white"
                  : "bg-white border-gray-300 text-[#3c3836]"
              } focus:outline-none focus:ring-2 focus:ring-[#d65d0e]`}
            />
            <button
              type="submit"
              disabled={isSearching}
              className={`px-6 py-3 rounded-lg bg-[#d65d0e] text-white font-medium hover:bg-red-600 disabled:opacity-70 transition`}
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <section className="max-w-6xl mx-auto mb-20">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Search Results
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {searchResults.map((manga) => {
                const cover = getCoverImageUrl(manga);
                const title =
                  manga.attributes.title.en ||
                  manga.attributes.title.ja ||
                  Object.values(manga.attributes.title)[0];
                return (
                  <Link
                    href={`/manga/${manga.id}`}
                    key={manga.id}
                    className="group"
                  >
                    <div
                      className={`rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition ${
                        theme === "dark" ? "bg-gray-800" : "bg-white"
                      }`}
                    >
                      <div className="relative h-64 bg-gray-300">
                        <img
                          src={cover}
                          alt={title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2 group-hover:text-[#d65d0e] transition">
                          {title}
                        </h3>
                        <p className="text-sm opacity-75 mb-2 truncate">
                          {manga.attributes.description?.en?.substring(0, 100) +
                            "..." || "No description available"}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Featured Manga section removed */}

        {/* Keyboard Navigation Tip */}
        <div className="text-sm opacity-70 mb-16">
          <p>
            💡 <strong>Tip:</strong> Use ← and → arrow keys to navigate between
            chapters while reading
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center opacity-70 text-sm mt-24">
        <p>
          WeebLook powered by MangaDex API • Read your favorite manga online
        </p>
      </footer>
    </div>
  );
}
