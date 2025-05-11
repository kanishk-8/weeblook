"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/themeContext";
import { useManga } from "../../context/mangaContext";
import Link from "next/link";
import Loading from "@/components/loading";
import Image from "next/image";

const PopularManga = () => {
  const { theme } = useTheme();
  const {
    getPopularManga,
    getAllGenres,
    searchMangaWithGenres,
    getCoverImageUrl,
  } = useManga();

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedContentRatings, setSelectedContentRatings] = useState([
    "safe",
    "suggestive",
  ]);

  // Load saved filters
  useEffect(() => {
    const savedGenres = localStorage.getItem("selectedGenres");
    const savedRatings = localStorage.getItem("selectedContentRatings");
    if (savedGenres) setSelectedGenres(JSON.parse(savedGenres));
    if (savedRatings) setSelectedContentRatings(JSON.parse(savedRatings));
  }, []);
  const contentRatings = [
    { id: "safe", label: "Safe" },
    { id: "suggestive", label: "Suggestive" },
    { id: "erotica", label: "Erotica" },
    { id: "pornographic", label: "Adult" },
  ];
  const [mangaList, setMangaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [imageLoading, setImageLoading] = useState({});

  const ITEMS_PER_PAGE = 24;

  // Load all genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      const allGenres = await getAllGenres();
      setGenres(allGenres);
    };
    fetchGenres();
  }, [getAllGenres]);

  // Fetch initial popular manga
  useEffect(() => {
    const fetchInitialManga = async () => {
      setIsLoading(true);
      try {
        const data = await (selectedGenres.length === 0
          ? getPopularManga(ITEMS_PER_PAGE, 0, selectedContentRatings)
          : searchMangaWithGenres(
              "",
              selectedGenres,
              ITEMS_PER_PAGE,
              selectedContentRatings
            ));
        setMangaList(data);
      } catch (error) {
        console.error("Error fetching manga:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialManga();
  }, [selectedContentRatings]);

  // Save filters to localStorage
  useEffect(() => {
    localStorage.setItem("selectedGenres", JSON.stringify(selectedGenres));
    localStorage.setItem(
      "selectedContentRatings",
      JSON.stringify(selectedContentRatings)
    );
  }, [selectedGenres, selectedContentRatings]);

  return (
    <div
      className={`min-h-screen pt-24 pb-10 ${
        theme === "dark"
          ? "bg-zinc-900 text-white"
          : "bg-gray-100 text-zinc-800"
      }`}
    >
      <div className="w-full px-4 relative">
        {/* Manga Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="fixed inset-0 flex justify-center items-center bg-black/10 backdrop-blur-sm">
              <Loading />
            </div>
          ) : (
            <>
              {mangaList.length === 0 ? (
                <div className="text-center py-16">
                  <h2 className="text-xl font-semibold mb-2">No manga found</h2>
                  <p className="opacity-70">Try selecting a different filter</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {mangaList.map((manga) => {
                      const coverUrl = getCoverImageUrl(manga);
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
                              theme === "dark" ? "bg-zinc-800" : "bg-white"
                            }`}
                          >
                            <div className="relative h-64 bg-gray-300">
                              {imageLoading[manga.id] && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Loading />
                                </div>
                              )}
                              <Image
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                quality={85}
                                priority={false}
                                src={coverUrl}
                                alt={`Cover for ${title}`}
                                className={`h-full w-full object-cover transition-opacity duration-200 ${
                                  imageLoading[manga.id]
                                    ? "opacity-0"
                                    : "opacity-100"
                                }`}
                                onLoad={() =>
                                  setImageLoading((prev) => ({
                                    ...prev,
                                    [manga.id]: false,
                                  }))
                                }
                                onError={() =>
                                  setImageLoading((prev) => ({
                                    ...prev,
                                    [manga.id]: false,
                                  }))
                                }
                                loading="lazy"
                              />
                            </div>
                            <div className="p-4">
                              <h3 className="font-bold text-lg mb-2 group-hover:text-[#d65d0e] transition line-clamp-2">
                                {title}
                              </h3>
                              <p className="text-sm opacity-70">
                                {manga.attributes.status &&
                                  `Status: ${
                                    manga.attributes.status
                                      .charAt(0)
                                      .toUpperCase() +
                                    manga.attributes.status.slice(1)
                                  }`}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  {hasMore && (
                    <div className="mt-8 text-center">
                      <button
                        onClick={async () => {
                          const nextPage = currentPage + 1;
                          setIsLoading(true);
                          try {
                            const moreData = await getPopularManga(
                              ITEMS_PER_PAGE,
                              (nextPage - 1) * ITEMS_PER_PAGE,
                              selectedContentRatings
                            );
                            if (moreData.length < ITEMS_PER_PAGE) {
                              setHasMore(false);
                            }
                            setMangaList((prev) => [...prev, ...moreData]);
                            setCurrentPage(nextPage);
                          } catch (error) {
                            console.error("Error loading more manga:", error);
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        className="px-6 py-3 rounded-lg bg-[#d65d0e] text-white font-medium hover:bg-[#fe8019] transition-colors"
                        disabled={isLoading}
                      >
                        {isLoading ? "Loading..." : "Load More"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="fixed bottom-6 left-6 z-50 w-14 h-14 flex items-center justify-center rounded-full shadow-lg bg-[#d65d0e] text-white hover:bg-[#fe8019] transition-colors"
          aria-label="Toggle Filters"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
            />
          </svg>
        </button>

        {/* Filter Panel */}
        <div
          className={`fixed inset-0 z-40 transform transition-all duration-300 ${
            isFilterOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 backdrop-blur-md bg-black/30"
            onClick={() => setIsFilterOpen(false)}
          />

          {/* Content */}
          <div
            className={`absolute inset-0 ${
              theme === "dark" ? "bg-zinc-900/80" : "bg-white/80"
            } backdrop-blur-sm`}
          >
            <div className="flex flex-col h-full max-w-7xl mx-auto px-4">
              <div className="flex justify-between items-center py-6">
                <h2 className="text-2xl font-bold">Filters</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-800/20 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Content Rating Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Content Rating</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {contentRatings.map((rating) => (
                      <label
                        key={rating.id}
                        className={`flex items-center p-4 rounded-lg cursor-pointer transition ${
                          selectedContentRatings.includes(rating.id)
                            ? "bg-[#d65d0e] text-white"
                            : "bg-black/10 hover:bg-black/20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mr-3 h-4 w-4"
                          checked={selectedContentRatings.includes(rating.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedContentRatings([
                                ...selectedContentRatings,
                                rating.id,
                              ]);
                            } else {
                              setSelectedContentRatings(
                                selectedContentRatings.filter(
                                  (id) => id !== rating.id
                                )
                              );
                            }
                          }}
                        />
                        {rating.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Genres Section */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Genres</h3>
                  <button
                    onClick={() => setSelectedGenres([])}
                    className={`w-full md:w-auto px-6 py-3 mb-6 rounded-lg font-medium transition ${
                      selectedGenres.length === 0
                        ? "bg-[#d65d0e] text-white"
                        : "bg-black/10 hover:bg-black/20"
                    }`}
                  >
                    All Popular
                  </button>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {genres.map((genre) => (
                      <label
                        key={genre.id}
                        className={`flex items-center p-4 rounded-lg cursor-pointer transition ${
                          selectedGenres.includes(genre.id)
                            ? "bg-[#d65d0e] text-white"
                            : "bg-black/10 hover:bg-black/20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mr-3 h-4 w-4"
                          checked={selectedGenres.includes(genre.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedGenres([...selectedGenres, genre.id]);
                            } else {
                              setSelectedGenres(
                                selectedGenres.filter((id) => id !== genre.id)
                              );
                            }
                          }}
                        />
                        {genre.attributes.name.en}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <div className="py-6 flex justify-end">
                <button
                  onClick={async () => {
                    setIsFilterOpen(false);
                    setIsLoading(true);
                    try {
                      const results = await (selectedGenres.length === 0
                        ? getPopularManga(
                            ITEMS_PER_PAGE,
                            0,
                            selectedContentRatings
                          )
                        : searchMangaWithGenres(
                            "",
                            selectedGenres,
                            ITEMS_PER_PAGE,
                            selectedContentRatings
                          ));
                      setMangaList(results);
                      setCurrentPage(1);
                      setHasMore(results.length === ITEMS_PER_PAGE);
                    } catch (error) {
                      console.error("Error searching manga:", error);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="w-full md:w-auto px-8 py-4 rounded-lg font-medium bg-[#d65d0e] text-white hover:bg-[#fe8019] transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Searching..." : "Apply Filters"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopularManga;
