interface AutoplayYouTubeProps {
  videoId: string;
  className?: string;
}

/**
 * YouTube Player with Autoplay, Mute, and Loop
 * Perfect for homepage hero sections
 */
export default function AutoplayYouTube({
  videoId,
  className = "",
}: AutoplayYouTubeProps) {
  if (!videoId) return null;

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden ${className}`}
    >
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1`}
        title="Inside Zona English"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
