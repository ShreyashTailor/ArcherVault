import { Card } from "@/components/ui/card";
import { BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubjectCardProps {
  id: string;
  name: string;
  chapterCount: number;
  onClick: () => void;
}

export default function SubjectCard({ name, chapterCount, onClick }: SubjectCardProps) {
  return (
    <Card 
      className="p-6 hover-elevate active-elevate-2 cursor-pointer transition-all duration-200"
      onClick={onClick}
      data-testid={`card-subject-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-1">{name}</h3>
            <p className="text-sm text-muted-foreground">
              {chapterCount} {chapterCount === 1 ? 'chapter' : 'chapters'}
            </p>
          </div>
        </div>
        <Button size="icon" variant="ghost" className="flex-shrink-0">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </Card>
  );
}
