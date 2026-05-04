import React from 'react';

interface VideoOverlayProps {
  children: React.ReactNode;
  show: boolean;
}

export function VideoOverlay({ children, show }: VideoOverlayProps) {
  return (
    <div 
      className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {children}
      </div>
    </div>
  );
}