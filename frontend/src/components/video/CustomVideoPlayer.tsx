import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Volume1, Maximize, Minimize,
  SkipBack, SkipForward, Settings, PictureInPicture2, Loader2,
  Rewind, FastForward,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomVideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function CustomVideoPlayer({
  src,
  title,
  poster,
  autoPlay = true,
  onEnded,
}: CustomVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Playback state
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(true);

  // UI state
  const [fullscreen, setFullscreen] = useState(false);
  const [pip, setPip] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [scrubHover, setScrubHover] = useState<{ x: number; time: number } | null>(null);
  const [flashMsg, setFlashMsg] = useState<string | null>(null);

  // Brief on-screen action label (like YouTube's "2x" / "+5s" indicator)
  const flash = useCallback((msg: string) => {
    setFlashMsg(msg);
    setTimeout(() => setFlashMsg(null), 600);
  }, []);

  // Auto-hide controls after inactivity
  const resetHideTimer = useCallback(() => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setShowControls(true);
    hideTimeoutRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
        setShowSpeedMenu(false);
      }
    }, 3000);
  }, []);

  // Playback actions
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, []);

  const seek = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta));
    flash(delta > 0 ? `+${delta}s` : `${delta}s`);
  }, [flash]);

  const seekTo = useCallback((time: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, time));
  }, []);

  const changeVolume = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    const newVol = Math.max(0, Math.min(1, v.volume + delta));
    v.volume = newVol;
    v.muted = false;
    flash(`${Math.round(newVol * 100)}%`);
  }, [flash]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    flash(v.muted ? 'Muted' : 'Unmuted');
  }, [flash]);

  const changeSpeed = useCallback((newSpeed: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = newSpeed;
    setSpeed(newSpeed);
    flash(`${newSpeed}x`);
    setShowSpeedMenu(false);
  }, [flash]);

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  const togglePip = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await v.requestPictureInPicture();
      }
    } catch (err) {
      console.error('PiP error:', err);
    }
  }, []);

  // Keyboard shortcuts — YouTube-style
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      // Only respond when our player is the active focus container
      if (!containerRef.current?.contains(document.activeElement) && !document.fullscreenElement) {
        // Still handle if player is clearly visible — check if we contain the event target
        if (!containerRef.current?.contains(target)) return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
          e.preventDefault();
          seek(-5);
          break;
        case 'arrowright':
          e.preventDefault();
          seek(5);
          break;
        case 'j':
          e.preventDefault();
          seek(-10);
          break;
        case 'l':
          e.preventDefault();
          seek(10);
          break;
        case 'arrowup':
          e.preventDefault();
          changeVolume(0.1);
          break;
        case 'arrowdown':
          e.preventDefault();
          changeVolume(-0.1);
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'p':
          e.preventDefault();
          togglePip();
          break;
        case '>':
          e.preventDefault();
          changeSpeed(Math.min(2, speed + 0.25));
          break;
        case '<':
          e.preventDefault();
          changeSpeed(Math.max(0.25, speed - 0.25));
          break;
        case '0': case '1': case '2': case '3': case '4':
        case '5': case '6': case '7': case '8': case '9': {
          e.preventDefault();
          const pct = parseInt(e.key, 10) / 10;
          const v = videoRef.current;
          if (v && v.duration) seekTo(v.duration * pct);
          break;
        }
      }
      resetHideTimer();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay, seek, changeVolume, toggleMute, toggleFullscreen, togglePip, seekTo, resetHideTimer, speed, changeSpeed]);

  // Fullscreen change listener
  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Sync playback rate on video element when mounted
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed, src]);

  // Compute volume icon
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const progressPct = duration > 0 ? (current / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

  // Handle click on progress bar
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seekTo((duration || 0) * pct);
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    setScrubHover({ x, time: (duration || 0) * pct });
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => {
        if (videoRef.current && !videoRef.current.paused) setShowControls(false);
      }}
      className={cn(
        'relative w-full bg-black rounded-2xl overflow-hidden ring-1 ring-surface-700/40 group/player select-none',
        fullscreen ? 'rounded-none' : 'aspect-video',
        'focus:outline-none focus:ring-2 focus:ring-brand-500/50'
      )}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        className="w-full h-full"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onPlay={() => { setPlaying(true); resetHideTimer(); }}
        onPause={() => { setPlaying(false); setShowControls(true); }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          setLoading(false);
        }}
        onVolumeChange={(e) => {
          setVolume(e.currentTarget.volume);
          setMuted(e.currentTarget.muted);
        }}
        onWaiting={() => setLoading(true)}
        onPlaying={() => setLoading(false)}
        onCanPlay={() => setLoading(false)}
        onProgress={(e) => {
          const v = e.currentTarget;
          if (v.buffered.length > 0) {
            setBuffered(v.buffered.end(v.buffered.length - 1));
          }
        }}
        onEnterPictureInPicture={() => setPip(true)}
        onLeavePictureInPicture={() => setPip(false)}
        onEnded={onEnded}
      />

      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      )}

      {/* Flash action indicator (center) */}
      {flashMsg && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-bold animate-fade-in">
            {flashMsg}
          </div>
        </div>
      )}

      {/* Large center play button when paused */}
      {!playing && !loading && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center group/play"
          aria-label="Play"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full gradient-brand flex items-center justify-center shadow-neon-lg transition-transform duration-300 group-hover/play:scale-110">
            <Play className="w-7 h-7 sm:w-9 sm:h-9 text-white fill-white ml-1" />
          </div>
        </button>
      )}

      {/* Top gradient + title */}
      {title && (
        <div
          className={cn(
            'absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-3 sm:p-4 pointer-events-none transition-opacity duration-300',
            showControls ? 'opacity-100' : 'opacity-0'
          )}
        >
          <h3 className="text-white text-sm sm:text-base font-semibold line-clamp-1 drop-shadow-lg">
            {title}
          </h3>
        </div>
      )}

      {/* Bottom control bar */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Progress bar */}
        <div
          className="group/bar relative h-8 flex items-center cursor-pointer px-2 sm:px-4"
          onClick={handleProgressClick}
          onMouseMove={handleProgressHover}
          onMouseLeave={() => setScrubHover(null)}
        >
          <div className="relative w-full h-1 group-hover/bar:h-1.5 bg-white/20 rounded-full overflow-hidden transition-all">
            {/* Buffered */}
            <div
              className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
              style={{ width: `${bufferedPct}%` }}
            />
            {/* Played */}
            <div
              className="absolute inset-y-0 left-0 gradient-brand rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {/* Scrubber thumb */}
          <div
            className="absolute top-1/2 w-3 h-3 rounded-full bg-white shadow-lg -translate-y-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none"
            style={{ left: `calc(${progressPct}% + ${scrubHover ? 0 : 8}px)` }}
          />
          {/* Hover time tooltip */}
          {scrubHover && (
            <div
              className="absolute bottom-full mb-2 bg-black/90 text-white text-[11px] font-mono px-2 py-1 rounded pointer-events-none -translate-x-1/2"
              style={{ left: scrubHover.x }}
            >
              {formatTime(scrubHover.time)}
            </div>
          )}
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 pb-2 sm:pb-3 text-white">
          {/* Play/pause */}
          <button
            type="button"
            onClick={togglePlay}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          {/* Rewind 10s */}
          <button
            type="button"
            onClick={() => seek(-10)}
            className="hidden sm:block p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Rewind 10 seconds"
            title="Rewind 10s (J)"
          >
            <Rewind className="w-5 h-5" />
          </button>

          {/* Forward 10s */}
          <button
            type="button"
            onClick={() => seek(10)}
            className="hidden sm:block p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Forward 10 seconds"
            title="Forward 10s (L)"
          >
            <FastForward className="w-5 h-5" />
          </button>

          {/* Volume (hidden on very small screens to save space) */}
          <div className="flex items-center gap-1 group/vol">
            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Mute"
            >
              <VolumeIcon className="w-5 h-5" />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => {
                const v = videoRef.current;
                if (v) {
                  v.volume = parseFloat(e.target.value);
                  v.muted = false;
                }
              }}
              className="hidden sm:block w-0 group-hover/vol:w-20 transition-all duration-300 accent-brand-500 h-1"
            />
          </div>

          {/* Time */}
          <div className="text-xs sm:text-sm font-mono tabular-nums ml-1 sm:ml-2">
            <span>{formatTime(current)}</span>
            <span className="text-white/50"> / {formatTime(duration)}</span>
          </div>

          <div className="flex-1" />

          {/* Speed */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSpeedMenu((s) => !s)}
              className="px-2 py-1 hover:bg-white/10 rounded-lg transition-colors text-xs sm:text-sm font-semibold"
              aria-label="Playback speed"
              title="Speed (< >)"
            >
              {speed}x
            </button>
            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-2 glass rounded-xl p-1 min-w-[80px] shadow-xl">
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => changeSpeed(s)}
                    className={cn(
                      'w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 transition-colors',
                      s === speed && 'bg-brand-500/20 text-brand-300'
                    )}
                  >
                    {s}x {s === 1 && <span className="text-white/40">Normal</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings — toggle speed menu on mobile */}
          <button
            type="button"
            onClick={() => setShowSpeedMenu((s) => !s)}
            className="sm:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Skip to start */}
          <button
            type="button"
            onClick={() => seekTo(0)}
            className="hidden sm:block p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Restart"
            title="Restart"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Skip to end */}
          <button
            type="button"
            onClick={() => seekTo(duration)}
            className="hidden sm:block p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Go to end"
            title="Go to end"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Picture-in-Picture */}
          {document.pictureInPictureEnabled && (
            <button
              type="button"
              onClick={togglePip}
              className={cn(
                'p-1.5 sm:p-2 rounded-lg transition-colors',
                pip ? 'bg-brand-500/20 text-brand-300' : 'hover:bg-white/10'
              )}
              aria-label="Picture in picture"
              title="Picture-in-Picture (P)"
            >
              <PictureInPicture2 className="w-5 h-5" />
            </button>
          )}

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Fullscreen"
            title="Fullscreen (F)"
          >
            {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Keyboard shortcuts hint (shown briefly on first hover) */}
      <div
        className={cn(
          'absolute top-14 right-3 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-md pointer-events-none transition-opacity',
          showControls && !loading ? 'opacity-70' : 'opacity-0'
        )}
      >
        Space · J/L · M · F · P
      </div>
    </div>
  );
}
