import { useState } from 'react';
import { Clock, Eye, Share2, ExternalLink, Copy, Check, Play } from 'lucide-react';
import { VideoInfo } from '../types/video';
import { formatDuration, formatViewCount } from '../utils/youtube';
import { DownloadOptions } from './DownloadOptions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import toast from 'react-hot-toast';

interface VideoCardProps {
  video: VideoInfo;
  onPlay?: (video: VideoInfo) => void;
}

export function VideoCard({ video, onPlay }: VideoCardProps) {
  const [copied, setCopied] = useState(false);
  const videoUrl = `https://youtube.com/watch?v=${video.id}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(videoUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-2xl overflow-hidden card-hover group">
      {/* Thumbnail */}
      <div
        className={`relative overflow-hidden ${onPlay ? 'cursor-pointer' : ''}`}
        onClick={onPlay ? () => onPlay(video) : undefined}
      >
        <img
          src={video.thumbnails.high}
          alt={video.title}
          className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950/80 via-surface-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
        
        {/* Duration badge */}
        <span className="absolute bottom-3 right-3 bg-surface-950/80 backdrop-blur-sm text-white px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {formatDuration(video.duration)}
        </span>

        {/* Quality badge */}
        <Badge variant="default" className="absolute top-3 left-3 shadow-neon">
          HD
        </Badge>

        {/* Big center Play button (only when onPlay provided) */}
        {onPlay && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-full gradient-brand flex items-center justify-center shadow-neon-lg scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Top-right hover overlay actions */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Tooltip content="Open on YouTube">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-surface-950/70 backdrop-blur-sm border-0 hover:bg-surface-950/90"
              onClick={(e) => { e.stopPropagation(); window.open(videoUrl, '_blank'); }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </Tooltip>
          <Tooltip content={copied ? "Copied!" : "Copy link"}>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-surface-950/70 backdrop-blur-sm border-0 hover:bg-surface-950/90"
              onClick={(e) => { e.stopPropagation(); handleCopy(); }}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </Tooltip>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-[15px] text-surface-100 mb-3 line-clamp-2 leading-snug group-hover:text-white transition-colors">
          {video.title}
        </h3>
        
        <div className="flex items-center text-xs text-surface-400 mb-4 gap-3">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {formatViewCount(video.viewCount)} views
          </span>
          <span className="w-1 h-1 rounded-full bg-surface-600" />
          <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
        </div>
        
        {/* Channel row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-brand-500/20">
              {video.channelTitle.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-surface-300 font-medium">{video.channelTitle}</span>
          </div>
          <Tooltip content="Share">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ url: videoUrl });
                } else {
                  handleCopy();
                }
              }}
            >
              <Share2 size={15} />
            </Button>
          </Tooltip>
        </div>

        <Separator className="mb-4" />

        <DownloadOptions
          videoId={video.id}
          thumbnails={video.thumbnails}
          title={video.title}
          channel={video.channelTitle}
        />
      </div>
    </div>
  );
}