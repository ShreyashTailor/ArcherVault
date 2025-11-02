import QuizQuestion from '../QuizQuestion';

export default function QuizQuestionExample() {
  return (
    <div className="p-6 max-w-2xl space-y-6">
      <QuizQuestion
        question="What is the value of x in the equation 2x + 5 = 15?"
        options={["x = 5", "x = 10", "x = 7.5", "x = 2.5"]}
        onAnswer={(answer) => console.log('Answer:', answer)}
      />
    </div>
  );
}
