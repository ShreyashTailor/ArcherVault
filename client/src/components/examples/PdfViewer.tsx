import PdfViewer from '../PdfViewer';

export default function PdfViewerExample() {
  return (
    <div className="p-6 max-w-4xl">
      <PdfViewer
        url="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        title="Algebra Fundamentals"
      />
    </div>
  );
}
