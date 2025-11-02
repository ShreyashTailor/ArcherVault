import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import ChapterItem from "@/components/ChapterItem";
import VideoPlayer from "@/components/VideoPlayer";
import PdfViewer from "@/components/PdfViewer";
import QuizQuestion from "@/components/QuizQuestion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Chapter, Content, QuizQuestion as QuizQuestionType } from "@shared/schema";

interface ParsedQuizQuestion extends Omit<QuizQuestionType, 'options'> {
  options: string[];
}

interface ChapterContentProps {
  subjectId: string;
  subjectName: string;
  onBack: () => void;
  onHome?: () => void;
}

export default function ChapterContent({ subjectId, subjectName, onBack, onHome }: ChapterContentProps) {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  const { data: chapters = [] } = useQuery<Chapter[]>({
    queryKey: ['/api/subjects', subjectId, 'chapters'],
    queryFn: async () => {
      const response = await fetch(`/api/subjects/${subjectId}/chapters`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch chapters');
      return response.json();
    },
  });

  const { data: content = [] } = useQuery<Content[]>({
    queryKey: ['/api/chapters', selectedChapterId, 'content'],
    enabled: !!selectedChapterId,
    queryFn: async () => {
      const response = await fetch(`/api/chapters/${selectedChapterId}/content`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch content');
      return response.json();
    },
  });

  const videoContent = content.find(c => c.type === 'video');
  const pdfContent = content.find(c => c.type === 'pdf');
  const quizContent = content.find(c => c.type === 'quiz');

  const { data: quizQuestions = [] } = useQuery<ParsedQuizQuestion[]>({
    queryKey: ['/api/content', quizContent?.id, 'questions'],
    enabled: !!quizContent,
    queryFn: async () => {
      const response = await fetch(`/api/content/${quizContent!.id}/questions`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch questions');
      return response.json();
    },
  });

  const selectedChapter = chapters.find(c => c.id === selectedChapterId);

  return (
    <div className="min-h-screen bg-background">
      <header className="backdrop-blur-xl bg-white/80 dark:bg-black/40 border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" onClick={onBack} data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Subjects
            </Button>
            <div className="flex items-center gap-2">
              {onHome && (
                <Button variant="ghost" onClick={onHome} data-testid="button-home">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              )}
              <ThemeToggle />
            </div>
          </div>
          <h1 className="text-2xl font-semibold">{subjectName}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!selectedChapterId ? (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Chapters</h2>
            {chapters.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">No chapters available yet</div>
            ) : (
              <div className="space-y-3">
                {chapters.map((chapter) => {
                  const chapterContent = content.filter(c => c.chapterId === chapter.id);
                  return (
                    <ChapterItem
                      key={chapter.id}
                      id={chapter.id}
                      name={chapter.name}
                      hasVideo={chapterContent.some(c => c.type === 'video')}
                      hasPdf={chapterContent.some(c => c.type === 'pdf')}
                      hasQuiz={chapterContent.some(c => c.type === 'quiz')}
                      onClick={() => setSelectedChapterId(chapter.id)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            <Button 
              variant="ghost" 
              onClick={() => setSelectedChapterId(null)} 
              className="mb-6"
              data-testid="button-back-to-chapters"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Chapters
            </Button>

            <h2 className="text-2xl font-semibold mb-6">
              {selectedChapter?.name}
            </h2>

            <Tabs defaultValue="video" className="w-full">
              <TabsList className="mb-6">
                {videoContent && <TabsTrigger value="video" data-testid="tab-video">Video Lecture</TabsTrigger>}
                {pdfContent && <TabsTrigger value="pdf" data-testid="tab-pdf">PDF Notes</TabsTrigger>}
                {quizContent && <TabsTrigger value="quiz" data-testid="tab-quiz">Quiz</TabsTrigger>}
              </TabsList>

              {videoContent && (
                <TabsContent value="video" className="space-y-6">
                  <VideoPlayer
                    url={videoContent.url || ''}
                    title={videoContent.title}
                  />
                </TabsContent>
              )}

              {pdfContent && (
                <TabsContent value="pdf" className="space-y-6">
                  <PdfViewer
                    url={pdfContent.url || ''}
                    title={pdfContent.title}
                  />
                </TabsContent>
              )}

              {quizContent && (
                <TabsContent value="quiz" className="space-y-6">
                  {quizQuestions.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">No quiz questions available</div>
                  ) : (
                    quizQuestions.map((question) => (
                      <QuizQuestion
                        key={question.id}
                        questionId={question.id}
                        question={question.question}
                        options={question.options}
                        imageUrl={question.imageUrl}
                      />
                    ))
                  )}
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}
