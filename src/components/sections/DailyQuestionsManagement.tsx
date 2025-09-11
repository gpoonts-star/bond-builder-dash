import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, Calendar, Users } from 'lucide-react';
import { supabase, DailyQuestion, Question, Couple, Profile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface DailyQuestionWithDetails extends DailyQuestion {
  questions: Question | null;
  couples: (Couple & {
    user1: Profile;
    user2: Profile | null;
  }) | null;
}

export function DailyQuestionsManagement() {
  const [dailyQuestions, setDailyQuestions] = useState<DailyQuestionWithDetails[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [couples, setCouples] = useState<(Couple & { user1: Profile; user2: Profile | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDailyQuestion, setEditingDailyQuestion] = useState<DailyQuestionWithDetails | null>(null);
  const [formData, setFormData] = useState({
    question_id: '',
    couple_id: '',
    scheduled_for: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDailyQuestions();
    fetchQuestions();
    fetchCouples();
  }, []);

  const fetchDailyQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_questions')
        .select(`
          *,
          questions (*),
          couples (
            *,
            user1:profiles!couples_user1_id_fkey (*),
            user2:profiles!couples_user2_id_fkey (*)
          )
        `)
        .order('scheduled_for', { ascending: false });

      if (error) throw error;
      setDailyQuestions(data || []);
    } catch (error) {
      console.error('Error fetching daily questions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch daily questions",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('content');

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const fetchCouples = async () => {
    try {
      const { data, error } = await supabase
        .from('couples')
        .select(`
          *,
          user1:profiles!couples_user1_id_fkey (*),
          user2:profiles!couples_user2_id_fkey (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCouples(data || []);
    } catch (error) {
      console.error('Error fetching couples:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingDailyQuestion) {
        const { error } = await supabase
          .from('daily_questions')
          .update({
            question_id: formData.question_id || null,
            couple_id: formData.couple_id || null,
            scheduled_for: formData.scheduled_for,
          })
          .eq('id', editingDailyQuestion.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Daily question updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('daily_questions')
          .insert({
            question_id: formData.question_id || null,
            couple_id: formData.couple_id || null,
            scheduled_for: formData.scheduled_for,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Daily question scheduled successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingDailyQuestion(null);
      setFormData({ question_id: '', couple_id: '', scheduled_for: '' });
      fetchDailyQuestions();
    } catch (error) {
      console.error('Error saving daily question:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save daily question",
      });
    }
  };

  const handleEdit = (dailyQuestion: DailyQuestionWithDetails) => {
    setEditingDailyQuestion(dailyQuestion);
    setFormData({
      question_id: dailyQuestion.question_id || '',
      couple_id: dailyQuestion.couple_id || '',
      scheduled_for: dailyQuestion.scheduled_for,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (dailyQuestionId: string) => {
    if (!confirm('Are you sure you want to delete this daily question?')) return;

    try {
      const { error } = await supabase
        .from('daily_questions')
        .delete()
        .eq('id', dailyQuestionId);

      if (error) {
        if (error.message.includes('violates foreign key constraint') || error.code === '23503') {
          toast({
            title: "Cannot Delete",
            description: "This daily question cannot be deleted because it has related answers or notifications. Please remove related data first.",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Daily question deleted successfully",
      });
      fetchDailyQuestions();
    } catch (error) {
      console.error('Error deleting daily question:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete daily question",
      });
    }
  };

  const filteredDailyQuestions = dailyQuestions.filter(dq =>
    dq.questions?.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dq.couples?.user1.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dq.couples?.user2?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading daily questions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Questions</h1>
          <p className="text-muted-foreground">Manage scheduled daily questions for couples</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingDailyQuestion(null);
              setFormData({ question_id: '', couple_id: '', scheduled_for: new Date().toISOString().split('T')[0] });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Question
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Questions ({dailyQuestions.length})</CardTitle>
          <CardDescription>All scheduled daily questions</CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search daily questions..."
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
                <TableHead>Couple</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDailyQuestions.map((dq) => (
                <TableRow key={dq.id}>
                  <TableCell className="font-medium max-w-md">
                    {dq.questions?.content || 'No question selected'}
                  </TableCell>
                  <TableCell>
                    {dq.couples ? (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {dq.couples.user1.name}
                          {dq.couples.user2 && ` & ${dq.couples.user2.name}`}
                        </span>
                      </div>
                    ) : (
                      <Badge variant="outline">All Couples</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {new Date(dq.scheduled_for).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(dq.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(dq)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(dq.id)}>
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
              {editingDailyQuestion ? 'Edit Daily Question' : 'Schedule Daily Question'}
            </DialogTitle>
            <DialogDescription>
              {editingDailyQuestion ? 'Update daily question schedule.' : 'Schedule a question for a specific date and couple.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="question">Question</Label>
                <Select
                  value={formData.question_id}
                  onValueChange={(value) => setFormData({ ...formData, question_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a question" />
                  </SelectTrigger>
                  <SelectContent>
                    {questions.map((question) => (
                      <SelectItem key={question.id} value={question.id}>
                        {question.content.substring(0, 60)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="couple">Couple (optional)</Label>
                <Select
                  value={formData.couple_id}
                  onValueChange={(value) => setFormData({ ...formData, couple_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select couple or leave empty for all" />
                  </SelectTrigger>
                  <SelectContent>
                    {couples.map((couple) => (
                      <SelectItem key={couple.id} value={couple.id}>
                        {couple.user1.name}
                        {couple.user2 && ` & ${couple.user2.name}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="scheduled_for">Scheduled Date</Label>
                <Input
                  id="scheduled_for"
                  type="date"
                  value={formData.scheduled_for}
                  onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingDailyQuestion ? 'Update Schedule' : 'Schedule Question'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}