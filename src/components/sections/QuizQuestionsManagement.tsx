import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase, QuizQuestion, Quiz, QuizTheme } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface QuizQuestionWithDetails extends QuizQuestion {
  quizzes: Quiz & {
    quiz_themes: QuizTheme;
  };
}

export function QuizQuestionsManagement() {
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionWithDetails[]>([]);
  const [quizzes, setQuizzes] = useState<(Quiz & { quiz_themes: QuizTheme })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestionWithDetails | null>(null);
  const [formData, setFormData] = useState({
    content: '',
    quiz_id: '',
    ord: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchQuizQuestions();
    fetchQuizzes();
  }, []);

  const fetchQuizQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select(`
          *,
          quizzes (
            *,
            quiz_themes (*)
          )
        `)
        .order('ord', { ascending: true });

      if (error) throw error;
      setQuizQuestions(data || []);
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch quiz questions",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          quiz_themes (*)
        `)
        .order('title');

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingQuestion) {
        const { error } = await supabase
          .from('quiz_questions')
          .update({
            content: formData.content,
            quiz_id: formData.quiz_id,
            ord: formData.ord,
          })
          .eq('id', editingQuestion.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Quiz question updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('quiz_questions')
          .insert({
            content: formData.content,
            quiz_id: formData.quiz_id,
            ord: formData.ord,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Quiz question created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingQuestion(null);
      setFormData({ content: '', quiz_id: '', ord: 0 });
      fetchQuizQuestions();
    } catch (error) {
      console.error('Error saving quiz question:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save quiz question",
      });
    }
  };

  const handleEdit = (question: QuizQuestionWithDetails) => {
    setEditingQuestion(question);
    setFormData({
      content: question.content,
      quiz_id: question.quiz_id,
      ord: question.ord,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this quiz question?')) return;

    try {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quiz question deleted successfully",
      });
      fetchQuizQuestions();
    } catch (error) {
      console.error('Error deleting quiz question:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete quiz question",
      });
    }
  };

  const handleReorder = async (questionId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('quiz_questions')
        .update({ ord: newOrder })
        .eq('id', questionId);

      if (error) throw error;

      fetchQuizQuestions();
    } catch (error) {
      console.error('Error reordering question:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reorder question",
      });
    }
  };

  const filteredQuestions = quizQuestions.filter(question => {
    const matchesSearch = question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.quizzes.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.quizzes.quiz_themes.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesQuiz = selectedQuiz === 'all' || question.quiz_id === selectedQuiz;
    
    return matchesSearch && matchesQuiz;
  });

  if (loading) {
    return <div className="text-center py-8">Loading quiz questions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz Questions</h1>
          <p className="text-muted-foreground">Manage questions within quizzes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingQuestion(null);
              setFormData({ content: '', quiz_id: '', ord: 0 });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questions ({quizQuestions.length})</CardTitle>
          <CardDescription>All questions within quizzes</CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by quiz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quizzes</SelectItem>
                {quizzes.map((quiz) => (
                  <SelectItem key={quiz.id} value={quiz.id}>
                    {quiz.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Quiz</TableHead>
                <TableHead>Theme</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorder(question.id, question.ord - 1)}
                        disabled={question.ord === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {question.ord}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorder(question.id, question.ord + 1)}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-md">
                    {question.content}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{question.quizzes.title}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{question.quizzes.quiz_themes.name}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(question.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(question)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(question.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Edit Quiz Question' : 'Add New Quiz Question'}
            </DialogTitle>
            <DialogDescription>
              {editingQuestion ? 'Update quiz question content.' : 'Create a new question for a quiz.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="quiz">Quiz</Label>
                <Select
                  value={formData.quiz_id}
                  onValueChange={(value) => setFormData({ ...formData, quiz_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a quiz" />
                  </SelectTrigger>
                  <SelectContent>
                    {quizzes.map((quiz) => (
                      <SelectItem key={quiz.id} value={quiz.id}>
                        {quiz.title} ({quiz.quiz_themes.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Question Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter the quiz question..."
                  rows={3}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ord">Order</Label>
                <Input
                  id="ord"
                  type="number"
                  min="0"
                  value={formData.ord}
                  onChange={(e) => setFormData({ ...formData, ord: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingQuestion ? 'Update Question' : 'Create Question'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}