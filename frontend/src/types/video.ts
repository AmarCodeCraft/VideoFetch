export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
  };
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  duration: string;
}

export interface VideoMetadata {
  url: string;
  info: VideoInfo | null;
  error?: string;
}