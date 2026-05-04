import { useState, useEffect, useCallback } from 'react';
import { VideoMetadata } from '../types/video';

const STORAGE_KEY = 'videofetch_history';
const MAX_HISTORY = 50;

export function useVideoHistory() {
  const [history, setHistory] = useState<VideoMetadata[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as VideoMetadata[];
        setHistory(parsed);
      }
    } catch (error) {
      console.error('Failed to load video history:', error);
    }
  }, []);

  // Persist history to localStorage whenever it changes
  const persist = useCallback((videos: VideoMetadata[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
    } catch (error) {
      console.error('Failed to save video history:', error);
    }
  }, []);

  const addToHistory = useCallback((video: VideoMetadata) => {
    setHistory(prev => {
      // Avoid duplicates by video URL
      const filtered = prev.filter(v => v.url !== video.url);
      const updated = [video, ...filtered].slice(0, MAX_HISTORY);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const removeFromHistory = useCallback((url: string) => {
    setHistory(prev => {
      const updated = prev.filter(v => v.url !== url);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}
