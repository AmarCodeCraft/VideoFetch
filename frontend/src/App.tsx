import { useState } from 'react';
import { MainNav, PageView } from './components/navigation/MainNav';
import { SearchPage } from './components/pages/SearchPage';
import { OfflinePage } from './components/pages/OfflinePage';
import { Footer } from './components/footer/Footer';
import { VideoInput } from './components/VideoInput';
import { VideoPlayer } from './components/video/VideoPlayer';
import { VideoGrid } from './components/VideoGrid';
import { useVideoFetch } from './hooks/useVideoFetch';
import { useRandomVideo } from './hooks/useRandomVideo';
import { useVideoHistory } from './hooks/useVideoHistory';
import { VideoMetadata } from './types/video';
import { Loader2, Play, Download, Eye, Zap, Video, Link2, History, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { extractVideoId } from './utils/youtube';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

function HeroOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/[0.04] rounded-full blur-3xl animate-float" />
      <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] bg-brand-400/[0.03] rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/[0.02] rounded-full blur-3xl animate-pulse-slow" />
    </div>
  );
}

function FeaturePill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-light text-sm text-surface-300">
      <span className="text-brand-400">{icon}</span>
      {text}
    </div>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 glass rounded-2xl animate-fade-in">
      <div className="w-12 h-12 rounded-xl bg-surface-800/60 flex items-center justify-center mb-3">
        <Video className="w-5 h-5 text-surface-500" />
      </div>
      <p className="text-surface-300 font-medium">No matches found</p>
      <p className="text-surface-500 text-sm mt-1">
        Nothing matches <span className="text-brand-400">“{query}”</span>
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center">
          <Video className="w-8 h-8 text-surface-500" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-neon">
          <Link2 className="w-4 h-4 text-white" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-surface-200 mb-2">No videos yet</h3>
      <p className="text-surface-500 text-sm max-w-sm text-center leading-relaxed">
        Paste a YouTube URL above to get started. We'll fetch the video info, thumbnails, and embed it for you.
      </p>
      <div className="flex gap-3 mt-6">
        <Badge variant="outline">
          <Play className="w-3 h-3 mr-1" /> Preview
        </Badge>
        <Badge variant="outline">
          <Download className="w-3 h-3 mr-1" /> Thumbnails
        </Badge>
        <Badge variant="outline">
          <Eye className="w-3 h-3 mr-1" /> Metadata
        </Badge>
      </div>
    </div>
  );
}

function filterVideos(videos: VideoMetadata[], query: string): VideoMetadata[] {
  if (!query.trim()) return videos;
  const q = query.toLowerCase();
  return videos.filter(v => {
    if (!v.info) return false;
    return (
      v.info.title.toLowerCase().includes(q) ||
      v.info.channelTitle.toLowerCase().includes(q)
    );
  });
}

