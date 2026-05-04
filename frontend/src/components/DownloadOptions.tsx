import { useState } from 'react';
import { Download, Image, Film, Loader2, X } from 'lucide-react';
import { downloadThumbnail, downloadVideoViaBackend } from '../utils/download';
import { useDownloadHistory } from '@/hooks/useDownloadHistory';
import toast from 'react-hot-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface DownloadOptionsProps {
  videoId: string;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
  };
  title?: string;
  channel?: string;
}

type Quality = '1080p' | '720p' | '480p' | '360p';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function DownloadOptions({ videoId, thumbnails, title, channel }: DownloadOptionsProps) {
  const [downloading, setDownloading] = useState<Quality | null>(null);
  const [progress, setProgress] = useState(0);
  const [abortCtrl, setAbortCtrl] = useState<AbortController | null>(null);
  const { addDownload } = useDownloadHistory();

  const handleThumbnailDownload = async (url: string, quality: 'default' | 'medium' | 'high') => {
    try {
      await downloadThumbnail(url, quality);
      toast.success(`${quality} thumbnail opened — right-click to save`);
    } catch {
      toast.error('Failed to download thumbnail');
    }
  };

  const handleVideoDownload = async (quality: Quality) => {
    if (downloading) return;

    const ctrl = new AbortController();
    setAbortCtrl(ctrl);
    setDownloading(quality);
    setProgress(0);

    const toastId = toast.loading(`Starting ${quality} download...`);

    try {
      let finalSize = 0;
      await downloadVideoViaBackend(
        videoId,
        quality,
        (loaded) => {
          setProgress(loaded);
          finalSize = loaded;
          toast.loading(`Downloading ${quality}: ${formatBytes(loaded)}`, { id: toastId });
        },
        ctrl.signal
      );

      // Record to download history
      addDownload({
        videoId,
        title: title || `Video ${videoId}`,
        channel: channel || 'Unknown',
        thumbnail: thumbnails.medium || thumbnails.default,
        quality,
        size: finalSize,
        filename: `${(title || videoId).replace(/[\\/:*?"<>|]/g, '_').slice(0, 100)}-${quality.replace('p', '')}p.mp4`,
        downloadedAt: Date.now(),
      });

      toast.success(`${quality} video saved!`, { id: toastId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Download failed';
      if (msg.includes('aborted') || ctrl.signal.aborted) {
        toast.dismiss(toastId);
        toast('Download cancelled', { icon: '�' });
      } else if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        toast.error('Backend not running. Start it with: npm run dev', { id: toastId, duration: 5000 });
      } else {
        toast.error(`Download failed: ${msg}`, { id: toastId });
      }
    } finally {
      setDownloading(null);
      setProgress(0);
      setAbortCtrl(null);
    }
  };

  const handleCancel = () => {
    abortCtrl?.abort();
  };

  return (
    <Tabs defaultValue="thumbnails">
      <TabsList className="w-full">
        <TabsTrigger value="thumbnails" className="flex-1 gap-1.5">
          <Image className="w-3 h-3" />
          Thumbnails
        </TabsTrigger>
        <TabsTrigger value="video" className="flex-1 gap-1.5">
          <Film className="w-3 h-3" />
          Video
        </TabsTrigger>
      </TabsList>

      <TabsContent value="thumbnails">
        <div className="flex flex-wrap gap-2">
          {Object.entries(thumbnails).map(([quality, url]) => (
            <Button
              key={quality}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => handleThumbnailDownload(url, quality as 'default' | 'medium' | 'high')}
            >
              <Download size={12} />
              {quality}
            </Button>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="video">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(['1080p', '720p', '480p', '360p'] as const).map(quality => {
              const isThis = downloading === quality;
              const isDisabled = downloading !== null && !isThis;
              return (
                <Button
                  key={quality}
                  variant={isThis ? 'glow' : 'outline'}
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => handleVideoDownload(quality)}
                  disabled={isDisabled}
                >
                  {isThis ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                  {quality}
                </Button>
              );
            })}
          </div>

          {downloading && (
            <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-surface-800/40 border border-surface-700/40">
              <div className="flex items-center gap-2 text-xs text-surface-300 min-w-0">
                <Loader2 size={12} className="animate-spin text-brand-400 shrink-0" />
                <span className="truncate">
                  Downloading <span className="text-brand-400 font-semibold">{downloading}</span>
                  {progress > 0 && <> · {formatBytes(progress)}</>}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 h-7 px-2 text-xs text-surface-500 hover:text-red-400"
                onClick={handleCancel}
              >
                <X size={12} />
                Cancel
              </Button>
            </div>
          )}

          <p className="text-[10px] text-surface-500 leading-relaxed">
            Powered by <span className="text-brand-400 font-semibold">yt-dlp</span> backend ·
            Requires <code className="text-surface-400">npm run dev</code> to start the server
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}