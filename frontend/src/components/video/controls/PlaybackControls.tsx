import React from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  onPlayPause: () => void;
  onVolumeChange: (value: number) => void;
  onMuteToggle: () => void;
}

export function PlaybackControls({
  isPlaying,
  isMuted,
  volume,
  onPlayPause,
  onVolumeChange,
  onMuteToggle
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onPlayPause}
        className="p-2 hover:bg-white/10 rounded-full transition-colors"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6" />
        )}
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={onMuteToggle}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="w-24 accent-blue-500"
          aria-label="Volume"
        />
      </div>
    </div>
  );
}