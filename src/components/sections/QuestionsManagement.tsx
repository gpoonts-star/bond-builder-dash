import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, Clock } from 'lucide-react';
import { supabase, Question } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export function QuestionsManagement() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    content: '',
    scheduled_time: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch questions",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingQuestion) {
        const { error } = await supabase
          .from('questions')
          .update({
            content: formData.content,
            scheduled_time: formData.scheduled_time || '08:00:00',
          })
          .eq('id', editingQuestion.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Question updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('questions')
          .insert({
            content: formData.content,
            scheduled_time: formData.scheduled_time || '08:00:00',
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Question created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingQuestion(null);
      setFormData({ content: '', scheduled_time: '' });
      fetchQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save question",
      });
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      content: question.content,
      scheduled_time: question.scheduled_time,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete question",
      });
    }
  };

  const filteredQuestions = questions.filter(question =>
    question.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading questions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Questions</h1>
          <p className="text-muted-foreground">Manage pre-defined questions for daily use</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingQuestion(null);
              setFormData({ content: '', scheduled_time: '08:00' });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questions ({questions.length})</CardTitle>
          <CardDescription>All pre-defined questions available for scheduling</CardDescription>
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
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Scheduled Time</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="font-medium max-w-md">
                    {question.content}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {question.scheduled_time}
                    </div>
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
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
            <DialogDescription>
              {editingQuestion ? 'Update question content and schedule.' : 'Create a new question for daily scheduling.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="content">Question Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="What question would you like to ask couples?"
                  rows={3}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="scheduled_time">Default Scheduled Time</Label>
                <Input
                  id="scheduled_time"
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
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