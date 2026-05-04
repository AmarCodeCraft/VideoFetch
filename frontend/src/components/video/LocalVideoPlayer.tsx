import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { CustomVideoPlayer } from './CustomVideoPlayer';

interface LocalVideoPlayerProps {
  videoId: string;
  title: string;
  getPlaybackUrl: (id: string) => Promise<string | null>;
}

export function LocalVideoPlayer({ videoId, title, getPlaybackUrl }: LocalVideoPlayerProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let revoked = false;
    let createdUrl: string | null = null;

    setUrl(null);
    setError(null);

    getPlaybackUrl(videoId)
      .then((u) => {
        if (revoked) {
          if (u) URL.revokeObjectURL(u);
          return;
        }
        if (!u) {
          setError('Video not found in offline storage');
          return;
        }
        createdUrl = u;
        setUrl(u);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load offline video');
      });

    return () => {
      revoked = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [videoId, getPlaybackUrl]);

  if (error) {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden ring-1 ring-surface-700/40 bg-black flex items-center justify-center text-red-400 text-sm">
        {error}
      </div>
    );
  }

  if (!url) {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden ring-1 ring-surface-700/40 bg-black flex flex-col items-center justify-center gap-2 text-surface-400 text-sm">
        <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
        Loading offline video...
      </div>
    );
  }

  return <CustomVideoPlayer src={url} title={title} />;
}
