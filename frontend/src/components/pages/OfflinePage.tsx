import { useState, useMemo, useRef } from 'react';
import { WifiOff, Wifi, HardDrive, Trash2, Search, Inbox, Clock, Eye, X, Upload, Play, FileVideo, Loader2, FolderDown, ExternalLink } from 'lucide-react';
import { useVideoHistory } from '@/hooks/useVideoHistory';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useOfflineVideos } from '@/hooks/useOfflineVideos';
import { useDownloadHistory } from '@/hooks/useDownloadHistory';
import { VideoCard } from '@/components/VideoCard';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { LocalVideoPlayer } from '@/components/video/LocalVideoPlayer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VideoInfo, VideoMetadata } from '@/types/video';
import { formatDuration, formatViewCount } from '@/utils/youtube';
import { OfflineVideoMeta } from '@/utils/offlineDB';
import toast from 'react-hot-toast';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatLocalDuration(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function OfflinePage() {
  const isOnline = useOnlineStatus();
  const { history, clearHistory, removeFromHistory } = useVideoHistory();
  const offline = useOfflineVideos();
  const { downloads, removeDownload, clearDownloads } = useDownloadHistory();
  const [query, setQuery] = useState('');
  const [playing, setPlaying] = useState<VideoInfo | null>(null);
  const [localPlaying, setLocalPlaying] = useState<OfflineVideoMeta | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const toastId = toast.loading(`Saving ${files.length} video${files.length > 1 ? 's' : ''} for offline...`);

    let successCount = 0;
    for (const file of Array.from(files)) {
      try {
        if (!file.type.startsWith('video/')) {
          toast.error(`${file.name} is not a video file`);
          continue;
        }
        await offline.addVideo(file);
        successCount++;
      } catch (err) {
        console.error(err);
        toast.error(`Failed to save ${file.name}`);
      }
    }

    setUploading(false);
    toast.dismiss(toastId);
    if (successCount > 0) {
      toast.success(`${successCount} video${successCount > 1 ? 's' : ''} saved for offline playback`);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const cached = useMemo(() => history.filter((v): v is VideoMetadata & { info: VideoInfo } => !!v.info), [history]);

  const filtered = useMemo(() => {
    if (!query.trim()) return cached;
    const q = query.toLowerCase();
    return cached.filter(
      (v) =>
        v.info.title.toLowerCase().includes(q) ||
        v.info.channelTitle.toLowerCase().includes(q)
    );
  }, [cached, query]);

  // Rough estimate of localStorage usage
  const storageSize = useMemo(() => {
    try {
      const raw = localStorage.getItem('videofetch_history') || '';
      const kb = new Blob([raw]).size / 1024;
      return kb < 1 ? `${(kb * 1024).toFixed(0)} B` : `${kb.toFixed(1)} KB`;
    } catch {
      return '0 KB';
    }
  }, [history]);

  const handlePlay = (video: VideoInfo) => {
    if (!isOnline) {
      toast.error('You are offline. Playback needs an internet connection.');
      return;
    }
    setPlaying(video);
  };

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="flex flex-col items-center text-center space-y-6 pt-6 animate-slide-up">
        <Badge variant={isOnline ? 'success' : 'default'} className="px-3 py-1">
          {isOnline ? <Wifi className="w-3 h-3 mr-1.5" /> : <WifiOff className="w-3 h-3 mr-1.5" />}
          {isOnline ? 'Online' : 'Offline Mode'}
        </Badge>

        <div className="space-y-3 px-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">
            <span className="text-surface-100">Your </span>
            <span className="gradient-text">Offline Library</span>
          </h2>
          <p className="text-surface-400 text-sm sm:text-base max-w-lg mx-auto font-light leading-relaxed">
            Upload your own video files to play them anywhere — no internet needed. Stored securely in your browser.
          </p>
        </div>

        {/* Upload CTA */}
        <div className="flex flex-col items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="glow"
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? 'Saving...' : 'Upload Video for Offline'}
          </Button>
          <p className="text-xs text-surface-500">
            MP4, WebM, MKV supported · Stored locally in IndexedDB
          </p>
        </div>

        {/* Storage stats */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <StatPill icon={<FileVideo className="w-3.5 h-3.5" />} label={`${offline.videos.length} offline video${offline.videos.length === 1 ? '' : 's'}`} />
          <StatPill icon={<Inbox className="w-3.5 h-3.5" />} label={`${cached.length} YouTube cached`} />
          <StatPill
            icon={<HardDrive className="w-3.5 h-3.5" />}
            label={
              offline.storage
                ? `${formatBytes(offline.storage.usage)} used`
                : `${storageSize} used`
            }
          />
        </div>
      </div>

      <Separator className="max-w-2xl mx-auto !bg-surface-800/40" />

      {/* Inline Local Player (true offline) */}
      {localPlaying && (
        <div className="max-w-4xl mx-auto animate-scale-in">
          <div className="flex items-center justify-between mb-5 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-1 h-6 rounded-full gradient-brand shrink-0" />
              <h2 className="text-xl font-bold text-surface-100">Playing Offline</h2>
              <Badge variant="success" className="shrink-0 gap-1">
                <WifiOff className="w-3 h-3" />
                No internet needed
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLocalPlaying(null)}>
              <X className="w-4 h-4" />
              Close
            </Button>
          </div>
          <LocalVideoPlayer
            videoId={localPlaying.id}
            title={localPlaying.name}
            getPlaybackUrl={offline.getPlaybackUrl}
          />
        </div>
      )}

      {/* Inline YouTube Player */}
      {playing && (
        <div className="max-w-4xl mx-auto animate-scale-in">
          <div className="flex items-center justify-between mb-5 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-1 h-6 rounded-full gradient-brand shrink-0" />
              <h2 className="text-xl font-bold text-surface-100">Now Playing</h2>
            </div>
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setPlaying(null)}>
              <X className="w-4 h-4" />
              Close
            </Button>
          </div>
          <VideoPlayer videoId={playing.id} title={playing.title} />
        </div>
      )}

      {/* TRUE Offline Videos Section */}
      {offline.videos.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded-full gradient-brand" />
              <h3 className="text-2xl font-bold text-surface-100">Saved for Offline</h3>
              <Badge variant="success" className="gap-1">
                <WifiOff className="w-3 h-3" />
                Plays without internet
              </Badge>
              <Badge variant="default">{offline.videos.length}</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-surface-500 hover:text-red-400"
              onClick={async () => {
                await offline.clearAll();
                toast.success('All offline videos cleared');
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offline.videos.map((v, index) => (
              <div
                key={v.id}
                className="glass rounded-2xl overflow-hidden card-hover group animate-slide-up"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                <div
                  className="relative cursor-pointer"
                  onClick={() => setLocalPlaying(v)}
                >
                  {v.thumbnail ? (
                    <img
                      src={v.thumbnail}
                      alt={v.name}
                      className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-surface-800/60 flex items-center justify-center">
                      <FileVideo className="w-10 h-10 text-surface-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-950/80 via-surface-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                  {/* Duration */}
                  <span className="absolute bottom-3 right-3 bg-surface-950/80 backdrop-blur-sm text-white px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {formatLocalDuration(v.duration)}
                  </span>

                  {/* Offline badge */}
                  <Badge variant="success" className="absolute top-3 left-3 gap-1">
                    <WifiOff className="w-3 h-3" />
                    Offline
                  </Badge>

                  {/* Center play */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-14 h-14 rounded-full gradient-brand flex items-center justify-center shadow-neon-lg scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
                      <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await offline.removeVideo(v.id);
                      if (localPlaying?.id === v.id) setLocalPlaying(null);
                      toast.success('Removed from offline storage');
                    }}
                    className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-surface-950/70 backdrop-blur-sm text-surface-400 hover:text-red-400 hover:bg-surface-950/90 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-sm text-surface-100 mb-2 line-clamp-2 leading-snug group-hover:text-white transition-colors">
                    {v.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-surface-500">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      {formatBytes(v.size)}
                    </span>
                    <span className="truncate">{v.type.replace('video/', '').toUpperCase()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download History Section */}
      {downloads.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-1 h-6 rounded-full gradient-brand" />
              <h3 className="text-2xl font-bold text-surface-100">Downloaded Videos</h3>
              <Badge variant="default" className="gap-1">
                <FolderDown className="w-3 h-3" />
                {downloads.length}
              </Badge>
              <Badge variant="outline" className="text-[10px]">in browser Downloads folder</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-surface-500 hover:text-red-400"
              onClick={() => {
                clearDownloads();
                toast.success('Download history cleared');
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </Button>
          </div>

          <div className="rounded-2xl border border-surface-800/60 glass divide-y divide-surface-800/40 overflow-hidden">
            {downloads.map((d) => (
              <div
                key={`${d.videoId}-${d.quality}`}
                className="flex items-center gap-3 p-3 sm:p-4 hover:bg-surface-800/20 transition-colors"
              >
                <img
                  src={d.thumbnail}
                  alt=""
                  className="w-20 h-12 sm:w-28 sm:h-16 rounded-lg object-cover shrink-0 bg-surface-800"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-surface-100 line-clamp-1">{d.title}</p>
                  <p className="text-xs text-surface-500 line-clamp-1 mt-0.5">{d.channel}</p>
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-surface-500 mt-1.5">
                    <Badge variant="success" className="text-[10px] py-0 px-1.5">{d.quality}</Badge>
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      {formatBytes(d.size)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(d.downloadedAt).toLocaleDateString()}
                    </span>
                    <span className="hidden md:inline truncate font-mono text-surface-600">
                      {d.filename}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={`https://www.youtube.com/watch?v=${d.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-surface-500 hover:text-brand-400 hover:bg-surface-800/60 transition-colors"
                    title="Open on YouTube"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      removeDownload(d.videoId, d.quality);
                      toast.success('Removed from history');
                    }}
                    className="p-2 rounded-lg text-surface-500 hover:text-red-400 hover:bg-surface-800/60 transition-colors"
                    title="Remove from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 text-[11px] text-surface-500 px-1">
            <FolderDown className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>
              Files saved to your browser's default Downloads folder. To re-play them with the custom player,
              upload them back via the <span className="text-brand-400 font-semibold">Upload Video for Offline</span> button above.
            </p>
          </div>
        </div>
      )}

      {cached.length === 0 && offline.videos.length === 0 && downloads.length === 0 ? (
        <EmptyLibrary />
      ) : cached.length === 0 ? null : (
        <div className="space-y-6 animate-fade-in">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-1 h-6 rounded-full gradient-brand" />
              <h3 className="text-2xl font-bold text-surface-100">YouTube History</h3>
              <Badge variant="outline" className="text-[10px]">metadata only</Badge>
              <Badge variant="default">{filtered.length}</Badge>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter cached..."
                  className="pl-9 pr-3 py-2 rounded-lg bg-surface-800/60 border border-surface-700/50 text-surface-200 placeholder-surface-500 focus:border-brand-500/40 focus:outline-none text-sm w-full sm:w-56"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-surface-500 hover:text-red-400"
                onClick={() => {
                  clearHistory();
                  toast.success('Library cleared');
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </Button>
            </div>
          </div>

          {/* Offline banner */}
          {!isOnline && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <WifiOff className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-amber-300 font-semibold">You are currently offline</p>
                <p className="text-amber-200/70 mt-0.5">
                  Metadata and thumbnails load from local storage. Video playback will resume once you're back online.
                </p>
              </div>
            </div>
          )}

          {/* Results */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((v, index) => (
                <div
                  key={v.url}
                  className="relative group animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                >
                  <VideoCard video={v.info} onPlay={handlePlay} />
                  <button
                    type="button"
                    onClick={() => {
                      removeFromHistory(v.url);
                      toast.success('Removed from library');
                    }}
                    className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-surface-950/70 backdrop-blur-sm text-surface-400 hover:text-red-400 hover:bg-surface-950/90 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    aria-label="Remove from library"
                    title="Remove from library"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 glass rounded-2xl">
              <Search className="w-8 h-8 text-surface-500 mb-3" />
              <p className="text-surface-300 font-medium">No cached videos match "{query}"</p>
            </div>
          )}

          {/* Compact list view as a fallback reference */}
          <details className="group">
            <summary className="cursor-pointer text-xs text-surface-500 hover:text-surface-300 flex items-center gap-2 select-none">
              <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
              Show compact list ({filtered.length})
            </summary>
            <div className="mt-3 rounded-xl border border-surface-800/60 divide-y divide-surface-800/60 overflow-hidden">
              {filtered.map((v) => (
                <div key={`row-${v.url}`} className="flex items-center gap-3 p-3 hover:bg-surface-800/30 transition-colors">
                  <img src={v.info.thumbnails.default} alt="" className="w-20 h-12 rounded object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-surface-100 font-medium truncate">{v.info.title}</p>
                    <p className="text-xs text-surface-500 truncate">
                      {v.info.channelTitle}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 text-xs text-surface-500 shrink-0">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(v.info.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatViewCount(v.info.viewCount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

function StatPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-xs text-surface-300">
      <span className="text-brand-400">{icon}</span>
      {label}
    </div>
  );
}

function EmptyLibrary() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center">
          <HardDrive className="w-8 h-8 text-surface-500" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-neon">
          <WifiOff className="w-4 h-4 text-white" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-surface-100 mb-2">Your library is empty</h3>
      <p className="text-surface-400 text-sm max-w-sm text-center">
        Fetch or search for a video on the other pages — it will be saved here automatically for offline access.
      </p>
    </div>
  );
}
