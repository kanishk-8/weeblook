"use client";
import React, { createContext, useContext, useState } from "react";

const MangaContext = createContext();

// Helper function for making API calls with retry logic
const fetchWithRetry = async (url, options = {}, retries = 3, delay = 1000) => {
  try {
    const response = await fetch(url, {
      ...options,
      next: { revalidate: 0 },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${url} - ${errorText}`);
      throw new Error(`API responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying fetch for ${url}. Retries left: ${retries}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 1.5);
    }
    throw error;
  }
};

export const MangaProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPopularManga = async (limit = 24, offset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: limit,
        offset: offset,
        "includes[]": ["cover_art", "author", "artist"],
        "order[followedCount]": "desc",
        "contentRating[]": ["safe", "suggestive"],
      });

      const endpoint = `manga?${params.toString()}`;
      const data = await fetchWithRetry(
        `/api/manga?endpoint=${encodeURIComponent(endpoint)}`
      );
      return data.data || [];
    } catch (error) {
      console.error("Error fetching popular manga:", error);
      setError("Failed to load popular manga");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getMangaById = async (mangaId) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        "includes[]": ["author", "artist", "cover_art"],
      });

      const endpoint = `manga/${mangaId}?${params.toString()}`;
      const data = await fetchWithRetry(
        `/api/manga?endpoint=${encodeURIComponent(endpoint)}`
      );

      if (!data || !data.data) {
        throw new Error("Manga not found");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching manga details:", error);
      setError("Failed to load manga details");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getMangaChapters = async (mangaId) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        "translatedLanguage[]": ["en"],
        limit: 100,
        "order[chapter]": "desc",
        "includes[]": ["scanlation_group"],
      });

      const endpoint = `manga/${mangaId}/feed?${params.toString()}`;
      const data = await fetchWithRetry(
        `/api/manga?endpoint=${encodeURIComponent(endpoint)}`
      );

      if (!data || !data.data) {
        console.warn("No chapters found for manga:", mangaId);
        return [];
      }

      return data.data || [];
    } catch (error) {
      console.error("Error fetching manga chapters:", error);
      setError("Failed to load manga chapters");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getMangaTags = async () => {
    try {
      const endpoint = "manga/tag";
      const data = await fetchWithRetry(
        `/api/manga?endpoint=${encodeURIComponent(endpoint)}`
      );
      return data.data || [];
    } catch (error) {
      console.error("Error fetching manga tags:", error);
      setError("Failed to load manga tags");
      return [];
    }
  };

  const getMangaByTags = async (tags, limit = 24, offset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();

      // Add each tag as a separate includedTags[] parameter
      tags.forEach((tag) => {
        params.append("includedTags[]", tag);
      });

      params.append("limit", limit.toString());
      params.append("offset", offset.toString());
      params.append("includes[]", "cover_art");
      params.append("includes[]", "author");
      params.append("includes[]", "artist");
      params.append("contentRating[]", "safe");
      params.append("contentRating[]", "suggestive");

      const endpoint = `manga?${params.toString()}`;
      const data = await fetchWithRetry(
        `/api/manga?endpoint=${encodeURIComponent(endpoint)}`
      );
      return data.data || [];
    } catch (error) {
      console.error("Error fetching manga by tags:", error);
      setError("Failed to load manga by tags");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const searchManga = async (query) => {
    try {
      const params = new URLSearchParams({
        title: query,
        limit: "5",
        "includes[]": "cover_art",
        "contentRating[]": ["safe", "suggestive"],
      });

      const endpoint = `manga?${params.toString()}`;
      const data = await fetchWithRetry(
        `/api/manga?endpoint=${encodeURIComponent(endpoint)}`
      );
      return data.data || [];
    } catch (error) {
      console.error("Error searching manga:", error);
      setError("Failed to search manga");
      return [];
    }
  };

  const getChapterWithPages = async (mangaId, chapterId) => {
    setLoading(true);
    setError(null);
    try {
      // First, get the chapter information
      const chapterEndpoint = `chapter/${chapterId}`;
      const chapterData = await fetchWithRetry(
        `/api/manga?endpoint=${encodeURIComponent(chapterEndpoint)}`
      );

      if (!chapterData || !chapterData.data) {
        throw new Error("Chapter not found");
      }

      // Then, get the chapter pages
      const pagesEndpoint = `at-home/server/${chapterId}`;
      const pagesData = await fetchWithRetry(
        `/api/manga?endpoint=${encodeURIComponent(pagesEndpoint)}`
      );

      if (!pagesData || !pagesData.chapter) {
        throw new Error("Chapter pages not found");
      }

      // Construct the full URLs for the pages
      const baseUrl = pagesData.baseUrl;
      const hash = pagesData.chapter.hash;
      const pages = pagesData.chapter.data.map(
        (page) => `${baseUrl}/data/${hash}/${page}`
      );

      return {
        chapterData: chapterData.data,
        pages: pages,
      };
    } catch (error) {
      console.error("Error fetching chapter:", error);
      setError("Failed to load chapter");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCoverImageUrl = (manga) => {
    try {
      if (!manga || !manga.relationships) return null;

      const coverArt = manga.relationships.find(
        (rel) => rel.type === "cover_art"
      );
      if (!coverArt || !coverArt.attributes || !coverArt.attributes.fileName) {
        return null;
      }

      return `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}`;
    } catch (err) {
      console.error("Error generating cover URL:", err);
      return null;
    }
  };

  const value = {
    loading,
    error,
    getPopularManga,
    getMangaById,
    getMangaChapters,
    getMangaTags,
    getMangaByTags,
    searchManga,
    getChapterWithPages,
    getCoverImageUrl,
  };

  return (
    <MangaContext.Provider value={value}>{children}</MangaContext.Provider>
  );
};

export const useManga = () => {
  const context = useContext(MangaContext);
  if (!context) {
    throw new Error("useManga must be used within a MangaProvider");
  }
  return context;
};
