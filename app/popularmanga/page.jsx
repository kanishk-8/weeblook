"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/themeContext";
import { useManga } from "../../context/mangaContext";
import Link from "next/link";
import Loading from "@/components/loading";

const PopularManga = () => {
  const { theme } = useTheme();
  const { getPopularManga, getMangaByGenre, getCoverImageUrl, loading } =
    useManga();

  const [activeGenre, setActiveGenre] = useState("all");
  const [mangaList, setMangaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Define manga genres/tags
  const genres = [
    { id: "all", name: "All Popular" },
    { id: "423e2eae-a7a2-4a8b-ac03-a8351462d71d", name: "Romance" },
    { id: "4d32cc48-9f00-4cca-9b5a-a839f0764984", name: "Action" },
    { id: "cdc58593-87dd-415e-bbc0-2ec27bf404cc", name: "Fantasy" },
    { id: "ace04997-f6bd-436e-b261-779182193d3d", name: "Drama" },
    { id: "5920b825-4181-4a17-beeb-9918b0ff7a30", name: "Comedy" },
    { id: "e5301a23-ebd9-49dd-a0cb-2add944c7fe9", name: "Adventure" },
    { id: "ec0f6779-2f59-4e12-b76f-e1c2e8d5ce0b", name: "Ecchi" },
    { id: "27d255d1-1fba-42f3-bdf8-221ef388dd24", name: "Adult" },
  ];

  // Fetch manga data based on active genre
  useEffect(() => {
    const fetchManga = async () => {
      setIsLoading(true);
      try {
        let data;

        if (activeGenre === "all") {
          data = await getPopularManga(24, 0);
        } else {
          data = await getMangaByGenre(activeGenre, 24, 0);
        }

        setMangaList(data);
      } catch (error) {
        console.error("Error fetching manga:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch when genre changes
    fetchManga();
  }, [activeGenre]);

  return (
    <div
      className={`min-h-screen pt-24 pb-10 ${
        theme === "dark"
          ? "bg-zinc-900 text-white"
          : "bg-gray-100 text-zinc-800"
      }`}
    >
      <div className="w-full px-4 flex flex-col md:flex-row gap-6">
        {/* Side Panel for Genres */}
        <div
          className={`md:w-64 ${
            theme === "dark" ? "bg-zinc-800" : "bg-white"
          } rounded-lg shadow-lg p-4 h-fit md:sticky md:top-24 max-h-[50vh] md:max-h-none overflow-y-auto`}
        >
          <h2 className="text-xl font-bold mb-4">Genres</h2>
          <div className="flex flex-col gap-2">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setActiveGenre(genre.id)}
                className={`px-4 py-3 rounded-lg font-medium text-left transition ${
                  activeGenre === genre.id
                    ? `bg-[#d65d0e] text-white`
                    : theme === "dark"
                    ? "bg-zinc-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {/* Manga Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loading />
            </div>
          ) : (
            <>
              {mangaList.length === 0 ? (
                <div className="text-center py-16">
                  <h2 className="text-xl font-semibold mb-2">No manga found</h2>
                  <p className="opacity-70">Try selecting a different genre</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            <img
                              src={coverUrl}
                              alt={`Cover for ${title}`}
                              className="h-full w-full object-cover"
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
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopularManga;
