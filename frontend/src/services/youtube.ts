import { YOUTUBE_API_KEY, YOUTUBE_API_BASE_URL } from '../config/youtube';
import { VideoInfo } from '../types/video';

interface YouTubeVideoItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
    channelTitle: string;
    publishedAt: string;
  };
  contentDetails: { duration: string };
  statistics: { viewCount: string };
}

function mapToVideoInfo(video: YouTubeVideoItem): VideoInfo {
  return {
    id: video.id,
    title: video.snippet.title,
    description: video.snippet.description,
    thumbnails: {
      default: video.snippet.thumbnails.default.url,
      medium: video.snippet.thumbnails.medium.url,
      high: video.snippet.thumbnails.high.url,
    },
    channelTitle: video.snippet.channelTitle,
    publishedAt: video.snippet.publishedAt,
    viewCount: video.statistics.viewCount,
    duration: video.contentDetails.duration,
  };
}

export async function fetchVideoInfo(videoId: string): Promise<VideoInfo> {
  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?` +
      `part=snippet,contentDetails,statistics` +
      `&id=${videoId}` +
      `&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items?.[0]) {
      throw new Error('Video not found');
    }

    return mapToVideoInfo(data.items[0]);
  } catch (error) {
    console.error('Error fetching video:', error);
    throw new Error('Failed to fetch video information');
  }
}

export async function searchVideos(query: string, maxResults = 12): Promise<VideoInfo[]> {
  if (!query.trim()) return [];

  try {
    // Step 1: search to get video IDs
    const searchRes = await fetch(
      `${YOUTUBE_API_BASE_URL}/search?` +
      `part=snippet&type=video` +
      `&q=${encodeURIComponent(query)}` +
      `&maxResults=${maxResults}` +
      `&key=${YOUTUBE_API_KEY}`
    );

    if (!searchRes.ok) {
      throw new Error(`Search API Error: ${searchRes.status}`);
    }

    const searchData = await searchRes.json();
    const videoIds: string[] = (searchData.items || [])
      .map((item: { id: { videoId: string } }) => item.id?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) return [];

    // Step 2: fetch full info for those IDs in one batch
    const detailsRes = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?` +
      `part=snippet,contentDetails,statistics` +
      `&id=${videoIds.join(',')}` +
      `&key=${YOUTUBE_API_KEY}`
    );

    if (!detailsRes.ok) {
      throw new Error(`Videos API Error: ${detailsRes.status}`);
    }

    const detailsData = await detailsRes.json();
    return (detailsData.items || []).map(mapToVideoInfo);
  } catch (error) {
    console.error('Error searching videos:', error);
    throw new Error('Failed to search videos');
  }
}