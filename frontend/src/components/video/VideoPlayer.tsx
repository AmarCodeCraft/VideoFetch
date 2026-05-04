import { VideoTitle } from './VideoTitle';
import { VideoEmbed } from './VideoEmbed';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

interface VideoPlayerProps {
  videoId: string;
  title: string;
}

export function VideoPlayer({ videoId, title }: VideoPlayerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <VideoTitle title={title} />
        <Tooltip content="Open on YouTube">
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={() => window.open(`https://youtube.com/watch?v=${videoId}`, '_blank')}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">YouTube</span>
          </Button>
        </Tooltip>
      </div>
      <VideoEmbed videoId={videoId} />
    </div>
  );
}