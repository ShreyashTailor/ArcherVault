import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  title: string;
}

export default function VideoPlayer({ url, title }: VideoPlayerProps) {
  if (!url) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div 
          className="aspect-video bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center"
          data-testid="video-player"
        >
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <AlertCircle className="w-12 h-12" />
            <p className="text-sm">No video available</p>
          </div>
        </div>
      </Card>
    );
  }

  const getVideoType = (filename: string): string => {
    const ext = filename.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm)$/)?.[1];
    const mimeTypes: Record<string, string> = {
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'mkv': 'video/x-matroska',
      'webm': 'video/webm',
    };
    return mimeTypes[ext || ''] || 'video/mp4';
  };

  const videoSrc = url;
  const videoType = getVideoType(url);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div 
        className="aspect-video bg-black rounded-lg overflow-hidden"
        data-testid="video-player"
      >
        <video
          className="w-full h-full"
          controls
          controlsList="nodownload"
          disablePictureInPicture
          preload="metadata"
        >
          <source src={videoSrc} type={videoType} />
          Your browser does not support the video tag.
        </video>
      </div>
    </Card>
  );
}
