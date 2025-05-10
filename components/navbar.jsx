"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useTheme } from "../context/themeContext";
import { useManga } from "../context/mangaContext";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { searchManga, loading, getCoverImageUrl } = useManga();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const pathname = usePathname();
  const currentUrl = pathname ? pathname.split("/")[1] || "home" : "home";

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const results = await searchManga(searchQuery);
      setSearchResults(results);
      setIsSearchFocused(true);
      console.log("Search results:", results);
    } catch (error) {
      console.error("Error searching manga:", error);
    }
  };

  return (
    <div
      className={`w-full ${
        theme === "dark" ? "bg-black/15" : "bg-white/15"
      } backdrop-blur-3xl p-3 fixed top-0 left-0 z-50 shadow-lg`}
    >
      {/* Mobile Header for small screens */}
      <div className="flex items-center justify-between lg:hidden p-3">
        <Link
          href="/"
          className="text-2xl font-bold flex items-center space-x-2"
        >
          <Image
            src="/logo.png"
            width={60}
            height={60}
            alt="Logo"
            className="animate-bounce"
            priority
          />
          <span className="text-[#d65d0e]">
            Weeb
            <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
              Look
            </span>
          </span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-[#d65d0e]"
        >
          {/* Hamburger Icon */}
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
      {/* Desktop Navbar */}
      <div className="hidden lg:grid grid-cols-3 items-center h-full px-4">
        <Link
          href="/"
          className={"text-2xl font-bold flex items-center space-x-2"}
        >
          <Image
            src="/logo.png"
            width={60}
            height={60}
            alt="Logo"
            className="animate-bounce"
            priority
          />
          <span className="text-[#d65d0e]">
            Weeb
            <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
              Look
            </span>
          </span>
        </Link>
        <div className="flex justify-center">
          <form onSubmit={handleSearch} className="w-full max-w-xl relative">
            <div className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsSearchFocused(false);
                    setSearchResults([]);
                    setSearchQuery("");
                  }
                }}
                placeholder="Search for manga titles..."
                className={`flex-1 px-7 py-2 rounded-l-full h-12 border ${
                  theme === "dark"
                    ? "bg-[#3c3836] border-[#504945] text-[#ebdbb2]"
                    : "bg-white border-gray-300 text-[#3c3836]"
                } focus:border-[#d65d0e] focus:outline-none focus:ring-0`}
              />
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-r-full bg-[#d65d0e] text-[#fbf1c7] font-medium hover:bg-[#fe8019] disabled:opacity-70 transition`}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="8"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <line
                      x1="21"
                      y1="21"
                      x2="16.65"
                      y2="16.65"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Search Results Dropdown */}
            {isSearchFocused && searchResults.length > 0 && (
              <div
                onMouseDown={(e) => e.preventDefault()}
                className={`absolute top-full left-0 right-0 mt-2 p-2 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto ${
                  theme === "dark"
                    ? "bg-[#3c3836] text-[#ebdbb2]"
                    : "bg-white text-[#3c3836]"
                }`}
              >
                {searchResults.map((manga) => {
                  const coverUrl = getCoverImageUrl(manga);

                  return (
                    <Link
                      href={`/manga/${manga.id}`}
                      key={manga.id}
                      className={`flex items-center p-2 rounded-md hover:${
                        theme === "dark" ? "bg-[#504945]" : "bg-gray-100"
                      }`}
                      onClick={() => {
                        setSearchResults([]);
                        setSearchQuery("");
                      }}
                    >
                      <div className="w-12 h-16 relative mr-3 flex-shrink-0">
                        <img
                          src={coverUrl}
                          alt={manga.attributes.title.en || "Manga cover"}
                          className="object-cover rounded w-full h-full"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {manga.attributes.title.en ||
                            manga.attributes.title.ja ||
                            Object.values(manga.attributes.title)[0]}
                        </h3>
                        <p className="text-sm opacity-75 truncate">
                          {manga.attributes.description?.en?.substring(0, 50) +
                            "..." || "No description available"}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </form>
          <button
            onClick={toggleTheme}
            className={`h-12 w-12 ml-2 rounded-full flex items-center justify-center transition-colors bg-[#d65d0e] aspect-square`}
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
        </div>
        <div className="flex items-center space-x-4 justify-end">
          <Link
            href="/popularmanga"
            className={`font-medium px-3 py-2 rounded-md transition-colors ${
              currentUrl === "popularmanga"
                ? "bg-[#d65d0e] text-white"
                : theme === "dark"
                ? "text-[#ebdbb2] hover:bg-[#3c3836] hover:text-[#fe8019]"
                : "text-[#3c3836] hover:bg-[#ebdbb2] hover:text-[#d65d0e]"
            }`}
          >
            Popular Manga
          </Link>
          <Link
            href="/bookmarks"
            className={`font-medium px-3 py-2 rounded-md transition-colors ${
              currentUrl === "bookmarks"
                ? "bg-[#d65d0e] text-white"
                : theme === "dark"
                ? "text-[#ebdbb2] hover:bg-[#3c3836] hover:text-[#fe8019]"
                : "text-[#3c3836] hover:bg-[#ebdbb2] hover:text-[#d65d0e]"
            }`}
          >
            Bookmarks
          </Link>
          <div>
            <button
              className={`h-14 w-14 ml-4 rounded-full flex items-center justify-center transition-colors bg-[#d65d0e]`}
            >
              <Image
                src="/logo.png"
                width={50}
                height={50}
                alt="Logo"
                priority
              />
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div
          className={`lg:hidden p-4 rounded-xl shadow-lg ${
            theme === "dark" ? "bg-black/20" : "bg-white/20"
          } backdrop-blur-3xl transition-colors`}
        >
          <div className="flex items-center mb-4">
            <form onSubmit={handleSearch} className="flex-1 min-w-0 relative">
              <div className="flex min-w-0">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() =>
                    setTimeout(() => setIsSearchFocused(false), 200)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsSearchFocused(false);
                      setSearchResults([]);
                      setSearchQuery("");
                    }
                  }}
                  placeholder="Search for manga titles..."
                  className={`flex-1 min-w-0 px-7 py-2 h-12 rounded-l-full border ${
                    theme === "dark"
                      ? "bg-[#3c3836] border-[#504945] text-[#ebdbb2]"
                      : "bg-white border-gray-300 text-[#3c3836]"
                  } focus:border-[#d65d0e] focus:outline-none focus:ring-0`}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-3 rounded-r-full bg-[#d65d0e] text-[#fbf1c7] font-medium hover:bg-[#fe8019] disabled:opacity-70 transition"
                >
                  {loading ? (
                    <svg
                      className="animate-spin h-5 w-5 mx-auto"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <circle
                        cx="11"
                        cy="11"
                        r="8"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <line
                        x1="21"
                        y1="21"
                        x2="16.65"
                        y2="16.65"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </form>
            <button
              onClick={toggleTheme}
              className="h-12 w-12 ml-2 rounded-full flex items-center justify-center transition-colors bg-[#d65d0e] aspect-square"
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
          </div>
          {isSearchFocused && searchResults.length > 0 && (
            <div
              onMouseDown={(e) => e.preventDefault()}
              className={`mt-4 p-2 rounded-md shadow-lg max-h-[50vh] overflow-y-auto ${
                theme === "dark" ? "bg-[#3c3836]" : "bg-white"
              }`}
            >
              {searchResults.map((manga) => (
                <Link
                  href={`/manga/${manga.id}`}
                  key={manga.id}
                  className={`flex items-center p-2 rounded-md ${
                    theme === "dark"
                      ? "hover:bg-[#504945]"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setSearchResults([]);
                    setSearchQuery("");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <div className="w-12 h-16 mr-3 flex-shrink-0">
                    <img
                      src={getCoverImageUrl(manga)}
                      alt={manga.attributes.title.en || "Manga cover"}
                      className="object-cover rounded w-full h-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {manga.attributes.title.en ||
                        manga.attributes.title.ja ||
                        Object.values(manga.attributes.title)[0]}
                    </h3>
                    <p className="text-sm opacity-75 truncate">
                      {manga.attributes.description?.en?.substring(0, 50) +
                        "..." || "No description available"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <nav className="mt-6 space-y-4">
            <Link
              href="/popularmanga"
              className="block font-medium px-4 py-2 rounded-lg bg-[#d65d0e] text-white hover:bg-[#fe8019] transition-colors"
            >
              Popular Manga
            </Link>
            <Link
              href="/bookmarks"
              className="block font-medium px-4 py-2 rounded-lg bg-[#d65d0e] text-white hover:bg-[#fe8019] transition-colors"
            >
              Bookmarks
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Navbar;
