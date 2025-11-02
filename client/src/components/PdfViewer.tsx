import { Card } from "@/components/ui/card";
import { FileText, AlertCircle } from "lucide-react";

interface PdfViewerProps {
  url: string;
  title: string;
}

export default function PdfViewer({ url, title }: PdfViewerProps) {
  if (!url) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div 
          className="h-[600px] bg-muted/30 rounded-lg overflow-hidden border border-border flex items-center justify-center"
          data-testid="pdf-viewer"
        >
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <AlertCircle className="w-12 h-12" />
            <p className="text-sm">No PDF available</p>
          </div>
        </div>
      </Card>
    );
  }

  const pdfSrc = url;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div 
        className="h-[600px] bg-muted/30 rounded-lg overflow-hidden border border-border"
        data-testid="pdf-viewer"
      >
        <iframe
          src={pdfSrc}
          className="w-full h-full border-0"
          title={title}
        />
      </div>
    </Card>
  );
}
