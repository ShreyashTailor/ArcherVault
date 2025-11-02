import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Subject, Chapter, Content } from "@shared/schema";

export default function SubjectManagement() {
  const { toast } = useToast();
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddChapter, setShowAddChapter] = useState<string | null>(null);
  const [showAddContent, setShowAddContent] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newChapterName, setNewChapterName] = useState("");
  const [contentType, setContentType] = useState<'video' | 'quiz'>('video');
  const [contentTitle, setContentTitle] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [questions, setQuestions] = useState<Array<{ id?: string; question: string; options: string[]; correctAnswer: number; imageUrl?: string }>>([]);

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['/api/admin/subjects'],
  });

  const createSubjectMutation = useMutation({
    mutationFn: async (name: string) => {
      await apiRequest('POST', '/api/admin/subjects', { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subjects'] });
      setShowAddSubject(false);
      setNewSubjectName("");
      toast({ title: "Subject created successfully" });
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/subjects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subjects'] });
      toast({ title: "Subject deleted successfully" });
    },
  });

  const createChapterMutation = useMutation({
    mutationFn: async (data: { subjectId: string; name: string }) => {
      await apiRequest('POST', '/api/admin/chapters', { ...data, orderIndex: 0 });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subjects', variables.subjectId, 'chapters'] });
      setShowAddChapter(null);
      setNewChapterName("");
      toast({ title: "Chapter created successfully" });
    },
  });

  const deleteChapterMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/chapters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subjects'] });
      toast({ title: "Chapter deleted successfully" });
    },
  });

  const createContentMutation = useMutation({
    mutationFn: async (data: { chapterId: string; type: string; title: string; url?: string }) => {
      const content = await apiRequest('POST', '/api/admin/content', { 
        chapterId: data.chapterId,
        type: data.type,
        title: data.title,
        url: data.url,
        orderIndex: 0 
      });
      return content.json();
    },
    onSuccess: async (contentData, variables) => {
      if (variables.type === 'quiz' && questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
          await apiRequest('POST', '/api/admin/questions', {
            contentId: contentData.id,
            question: questions[i].question,
            options: JSON.stringify(questions[i].options),
            correctAnswer: questions[i].correctAnswer,
            imageUrl: questions[i].imageUrl || undefined,
            orderIndex: i,
          });
        }
      }
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chapters', variables.chapterId, 'content'] });
      setShowAddContent(null);
      setContentTitle("");
      setContentUrl("");
      setQuestions([]);
      toast({ title: "Content created successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create content", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: async (data: { id: string; chapterId: string; type: string; title: string; url?: string }) => {
      const content = await apiRequest('PUT', `/api/admin/content/${data.id}`, { 
        title: data.title, 
        url: data.url 
      });
      return { contentData: await content.json(), chapterId: data.chapterId, type: data.type };
    },
    onSuccess: async ({ contentData, chapterId, type }) => {
      if (type === 'quiz') {
        const existingResponse = await fetch(`/api/admin/content/${contentData.id}/questions`, { credentials: 'include' });
        const existingQuestions = await existingResponse.json();
        const existingIds = new Set(existingQuestions.map((q: any) => q.id));
        
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          if (q.id && existingIds.has(q.id)) {
            await apiRequest('PUT', `/api/admin/questions/${q.id}`, {
              question: q.question,
              options: JSON.stringify(q.options),
              correctAnswer: q.correctAnswer,
              imageUrl: q.imageUrl || undefined,
              orderIndex: i,
            });
            existingIds.delete(q.id);
          } else {
            await apiRequest('POST', '/api/admin/questions', {
              contentId: contentData.id,
              question: q.question,
              options: JSON.stringify(q.options),
              correctAnswer: q.correctAnswer,
              imageUrl: q.imageUrl || undefined,
              orderIndex: i,
            });
          }
        }
        
        for (const id of Array.from(existingIds)) {
          await apiRequest('DELETE', `/api/admin/questions/${id}`);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chapters', chapterId, 'content'] });
      setEditingContent(null);
      setContentTitle("");
      setContentUrl("");
      setQuestions([]);
      toast({ title: "Content updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update content", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/content/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chapters'] });
      toast({ title: "Content deleted successfully" });
    },
  });

  const toggleSubject = (id: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSubjects(newExpanded);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    if (field === 'question' || field === 'imageUrl' || field === 'correctAnswer') {
      updated[index] = { ...updated[index], [field]: value };
    }
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const removeEmptyOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options.length > 3) {
      updated[qIndex].options.splice(optIndex, 1);
      if (updated[qIndex].correctAnswer >= updated[qIndex].options.length) {
        updated[qIndex].correctAnswer = updated[qIndex].options.length - 1;
      } else if (updated[qIndex].correctAnswer === optIndex) {
        updated[qIndex].correctAnswer = 0;
      } else if (updated[qIndex].correctAnswer > optIndex) {
        updated[qIndex].correctAnswer--;
      }
      setQuestions(updated);
    }
  };

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const startEditContent = async (content: Content) => {
    setEditingContent(content.id);
    setContentType(content.type);
    setContentTitle(content.title);
    setContentUrl(content.url || "");
    
    if (content.type === 'quiz') {
      const response = await fetch(`/api/admin/content/${content.id}/questions`, { credentials: 'include' });
      const existingQuestions = await response.json();
      setQuestions(existingQuestions.map((q: any) => ({
        id: q.id,
        question: q.question,
        options: JSON.parse(q.options),
        correctAnswer: q.correctAnswer,
        imageUrl: q.imageUrl || undefined,
      })));
    } else {
      setQuestions([]);
    }
  };

  const cancelEdit = () => {
    setEditingContent(null);
    setShowAddContent(null);
    setContentTitle("");
    setContentUrl("");
    setQuestions([]);
    setContentType('video');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Subject Management</h2>
        <Button onClick={() => setShowAddSubject(!showAddSubject)} data-testid="button-add-subject">
          <Plus className="w-4 h-4 mr-2" />
          Add Subject
        </Button>
      </div>

      {showAddSubject && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add New Subject</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subjectName">Subject Name</Label>
              <Input
                id="subjectName"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="e.g., Mathematics, Physics"
                data-testid="input-subject-name"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => createSubjectMutation.mutate(newSubjectName)} 
                disabled={!newSubjectName || createSubjectMutation.isPending}
                data-testid="button-save-subject"
              >
                Add Subject
              </Button>
              <Button variant="outline" onClick={() => setShowAddSubject(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {subjects.map((subject) => (
          <SubjectItem
            key={subject.id}
            subject={subject}
            isExpanded={expandedSubjects.has(subject.id)}
            onToggle={() => toggleSubject(subject.id)}
            onDelete={() => deleteSubjectMutation.mutate(subject.id)}
            showAddChapter={showAddChapter === subject.id}
            onShowAddChapter={() => setShowAddChapter(subject.id)}
            onHideAddChapter={() => setShowAddChapter(null)}
            newChapterName={newChapterName}
            setNewChapterName={setNewChapterName}
            createChapter={(name: string) => createChapterMutation.mutate({ subjectId: subject.id, name })}
            showAddContent={showAddContent}
            onShowAddContent={setShowAddContent}
            onHideAddContent={cancelEdit}
            editingContent={editingContent}
            startEditContent={startEditContent}
            contentType={contentType}
            setContentType={setContentType}
            contentTitle={contentTitle}
            setContentTitle={setContentTitle}
            contentUrl={contentUrl}
            setContentUrl={setContentUrl}
            questions={questions}
            addQuestion={addQuestion}
            updateQuestion={updateQuestion}
            updateOption={updateOption}
            removeEmptyOption={removeEmptyOption}
            removeQuestion={removeQuestion}
            createContent={(chapterId: string) => createContentMutation.mutate({ chapterId, type: contentType, title: contentTitle, url: contentUrl })}
            updateContent={(contentId: string, chapterId: string) => updateContentMutation.mutate({ id: contentId, chapterId, type: contentType, title: contentTitle, url: contentUrl })}
            deleteChapter={(id: string) => deleteChapterMutation.mutate(id)}
            deleteContent={(id: string) => deleteContentMutation.mutate(id)}
          />
        ))}
      </div>
    </div>
  );
}

function SubjectItem({ subject, isExpanded, onToggle, onDelete, showAddChapter, onShowAddChapter, onHideAddChapter, newChapterName, setNewChapterName, createChapter, showAddContent, onShowAddContent, onHideAddContent, editingContent, startEditContent, contentType, setContentType, contentTitle, setContentTitle, contentUrl, setContentUrl, questions, addQuestion, updateQuestion, updateOption, removeEmptyOption, removeQuestion, createContent, updateContent, deleteChapter, deleteContent }: any) {
  const { data: chapters = [] } = useQuery<Chapter[]>({
    queryKey: ['/api/admin/subjects', subject.id, 'chapters'],
    queryFn: async () => {
      const response = await fetch(`/api/admin/subjects/${subject.id}/chapters`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch chapters');
      return response.json();
    },
    enabled: isExpanded,
  });

  return (
    <Card className="overflow-hidden">
      <div className="p-4 flex items-center justify-between cursor-pointer hover-elevate" onClick={onToggle} data-testid={`subject-${subject.id}`}>
        <div className="flex items-center gap-3">
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          <h3 className="text-lg font-semibold">{subject.name}</h3>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={(e) => { e.stopPropagation(); onShowAddChapter(); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Chapter
          </Button>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border p-4 bg-muted/30 space-y-3">
          {showAddChapter && (
            <Card className="p-4 bg-background">
              <h4 className="font-medium mb-3">Add Chapter</h4>
              <div className="flex gap-3">
                <Input
                  value={newChapterName}
                  onChange={(e) => setNewChapterName(e.target.value)}
                  placeholder="Chapter name"
                />
                <Button onClick={() => createChapter(newChapterName)}>Add</Button>
                <Button variant="outline" onClick={onHideAddChapter}>Cancel</Button>
              </div>
            </Card>
          )}

          {chapters.map((chapter) => (
            <ChapterItem
              key={chapter.id}
              chapter={chapter}
              showAddContent={showAddContent === chapter.id}
              onShowAddContent={() => onShowAddContent(chapter.id)}
              onHideAddContent={onHideAddContent}
              editingContent={editingContent}
              startEditContent={startEditContent}
              contentType={contentType}
              setContentType={setContentType}
              contentTitle={contentTitle}
              setContentTitle={setContentTitle}
              contentUrl={contentUrl}
              setContentUrl={setContentUrl}
              questions={questions}
              addQuestion={addQuestion}
              updateQuestion={updateQuestion}
              updateOption={updateOption}
              removeEmptyOption={removeEmptyOption}
              removeQuestion={removeQuestion}
              createContent={() => createContent(chapter.id)}
              updateContent={(contentId: string) => updateContent(contentId, chapter.id)}
              deleteChapter={() => deleteChapter(chapter.id)}
              deleteContent={deleteContent}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

function ChapterItem({ chapter, showAddContent, onShowAddContent, onHideAddContent, editingContent, startEditContent, contentType, setContentType, contentTitle, setContentTitle, contentUrl, setContentUrl, questions, addQuestion, updateQuestion, updateOption, removeEmptyOption, removeQuestion, createContent, updateContent, deleteChapter, deleteContent }: any) {
  const { toast } = useToast();
  const { data: content = [] } = useQuery<Content[]>({
    queryKey: ['/api/admin/chapters', chapter.id, 'content'],
    queryFn: async () => {
      const response = await fetch(`/api/admin/chapters/${chapter.id}/content`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch content');
      return response.json();
    },
  });

  return (
    <div className="bg-background rounded-lg p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">{chapter.name}</h4>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onShowAddContent}>Add Content</Button>
          <Button size="sm" variant="ghost" onClick={deleteChapter}><Trash2 className="w-4 h-4" /></Button>
        </div>
      </div>

      {(showAddContent || editingContent) && (
        <Card className="p-4 mb-3 bg-muted/30">
          <h5 className="font-medium mb-3">{editingContent ? 'Edit Content' : 'Add Content'}</h5>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select value={contentType} onValueChange={(v: any) => setContentType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Lecture</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={contentTitle} onChange={(e) => setContentTitle(e.target.value)} placeholder="Content title" />
            </div>
            {contentType === 'video' && (
              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input 
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  data-testid="input-video-url"
                />
                <p className="text-xs text-muted-foreground">Enter a direct link to an MP4 video file</p>
              </div>
            )}
            {contentType === 'quiz' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Questions</Label>
                  <Button size="sm" variant="outline" onClick={addQuestion} data-testid="button-add-question">
                    <Plus className="w-3 h-3 mr-1" />
                    Add Question
                  </Button>
                </div>
                {questions.map((q: any, qIdx: number) => (
                  <Card key={qIdx} className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Question {qIdx + 1}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeQuestion(qIdx)}
                        data-testid={`button-remove-question-${qIdx}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <Input 
                      value={q.question} 
                      onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)} 
                      placeholder="Question text" 
                      className="mb-2"
                      data-testid={`input-question-${qIdx}`}
                    />
                    <Input 
                      value={q.imageUrl || ''} 
                      onChange={(e) => updateQuestion(qIdx, 'imageUrl', e.target.value)} 
                      placeholder="Image URL (optional)" 
                      className="mb-2"
                      data-testid={`input-image-url-${qIdx}`}
                    />
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Options (Select the correct answer)</Label>
                      <RadioGroup 
                        value={q.correctAnswer.toString()} 
                        onValueChange={(value) => updateQuestion(qIdx, 'correctAnswer', parseInt(value))}
                      >
                        {q.options.map((opt: string, optIdx: number) => (
                          <div key={optIdx} className="flex gap-2 items-center">
                            <RadioGroupItem 
                              value={optIdx.toString()} 
                              id={`q${qIdx}-opt${optIdx}`}
                              data-testid={`radio-correct-${qIdx}-${optIdx}`}
                            />
                            <Input 
                              value={opt} 
                              onChange={(e) => updateOption(qIdx, optIdx, e.target.value)} 
                              placeholder={`Option ${optIdx + 1}`}
                              data-testid={`input-option-${qIdx}-${optIdx}`}
                              className="flex-1"
                            />
                            {q.options.length > 3 && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => removeEmptyOption(qIdx, optIdx)}
                                data-testid={`button-remove-option-${qIdx}-${optIdx}`}
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  if (contentType === 'video' && !contentUrl.trim()) {
                    toast({ 
                      title: "Validation Error", 
                      description: "Please enter a video URL.",
                      variant: "destructive" 
                    });
                    return;
                  }
                  if (contentType === 'quiz') {
                    const hasEmptyFields = questions.some((q: any) => 
                      !q.question.trim() || q.options.some((opt: string) => !opt.trim())
                    );
                    if (hasEmptyFields) {
                      toast({ 
                        title: "Validation Error", 
                        description: "Please fill in all question texts and options before saving.",
                        variant: "destructive" 
                      });
                      return;
                    }
                    if (questions.length === 0) {
                      toast({ 
                        title: "Validation Error", 
                        description: "Please add at least one question for the quiz.",
                        variant: "destructive" 
                      });
                      return;
                    }
                  }
                  if (editingContent) {
                    updateContent(editingContent);
                  } else {
                    createContent();
                  }
                }}
                data-testid="button-save-content"
              >
                Save
              </Button>
              <Button variant="outline" onClick={onHideAddContent} data-testid="button-cancel-content">Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {content.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-2 rounded hover-elevate">
            <span className="text-sm">{item.title} <span className="text-muted-foreground text-xs">({item.type})</span></span>
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => startEditContent(item)}
                data-testid={`button-edit-content-${item.id}`}
              >
                Edit
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => deleteContent(item.id)}
                data-testid={`button-delete-content-${item.id}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
