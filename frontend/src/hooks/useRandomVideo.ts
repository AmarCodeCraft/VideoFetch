import { useState, useEffect } from 'react';
import { FEATURED_VIDEOS } from '../config/featuredVideos';
import { fetchVideoInfo } from '../services/youtube';
import { VideoInfo } from '../types/video';

export function useRandomVideo() {
  const [video, setVideo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRandomVideo() {
      try {
        const randomIndex = Math.floor(Math.random() * FEATURED_VIDEOS.length);
        const randomVideo = FEATURED_VIDEOS[randomIndex];
        const videoInfo = await fetchVideoInfo(randomVideo.id);
        setVideo(videoInfo);
      } catch (error) {
        console.error('Failed to load random video:', error);
      } finally {
        setLoading(false);
      }
    }

    loadRandomVideo();
  }, []);

  return { video, loading };
}