import React, { useRef } from 'react';
import { formatTime } from '../../../utils/time';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  buffered: number;
  onSeek: (time: number) => void;
}

export function ProgressBar({
  currentTime,
  duration,
  buffered,
  onSeek
}: ProgressBarProps) {
  const progressRef = useRef<HTMLDivElement>(null);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    onSeek(position * duration);
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-sm">{formatTime(currentTime)}</span>
      <div
        ref={progressRef}
        className="relative flex-1 h-1 bg-white/20 cursor-pointer group"
        onClick={handleSeek}
      >
        {/* Buffered progress */}
        <div
          className="absolute h-full bg-white/30"
          style={{ width: `${(buffered / duration) * 100}%` }}
        />
        {/* Playback progress */}
        <div
          className="absolute h-full bg-blue-500"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
        {/* Hover preview */}
        <div className="absolute h-full w-full opacity-0 group-hover:opacity-100">
          <div className="absolute top-[-8px] h-[16px] w-full">
            <div className="absolute h-3 w-3 bg-blue-500 rounded-full top-1/2 -translate-y-1/2" style={{ left: `${(currentTime / duration) * 100}%` }} />
          </div>
        </div>
      </div>
      <span className="text-sm">{formatTime(duration)}</span>
    </div>
  );
}