import { useState } from 'react';
import { VideoMetadata } from '../types/video';
import { fetchVideoInfo } from '../services/youtube';
import { extractVideoId } from '../utils/youtube';
import toast from 'react-hot-toast';

export function useVideoFetch() {
  const [loading, setLoading] = useState(false);

  async function fetchVideo(url: string): Promise<VideoMetadata | null> {
    const videoId = extractVideoId(url);
    if (!videoId) {
      toast.error('Invalid YouTube URL');
      return null;
    }

    setLoading(true);
    try {
      const info = await fetchVideoInfo(videoId);
      return { url, info };
    } catch (error) {
      console.error('Error fetching video:', error);
      toast.error('Failed to fetch video information');
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { fetchVideo, loading };
}