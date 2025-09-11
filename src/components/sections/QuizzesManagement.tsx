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
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { supabase, Quiz, QuizTheme } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ImageUploader } from '@/components/ImageUploader';

interface QuizWithTheme extends Quiz {
  quiz_themes: QuizTheme;
}

export function QuizzesManagement() {
  const [quizzes, setQuizzes] = useState<QuizWithTheme[]>([]);
  const [themes, setThemes] = useState<QuizTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizWithTheme | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme_id: '',
    image: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchQuizzes();
    fetchThemes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          quiz_themes (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch quizzes",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchThemes = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_themes')
        .select('*')
        .order('name');

      if (error) throw error;
      setThemes(data || []);
    } catch (error) {
      console.error('Error fetching themes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingQuiz) {
        const { error } = await supabase
          .from('quizzes')
          .update({
            title: formData.title,
            description: formData.description || null,
            theme_id: formData.theme_id,
            image: formData.image || null,
          })
          .eq('id', editingQuiz.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Quiz updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('quizzes')
          .insert({
            title: formData.title,
            description: formData.description || null,
            theme_id: formData.theme_id,
            image: formData.image || null,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Quiz created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingQuiz(null);
      setFormData({ title: '', description: '', theme_id: '', image: '' });
      fetchQuizzes();
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save quiz",
      });
    }
  };

  const handleEdit = (quiz: QuizWithTheme) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description || '',
      theme_id: quiz.theme_id,
      image: quiz.image || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      // Check for related quiz questions first
      const { data: questions } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('quiz_id', quizId)
        .limit(1);

      if (questions && questions.length > 0) {
        toast({
          title: "Cannot Delete Quiz",
          description: "This quiz has questions and cannot be deleted. Please remove all questions first.",
          variant: "destructive"
        });
        return;
      }

      // Check for quiz answers
      const { data: answers } = await supabase
        .from('quiz_answers')
        .select('id')
        .eq('quiz_id', quizId)
        .limit(1);

      if (answers && answers.length > 0) {
        toast({
          title: "Cannot Delete Quiz",
          description: "This quiz has user responses and cannot be deleted to preserve data integrity.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });
      fetchQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete quiz. It might be referenced by other records.",
      });
    }
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    quiz.quiz_themes.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading quizzes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
          <p className="text-muted-foreground">Manage quizzes and their content</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingQuiz(null);
              setFormData({ title: '', description: '', theme_id: '', image: '' });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Quiz
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quizzes ({quizzes.length})</CardTitle>
          <CardDescription>All quizzes in your app</CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Theme</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{quiz.quiz_themes.name}</Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {quiz.description || '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(quiz.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(quiz)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(quiz.id)}>
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingQuiz ? 'Edit Quiz' : 'Add New Quiz'}
            </DialogTitle>
            <DialogDescription>
              {editingQuiz ? 'Update quiz information.' : 'Create a new quiz.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={formData.theme_id}
                  onValueChange={(value) => setFormData({ ...formData, theme_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Quiz Image</Label>
                <ImageUploader
                  onImageUpload={(url) => setFormData({ ...formData, image: url })}
                  currentImage={formData.image}
                  placeholder="Upload quiz image"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}