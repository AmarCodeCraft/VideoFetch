import { useEffect, useRef, useState, useCallback } from 'react';
import { loadYouTubeAPI } from '../utils/youtube';

declare global {
  interface Window {
    YT: {
      Player: any;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
        BUFFERING: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

export function useYouTubePlayer(videoId: string) {
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);

  const initPlayer = useCallback(() => {
    if (!window.YT) return;

    playerRef.current = new window.YT.Player(`youtube-player-${videoId}`, {
      videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        enablejsapi: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: handleReady,
        onStateChange: handleStateChange,
        onError: handleError,
      },
    });
  }, [videoId]);

  const reinitialize = useCallback((newVideoId: string) => {
    if (!playerRef.current || !isReady) {
      return;
    }

    try {
      playerRef.current.loadVideoById(newVideoId);
    } catch (error) {
      console.error('Error loading new video:', error);
      // If loading fails, destroy and recreate the player
      playerRef.current.destroy();
      playerRef.current = null;
      setIsReady(false);
      initPlayer();
    }
  }, [initPlayer, isReady]);

  useEffect(() => {
    loadYouTubeAPI().then(() => {
      if (!playerRef.current) {
        initPlayer();
      }
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [initPlayer]);

  const handleReady = () => {
    setIsReady(true);
    setDuration(playerRef.current.getDuration());
    setVolume(playerRef.current.getVolume());
    playerRef.current.playVideo();
  };

  const handleStateChange = (event: any) => {
    const { PLAYING, PAUSED, ENDED, BUFFERING } = window.YT.PlayerState;
    setIsPlaying(event.data === PLAYING);
    
    if (event.data === PLAYING) {
      setDuration(playerRef.current.getDuration());
    }
  };

  const handleError = (error: any) => {
    console.error('YouTube Player Error:', error);
    setIsReady(false);
  };

  const controls = {
    play: () => playerRef.current?.playVideo(),
    pause: () => playerRef.current?.pauseVideo(),
    seekTo: (time: number) => playerRef.current?.seekTo(time, true),
    setVolume: (value: number) => {
      if (playerRef.current) {
        playerRef.current.setVolume(value);
        setVolume(value);
      }
    },
    toggleMute: () => {
      if (playerRef.current) {
        if (isMuted) {
          playerRef.current.unMute();
          setIsMuted(false);
        } else {
          playerRef.current.mute();
          setIsMuted(true);
        }
      }
    },
  };

  useEffect(() => {
    if (!isReady) return;

    const interval = setInterval(() => {
      if (playerRef.current) {
        setCurrentTime(playerRef.current.getCurrentTime() || 0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isReady]);

  return {
    isReady,
    isPlaying,
    duration,
    currentTime,
    volume,
    isMuted,
    controls,
    reinitialize,
  };
}