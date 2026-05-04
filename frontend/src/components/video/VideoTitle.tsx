interface VideoTitleProps {
  title: string;
}

export function VideoTitle({ title }: VideoTitleProps) {
  return (
    <h2 className="text-xl font-bold text-surface-100 line-clamp-2 leading-snug">
      {title}
    </h2>
  );
}