import ChapterItem from '../ChapterItem';

export default function ChapterItemExample() {
  return (
    <div className="p-6 max-w-2xl space-y-3">
      <ChapterItem
        id="1"
        name="Introduction to Algebra"
        hasVideo={true}
        hasPdf={true}
        hasQuiz={true}
        onClick={() => console.log('Chapter clicked')}
      />
      <ChapterItem
        id="2"
        name="Linear Equations"
        hasVideo={true}
        hasPdf={false}
        hasQuiz={true}
        onClick={() => console.log('Chapter clicked')}
      />
    </div>
  );
}