export function App() {
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState<PageView>('fetch');
  const { fetchVideo, loading: fetchLoading } = useVideoFetch();
  const { video: randomVideo, loading: randomLoading } = useRandomVideo();
  const { history, addToHistory, clearHistory } = useVideoHistory();

  const filteredVideos = filterVideos(videos, searchQuery);
  const filteredHistory = filterVideos(history, searchQuery);

  const handleVideoSubmit = async (url: string) => {
    const videoId = extractVideoId(url);
    if (!videoId) {
      toast.error('Invalid YouTube URL');
      return;
    }

    try {
      const video = await fetchVideo(url);
      if (video) {
        setVideos(prev => [video, ...prev]);
        addToHistory(video);
        toast.success('Video fetched successfully!');
      }
    } catch {
      toast.error('Failed to fetch video');
    }
  };

  if (randomLoading && videos.length === 0) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-surface-300 text-sm font-medium">Loading videos...</p>
            <p className="text-surface-600 text-xs mt-1">Fetching featured content</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg dot-pattern flex flex-col relative">
      <HeroOrbs />
      
      <Toaster
        position="top-right"
        toastOptions={{
          className: '!bg-surface-800 !text-surface-200 !border !border-surface-700/50 !shadow-glass !rounded-xl !text-sm',
          success: {
            iconTheme: { primary: '#ff3b3b', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />

      <MainNav
        searchQuery={page === 'fetch' ? searchQuery : ''}
        onSearchChange={setSearchQuery}
        page={page}
        onPageChange={setPage}
      />
      
      <main className="container mx-auto px-4 py-8 space-y-10 flex-1 relative z-10">
        {page === 'search' ? (
          <SearchPage />
        ) : page === 'offline' ? (
          <OfflinePage />
        ) : (
        <>
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-8 pt-10 pb-4 animate-slide-up">
          <div className="space-y-4">
            <Badge variant="default" className="mb-2 px-3 py-1">
              <Zap className="w-3 h-3 mr-1" />
              Fast & Free Video Fetcher
            </Badge>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
              <span className="text-surface-100">Discover & </span>
              <span className="gradient-text">Fetch</span>
              <br className="hidden sm:block" />
              <span className="text-surface-100"> Videos Instantly</span>
            </h2>
            <p className="text-surface-400 text-lg max-w-lg mx-auto font-light leading-relaxed">
              Paste any YouTube URL to preview, explore metadata, and download thumbnails in seconds.
            </p>
          </div>

          <VideoInput onSubmit={handleVideoSubmit} loading={fetchLoading} />

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <FeaturePill icon={<Play className="w-3.5 h-3.5" />} text="Instant Preview" />
            <FeaturePill icon={<Download className="w-3.5 h-3.5" />} text="Thumbnail Download" />
            <FeaturePill icon={<Eye className="w-3.5 h-3.5" />} text="Video Metadata" />
          </div>
        </div>

        <Separator className="max-w-2xl mx-auto !bg-surface-800/40" />
        
        {videos.length > 0 && videos[0].info ? (
          <div className="max-w-4xl mx-auto animate-scale-in">
            <VideoPlayer
              videoId={videos[0].info.id}
              title={videos[0].info.title}
            />
          </div>
        ) : randomVideo ? (
          <div className="max-w-4xl mx-auto animate-scale-in">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full gradient-brand" />
              <h2 className="text-2xl font-bold text-surface-100">Featured Video</h2>
              <Badge variant="success" className="ml-1">Live</Badge>
            </div>
            <VideoPlayer
              videoId={randomVideo.id}
              title={randomVideo.title}
            />
          </div>
        ) : null}
        
        {videos.length > 0 ? (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 rounded-full gradient-brand" />
              <h2 className="text-2xl font-bold text-surface-100">
                {searchQuery ? 'Search Results' : 'Your Videos'}
              </h2>
              <Badge variant="default">
                {filteredVideos.filter(v => v.info).length}
              </Badge>
            </div>
            {filteredVideos.length > 0 ? (
              <VideoGrid videos={filteredVideos} />
            ) : (
              <NoResults query={searchQuery} />
            )}
          </div>
        ) : !randomVideo ? (
          <EmptyState />
        ) : null}

        {/* History Section */}
        {history.length > 0 && videos.length === 0 && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-surface-400 to-surface-600" />
                <History className="w-5 h-5 text-surface-400" />
                <h2 className="text-2xl font-bold text-surface-100">
                  {searchQuery ? 'History Results' : 'Recent History'}
                </h2>
                <Badge variant="secondary">
                  {filteredHistory.filter(v => v.info).length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-surface-500 hover:text-red-400"
                onClick={() => {
                  clearHistory();
                  toast.success('History cleared');
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </Button>
            </div>
            {filteredHistory.length > 0 ? (
              <VideoGrid videos={filteredHistory} />
            ) : (
              <NoResults query={searchQuery} />
            )}
          </div>
        )}
        </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;