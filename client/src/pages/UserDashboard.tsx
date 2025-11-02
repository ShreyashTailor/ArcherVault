import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import SubjectCard from "@/components/SubjectCard";
import { LogOut, BookOpen, Home } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Subject } from "@shared/schema";

interface UserDashboardProps {
  onSubjectClick: (subjectId: string, subjectName: string) => void;
  onResourcesClick: () => void;
  onLogout: () => void;
  onHome?: () => void;
}

export default function UserDashboard({ onSubjectClick, onResourcesClick, onLogout, onHome }: UserDashboardProps) {
  const { data: subjects = [], isLoading } = useQuery<Subject[]>({
    queryKey: ['/api/subjects'],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="backdrop-blur-xl bg-white/80 dark:bg-black/40 border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-semibold">Archer</h1>
            <p className="text-sm text-muted-foreground">Learning Platform</p>
          </div>
          <div className="flex items-center gap-2">
            {onHome && (
              <Button variant="ghost" onClick={onHome} data-testid="button-home">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            )}
            <Button variant="ghost" onClick={onResourcesClick} data-testid="button-resources">
              <BookOpen className="w-4 h-4 mr-2" />
              Resources
            </Button>
            <Button variant="ghost" onClick={onLogout} data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold mb-2">My Subjects</h2>
          <p className="text-muted-foreground">Select a subject to access chapters and content</p>
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading subjects...</div>
        ) : subjects.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">No subjects available yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                id={subject.id}
                name={subject.name}
                chapterCount={subject.chapterCount || 0}
                onClick={() => onSubjectClick(subject.id, subject.name)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
