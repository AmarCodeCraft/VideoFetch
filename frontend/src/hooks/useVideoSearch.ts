import { useState, useCallback } from 'react';
import { VideoInfo } from '../types/video';
import { searchVideos } from '../services/youtube';
import toast from 'react-hot-toast';

export function useVideoSearch() {
  const [results, setResults] = useState<VideoInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState('');

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setLastQuery('');
      return;
    }

    setLoading(true);
    setLastQuery(query);

    try {
      const videos = await searchVideos(query);
      setResults(videos);
      if (videos.length === 0) {
        toast('No results found', { icon: '🔍' });
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed. Try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setLastQuery('');
  }, []);

  return { results, loading, lastQuery, search, clear };
}
