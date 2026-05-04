import React from 'react';
import { PlaybackControls } from './PlaybackControls';
import { ProgressBar } from './ProgressBar';
import { Maximize, Settings } from 'lucide-react';

interface VideoControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  buffered: number;
  onPlayPause: () => void;
  onVolumeChange: (value: number) => void;
  onMuteToggle: () => void;
  onSeek: (time: number) => void;
}

export function VideoControls({
  isPlaying,
  isMuted,
  volume,
  currentTime,
  duration,
  buffered,
  onPlayPause,
  onVolumeChange,
  onMuteToggle,
  onSeek,
}: VideoControlsProps) {
  return (
    <div className="space-y-4 text-white">
      <ProgressBar
        currentTime={currentTime}
        duration={duration}
        buffered={buffered}
        onSeek={onSeek}
      />
      
      <div className="flex items-center justify-between">
        <PlaybackControls
          isPlaying={isPlaying}
          isMuted={isMuted}
          volume={volume}
          onPlayPause={onPlayPause}
          onVolumeChange={onVolumeChange}
          onMuteToggle={onMuteToggle}
        />
        
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}