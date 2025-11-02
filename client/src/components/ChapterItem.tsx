import { Card } from "@/components/ui/card";
import { FileText, Video, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChapterItemProps {
  id: string;
  name: string;
  hasVideo: boolean;
  hasPdf: boolean;
  hasQuiz: boolean;
  onClick: () => void;
}

export default function ChapterItem({ name, hasVideo, hasPdf, hasQuiz, onClick }: ChapterItemProps) {
  return (
    <Card 
      className="p-4 hover-elevate active-elevate-2 cursor-pointer transition-all duration-200"
      onClick={onClick}
      data-testid={`card-chapter-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-base font-medium text-foreground flex-1">{name}</h4>
        <div className="flex items-center gap-2">
          {hasVideo && (
            <Badge variant="secondary" className="gap-1">
              <Video className="w-3 h-3" />
              <span className="text-xs">Video</span>
            </Badge>
          )}
          {hasPdf && (
            <Badge variant="secondary" className="gap-1">
              <FileText className="w-3 h-3" />
              <span className="text-xs">PDF</span>
            </Badge>
          )}
          {hasQuiz && (
            <Badge variant="secondary" className="gap-1">
              <HelpCircle className="w-3 h-3" />
              <span className="text-xs">Quiz</span>
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
