import { useState, FormEvent, useEffect, useRef } from 'react';
import { Search, Loader2, X, Youtube, Sparkles } from 'lucide-react';
import { useVideoSearch } from '@/hooks/useVideoSearch';
import { VideoCard } from '@/components/VideoCard';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VideoInfo } from '@/types/video';

const QUICK_SEARCHES = ['Lo-fi music', 'React tutorial', 'Cooking', 'Travel vlog', 'Tech reviews'];

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [playing, setPlaying] = useState<VideoInfo | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const { results, loading, lastQuery, search, clear } = useVideoSearch();

  const handlePlay = (video: VideoInfo) => {
    setPlaying(video);
  };

  // Smooth scroll to player when a new video is selected
  useEffect(() => {
    if (playing && playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [playing?.id]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    search(query);
  };

  const handleQuickSearch = (q: string) => {
    setQuery(q);
    search(q);
  };

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="flex flex-col items-center text-center space-y-6 pt-6 animate-slide-up">
        <Badge variant="default" className="px-3 py-1">
          <Youtube className="w-3 h-3 mr-1.5" />
          Watch YouTube Videos
        </Badge>
        <div className="space-y-3">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">
            <span className="text-surface-100">Search YouTube by </span>
            <span className="gradient-text">Name</span>
          </h2>
          <p className="text-surface-400 text-base max-w-lg mx-auto font-light leading-relaxed">
            Type a video title, channel, or keyword to discover and watch videos directly here.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl">
          <div className="relative group">
            {focused && (
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/20 via-brand-400/10 to-brand-500/20 rounded-2xl blur-lg" />
            )}
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-surface-500 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="e.g. lo-fi beats to study to..."
                disabled={loading}
                className="w-full pl-11 pr-32 py-4 rounded-2xl bg-surface-800/70 border border-surface-700/50 text-surface-100 placeholder-surface-500 focus:border-brand-500/40 focus:outline-none input-glow transition-all duration-300 text-sm font-medium disabled:opacity-50"
              />
              {query && !loading && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); clear(); }}
                  className="absolute right-32 p-1 rounded-md text-surface-500 hover:text-surface-200 hover:bg-surface-700/60 transition-colors"
                  aria-label="Clear"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="absolute right-2">
                <Button
                  type="submit"
                  variant="glow"
                  disabled={loading || !query.trim()}
                  className="h-10 px-5 text-sm gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  <span className="hidden sm:inline">{loading ? 'Searching...' : 'Search'}</span>
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Quick searches */}
        {!lastQuery && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="flex items-center gap-1.5 text-xs text-surface-500 mr-1">
              <Sparkles className="w-3 h-3" />
              Try:
            </span>
            {QUICK_SEARCHES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleQuickSearch(q)}
                className="px-3 py-1.5 rounded-full glass-light text-xs text-surface-300 hover:text-brand-400 hover:border-brand-500/30 transition-all duration-200"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {loading && results.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-video bg-surface-800/50" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-surface-800/60 rounded" />
                <div className="h-3 w-2/3 bg-surface-800/40 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inline player */}
      {playing && (
        <div ref={playerRef} className="max-w-4xl mx-auto animate-scale-in">
          <div className="flex items-center justify-between mb-5 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-1 h-6 rounded-full gradient-brand shrink-0" />
              <h2 className="text-xl font-bold text-surface-100">Now Playing</h2>
              <Badge variant="success" className="shrink-0">Live</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() => setPlaying(null)}
            >
              <X className="w-4 h-4" />
              Close
            </Button>
          </div>
          <VideoPlayer videoId={playing.id} title={playing.title} />
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full gradient-brand" />
            <h2 className="text-2xl font-bold text-surface-100">Results</h2>
            <Badge variant="default">{results.length}</Badge>
            <span className="text-surface-500 text-sm ml-1">for "{lastQuery}"</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((video, index) => (
              <div
                key={video.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
              >
                <VideoCard video={video} onPlay={handlePlay} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && lastQuery && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 glass rounded-2xl animate-fade-in">
          <div className="w-14 h-14 rounded-xl bg-surface-800/60 flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-surface-500" />
          </div>
          <p className="text-surface-200 font-semibold">No videos found</p>
          <p className="text-surface-500 text-sm mt-1">
            Nothing matches <span className="text-brand-400">"{lastQuery}"</span>
          </p>
        </div>
      )}
    </div>
  );
}
