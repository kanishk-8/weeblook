"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useTheme } from "../context/themeContext";

export default function Home() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app, we would navigate to search results page
      setIsSearching(true);
      setTimeout(() => setIsSearching(false), 1500); // Simulate API call
    }
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
      <section className="text-center py-16 max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">
          <span className="text-[#d65d0e]">WeebLook</span> Manga Reader
        </h1>
        <p className="text-xl mb-8 opacity-80">
          Search and read your favorite manga from the vast MangaDex library
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
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

        {/* Keyboard Navigation Tip */}
        <div className="text-sm opacity-70 mb-16">
          <p>
            💡 <strong>Tip:</strong> Use ← and → arrow keys to navigate between
            chapters while reading
          </p>
        </div>
      </section>

      {/* Featured Manga Section */}
      <section className="max-w-6xl mx-auto mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">Popular Manga</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <Link href="#" key={item} className="group">
              <div
                className={`rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div className="relative h-64 bg-gray-300">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-500">Manga Cover</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-[#d65d0e] transition">
                    Manga Title {item}
                  </h3>
                  <p className="text-sm opacity-70">
                    Latest: Chapter {item * 10}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="#"
            className="inline-block px-6 py-3 rounded-lg border-2 border-[#d65d0e] text-[#d65d0e] hover:bg-[#d65d0e] hover:text-white transition"
          >
            Browse More Manga
          </Link>
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
