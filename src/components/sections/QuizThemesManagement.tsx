import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { supabase, QuizTheme } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export function QuizThemesManagement() {
  const [themes, setThemes] = useState<QuizTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<QuizTheme | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_themes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setThemes(data || []);
    } catch (error) {
      console.error('Error fetching themes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch quiz themes",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTheme) {
        const { error } = await supabase
          .from('quiz_themes')
          .update({
            name: formData.name,
            description: formData.description || null,
          })
          .eq('id', editingTheme.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Quiz theme updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('quiz_themes')
          .insert({
            name: formData.name,
            description: formData.description || null,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Quiz theme created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingTheme(null);
      setFormData({ name: '', description: '' });
      fetchThemes();
    } catch (error) {
      console.error('Error saving theme:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save quiz theme",
      });
    }
  };

  const handleEdit = (theme: QuizTheme) => {
    setEditingTheme(theme);
    setFormData({
      name: theme.name,
      description: theme.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (themeId: string) => {
    if (!confirm('Are you sure you want to delete this quiz theme?')) return;

    try {
      const { error } = await supabase
        .from('quiz_themes')
        .delete()
        .eq('id', themeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quiz theme deleted successfully",
      });
      fetchThemes();
    } catch (error) {
      console.error('Error deleting theme:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete quiz theme",
      });
    }
  };

  const filteredThemes = themes.filter(theme =>
    theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (theme.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div className="text-center py-8">Loading quiz themes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz Themes</h1>
          <p className="text-muted-foreground">Manage quiz themes and categories</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTheme(null);
              setFormData({ name: '', description: '' });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Theme
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Themes ({themes.length})</CardTitle>
          <CardDescription>All quiz themes in your app</CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search themes..."
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
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredThemes.map((theme) => (
                <TableRow key={theme.id}>
                  <TableCell className="font-medium">{theme.name}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {theme.description || '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(theme.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(theme)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(theme.id)}>
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
              {editingTheme ? 'Edit Quiz Theme' : 'Add New Quiz Theme'}
            </DialogTitle>
            <DialogDescription>
              {editingTheme ? 'Update quiz theme information.' : 'Create a new quiz theme.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
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
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingTheme ? 'Update Theme' : 'Create Theme'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}