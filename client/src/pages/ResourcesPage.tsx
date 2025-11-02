import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, FileText, StickyNote, ExternalLink, Eye } from "lucide-react";
import PdfViewer from "@/components/PdfViewer";
import type { Resource } from "@shared/schema";

interface ResourcesPageProps {
  onBack: () => void;
}

export default function ResourcesPage({ onBack }: ResourcesPageProps) {
  const [viewingPdf, setViewingPdf] = useState<Resource | null>(null);
  
  const { data: resources = [], isLoading } = useQuery<Resource[]>({
    queryKey: ['/api/resources'],
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'book':
        return <BookOpen className="w-5 h-5" />;
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      case 'note':
        return <StickyNote className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getResourceTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const groupedResources = resources.reduce((acc, resource) => {
    const category = resource.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(resource);
    return acc;
  }, {} as Record<string, Resource[]>);

  const handleResourceClick = (resource: Resource) => {
    if (resource.type === 'pdf') {
      setViewingPdf(resource);
    } else {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleBackFromPdf = () => {
    setViewingPdf(null);
  };

  if (viewingPdf) {
    return (
      <div className="min-h-screen bg-background">
        <header className="backdrop-blur-xl bg-white/80 dark:bg-black/40 border-b border-border sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackFromPdf}
              data-testid="button-back-from-pdf"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">{viewingPdf.title}</h1>
              <p className="text-sm text-muted-foreground">PDF Viewer</p>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">
          <PdfViewer url={viewingPdf.url} title={viewingPdf.title} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="backdrop-blur-xl bg-white/80 dark:bg-black/40 border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Resources</h1>
            <p className="text-sm text-muted-foreground">Books, PDFs, and Study Notes</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading resources...</div>
        ) : resources.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">No resources available yet</div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedResources).map(([category, categoryResources]) => (
              <div key={category}>
                <h2 className="text-xl font-semibold mb-4">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryResources.map((resource) => (
                    <Card 
                      key={resource.id} 
                      className="hover-elevate active-elevate-2 transition-all"
                      data-testid={`card-resource-${resource.id}`}
                    >
                      <CardHeader className="gap-1 space-y-0 pb-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            {getResourceIcon(resource.type)}
                          </div>
                          <Badge variant="secondary" data-testid={`badge-type-${resource.id}`}>
                            {getResourceTypeLabel(resource.type)}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {resource.description && (
                          <CardDescription className="text-sm line-clamp-3">
                            {resource.description}
                          </CardDescription>
                        )}
                        <Button 
                          className="w-full" 
                          variant="default"
                          onClick={() => handleResourceClick(resource)}
                          data-testid={`button-view-${resource.id}`}
                        >
                          {resource.type === 'pdf' ? (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              View PDF
                            </>
                          ) : (
                            <>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Resource
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
