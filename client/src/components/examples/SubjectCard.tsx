import SubjectCard from '../SubjectCard';

export default function SubjectCardExample() {
  return (
    <div className="p-6 max-w-md">
      <SubjectCard
        id="1"
        name="Mathematics"
        chapterCount={12}
        onClick={() => console.log('Subject clicked')}
      />
    </div>
  );
}
