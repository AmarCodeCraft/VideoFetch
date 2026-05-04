interface VideoEmbedProps {
  videoId: string;
}

export function VideoEmbed({ videoId }: VideoEmbedProps) {
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&origin=${window.location.origin}`;

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/20 via-brand-400/10 to-brand-500/20 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative aspect-video bg-surface-950 rounded-2xl overflow-hidden shadow-glass-lg ring-1 ring-white/5">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin"
        />
      </div>
    </div>
  );
}