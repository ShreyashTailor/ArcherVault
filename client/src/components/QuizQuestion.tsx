import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface QuizQuestionProps {
  questionId: string;
  question: string;
  options: string[];
  imageUrl?: string;
}

interface SubmitResponse {
  correct: boolean;
  correctAnswer: string;
}

export default function QuizQuestion({ questionId, question, options, imageUrl }: QuizQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [result, setResult] = useState<{ correct: boolean; correctAnswer: string } | null>(null);

  const submitMutation = useMutation({
    mutationFn: async (answer: string) => {
      const res = await apiRequest('POST', `/api/questions/${questionId}/submit`, { answer });
      return await res.json() as SubmitResponse;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleSubmit = () => {
    if (selectedOption && !result) {
      submitMutation.mutate(selectedOption);
    }
  };

  const getOptionStyle = (option: string) => {
    if (!result) return "flex items-center space-x-3 p-3 rounded-lg hover-elevate border border-border";
    
    if (option === result.correctAnswer) {
      return "flex items-center space-x-3 p-3 rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-950/20";
    }
    
    if (option === selectedOption && !result.correct) {
      return "flex items-center space-x-3 p-3 rounded-lg border-2 border-red-500 bg-red-50 dark:bg-red-950/20";
    }
    
    return "flex items-center space-x-3 p-3 rounded-lg border border-border opacity-50";
  };

  return (
    <Card className="p-6" data-testid="quiz-question">
      <h3 className="text-lg font-semibold mb-4">{question}</h3>
      
      {imageUrl && (
        <div className="mb-6 rounded-lg overflow-hidden border border-border">
          <img 
            src={imageUrl} 
            alt="Question illustration" 
            className="w-full max-h-64 object-contain bg-muted/30"
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      )}

      <RadioGroup 
        value={selectedOption} 
        onValueChange={setSelectedOption} 
        className="space-y-3"
        disabled={!!result}
      >
        {options.map((option, index) => (
          <div 
            key={index} 
            className={getOptionStyle(option)}
            data-testid={`option-${index}`}
          >
            <RadioGroupItem value={option} id={`option-${index}`} disabled={!!result} />
            <Label 
              htmlFor={`option-${index}`} 
              className="flex-1 cursor-pointer font-normal flex items-center justify-between"
            >
              <span>{option}</span>
              {result && option === result.correctAnswer && (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
              {result && option === selectedOption && !result.correct && (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {result && (
        <div className={`mt-4 p-4 rounded-lg ${result.correct ? 'bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200'}`}>
          <div className="flex items-center gap-2">
            {result.correct ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Correct!</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                <span className="font-semibold">Incorrect. The correct answer is: {result.correctAnswer}</span>
              </>
            )}
          </div>
        </div>
      )}

      <Button 
        onClick={handleSubmit} 
        disabled={!selectedOption || !!result || submitMutation.isPending}
        className="w-full mt-6"
        data-testid="button-submit-answer"
      >
        {submitMutation.isPending ? "Submitting..." : result ? "Answered" : "Submit Answer"}
      </Button>
    </Card>
  );
}
