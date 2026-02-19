import { useState } from "react";
import { Play } from "lucide-react";

interface YouTubePlayerProps {
  url: string;
  title?: string;
  className?: string;
}

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

/**
 * Get YouTube thumbnail URL from video URL
 */
const getYouTubeThumbnail = (
  url: string,
  quality: "default" | "hqdefault" | "maxresdefault" = "hqdefault"
): string => {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/${quality}.jpg` : "";
};

/**
 * YouTubePlayer Component
 * Displays YouTube video with thumbnail preview and plays video on click
 */
export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  url,
  title = "YouTube Video",
  className = "",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 text-slate-500 ${className}`}
      >
        Invalid YouTube URL
      </div>
    );
  }

  if (isPlaying) {
    return (
      <div className={className}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative cursor-pointer group ${className}`}
      onClick={() => setIsPlaying(true)}
    >
      <img
        src={getYouTubeThumbnail(url, "hqdefault")}
        alt={title}
        loading="lazy"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all flex items-center justify-center">
        <div className="bg-red-600 rounded-full p-4 group-hover:scale-110 transition-transform shadow-lg">
          <Play className="h-8 w-8 text-white fill-white" />
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayer;
