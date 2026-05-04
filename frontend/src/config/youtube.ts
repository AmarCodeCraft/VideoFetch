// Use environment variables for sensitive data
export const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || 'AIzaSyBEBNcSa1XdVuBMmPp1vVO3Pw-TStp57yY';
export const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const VIDEO_QUALITIES = [
  { label: '4K', width: 3840, height: 2160, fileSize: '2.1 GB' },
  { label: '1080p', width: 1920, height: 1080, fileSize: '850 MB' },
  { label: '720p', width: 1280, height: 720, fileSize: '450 MB' },
  { label: '480p', width: 854, height: 480, fileSize: '250 MB' },
] as const;