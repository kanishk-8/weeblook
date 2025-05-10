"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const MangaContext = createContext();

export const MangaProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);

  // Cache for API responses
  const [cache, setCache] = useState({
    popular: {},
    genres: {},
    manga: {},
    chapters: {},
    pages: {},
  });

  // Load bookmarks from localStorage on client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedBookmarks = JSON.parse(
        localStorage.getItem("bookmarks") || "[]"
      );
      setBookmarks(savedBookmarks);
    }
  }, []);

  // Helper function to get cover image URL from manga object
  const getCoverImageUrl = (manga) => {
    try {
      if (!manga.relationships) return "/placeholder.png";

      const coverArt = manga.relationships.find(
        (rel) => rel.type === "cover_art"
      );

      if (!coverArt || !coverArt.attributes || !coverArt.attributes.fileName) {
        return "/placeholder.png";
      }

      return `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}`;
    } catch (error) {
      console.error("Error getting cover image URL:", error);
      return "/placeholder.png";
    }
  };

  // Search for manga
  const searchManga = async (query) => {
    if (!query) return [];
    setLoading(true);

    // Create a cache key for this search query
    const cacheKey = `search-${query.toLowerCase().trim()}`;

    // Check if we have this search cached
    if (cache.search && cache.search[cacheKey]) {
      setLoading(false);
      return cache.search[cacheKey];
    }

    try {
      const response = await fetch(
        `/api/mangadex?path=manga&title=${encodeURIComponent(
          query
        )}&limit=10&includes[]=cover_art`
      );
      const data = await response.json();

      // Cache the search results
      setCache((prev) => ({
        ...prev,
        search: {
          ...(prev.search || {}),
          [cacheKey]: data.data || [],
        },
      }));

      setLoading(false);
      return data.data || [];
    } catch (error) {
      console.error("Error searching manga:", error);
      setLoading(false);
      return [];
    }
  };

  // Fetch popular manga
  const getPopularManga = async (limit = 20, offset = 0) => {
    setLoading(true);

    // Check cache first
    const cacheKey = `popular-${limit}-${offset}`;
    if (cache.popular[cacheKey]) {
      setLoading(false);
      return cache.popular[cacheKey];
    }

    try {
      const response = await fetch(
        `/api/mangadex?path=manga&limit=${limit}&offset=${offset}&order[followedCount]=desc&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive`
      );
      const data = await response.json();

      // Store in cache
      setCache((prev) => ({
        ...prev,
        popular: {
          ...prev.popular,
          [cacheKey]: data.data || [],
        },
      }));

      setLoading(false);
      return data.data || [];
    } catch (error) {
      console.error("Error fetching popular manga:", error);
      setLoading(false);
      return [];
    }
  };

  // Fetch manga by genre/tag
  const getMangaByGenre = async (genreId, limit = 20, offset = 0) => {
    setLoading(true);

    // Check cache first
    const cacheKey = `genre-${genreId}-${limit}-${offset}`;
    if (cache.genres[cacheKey]) {
      setLoading(false);
      return cache.genres[cacheKey];
    }

    try {
      const response = await fetch(
        `/api/mangadex?path=manga&limit=${limit}&offset=${offset}&includedTags[]=${genreId}&order[followedCount]=desc&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive`
      );
      const data = await response.json();

      // Store in cache
      setCache((prev) => ({
        ...prev,
        genres: {
          ...prev.genres,
          [cacheKey]: data.data || [],
        },
      }));

      setLoading(false);
      return data.data || [];
    } catch (error) {
      console.error("Error fetching manga by genre:", error);
      setLoading(false);
      return [];
    }
  };

  // Fetch manga details
  const getMangaDetails = async (mangaId) => {
    setLoading(true);

    // Check cache first
    if (cache.manga[mangaId]) {
      setLoading(false);
      return cache.manga[mangaId];
    }

    try {
      const response = await fetch(
        `/api/mangadex?path=manga/${mangaId}&includes[]=author&includes[]=artist&includes[]=cover_art`
      );
      const data = await response.json();

      // Store in cache
      setCache((prev) => ({
        ...prev,
        manga: {
          ...prev.manga,
          [mangaId]: data.data,
        },
      }));

      setLoading(false);
      return data.data;
    } catch (error) {
      console.error("Error fetching manga details:", error);
      setLoading(false);
      return null;
    }
  };

  // Fetch chapters for a manga
  const getMangaChapters = async (mangaId, translatedLanguage = "en") => {
    setLoading(true);
    const allChapters = [];
    const limit = 100;
    let offset = 0;
    try {
      while (true) {
        const cacheKey = `chapters-${mangaId}-${limit}-${offset}-${translatedLanguage}`;
        let pageData = cache.chapters[cacheKey];
        if (!pageData) {
          // throttle requests to avoid rate limiting
          await new Promise((res) => setTimeout(res, 300));
          const res = await fetch(
            `/api/mangadex?path=manga/${mangaId}/feed&limit=${limit}&offset=${offset}&translatedLanguage[]=${translatedLanguage}&order[chapter]=asc`
          );
          const json = await res.json();
          pageData = json.data || [];
          setCache((prev) => ({
            ...prev,
            chapters: { ...prev.chapters, [cacheKey]: pageData },
          }));
        }
        if (!pageData.length) break;
        allChapters.push(...pageData);
        offset += limit;
      }
    } catch (error) {
      console.error("Error fetching manga chapters:", error);
    }
    setLoading(false);
    return allChapters;
  };

  // Get chapter pages
  const getChapterPages = async (chapterId) => {
    setLoading(true);

    // Check pages cache
    const cacheKey = `pages-${chapterId}`;
    if (cache.pages?.[cacheKey]) {
      setLoading(false);
      return cache.pages[cacheKey];
    }

    try {
      const response = await fetch(
        `/api/mangadex?path=at-home/server/${chapterId}`
      );
      const data = await response.json();
      setLoading(false);

      if (data.result !== "ok") {
        throw new Error("Failed to get chapter data");
      }

      const baseUrl = data.baseUrl;
      const hash = data.chapter.hash;
      const pages = data.chapter.data;

      const chapterData = {
        baseUrl,
        hash,
        pages,
        fullUrls: pages.map((page) => `${baseUrl}/data/${hash}/${page}`),
      };

      // Store in cache
      setCache((prev) => ({
        ...prev,
        pages: {
          ...(prev.pages || {}),
          [cacheKey]: chapterData,
        },
      }));

      return chapterData;
    } catch (error) {
      console.error("Error fetching chapter pages:", error);
      setLoading(false);
      return null;
    }
  };

  // Bookmark management
  const addBookmark = (manga) => {
    const newBookmark = {
      id: manga.id,
      title:
        manga.attributes.title.en ||
        manga.attributes.title.ja ||
        Object.values(manga.attributes.title)[0],
      coverUrl: getCoverImageUrl(manga),
      addedAt: new Date().toISOString(),
    };

    const updatedBookmarks = [...bookmarks, newBookmark];
    setBookmarks(updatedBookmarks);
    localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
    return updatedBookmarks;
  };

  const removeBookmark = (mangaId) => {
    const updatedBookmarks = bookmarks.filter(
      (bookmark) => bookmark.id !== mangaId
    );
    setBookmarks(updatedBookmarks);
    localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
    return updatedBookmarks;
  };

  const isBookmarked = (mangaId) => {
    return bookmarks.some((bookmark) => bookmark.id === mangaId);
  };

  return (
    <MangaContext.Provider
      value={{
        loading,
        bookmarks,
        searchManga,
        getPopularManga,
        getMangaByGenre,
        getMangaDetails,
        getMangaChapters,
        getChapterPages,
        getCoverImageUrl,
        addBookmark,
        removeBookmark,
        isBookmarked,
      }}
    >
      {children}
    </MangaContext.Provider>
  );
};

export const useManga = () => {
  const context = useContext(MangaContext);
  if (!context) {
    throw new Error("useManga must be used within a MangaProvider");
  }
  return context;
};
