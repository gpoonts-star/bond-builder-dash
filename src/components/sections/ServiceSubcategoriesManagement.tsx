import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServiceCategory {
  id: string;
  name: string;
  icon?: string;
}

interface ServiceSubcategory {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at: string;
  service_categories: ServiceCategory;
}

export function ServiceSubcategoriesManagement() {
  const [subcategories, setSubcategories] = useState<ServiceSubcategory[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<ServiceSubcategory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    category_id: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subcategoriesResponse, categoriesResponse] = await Promise.all([
        supabase
          .from('service_subcategories')
          .select(`
            *,
            service_categories (
              id,
              name,
              icon
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('service_categories')
          .select('id, name, icon')
          .order('name')
      ]);

      if (subcategoriesResponse.error) throw subcategoriesResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;

      setSubcategories(subcategoriesResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSubcategory) {
        const { error } = await supabase
          .from('service_subcategories')
          .update({
            name: formData.name,
            description: formData.description || null,
            icon: formData.icon || null,
            category_id: formData.category_id,
          })
          .eq('id', editingSubcategory.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Subcategory updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('service_subcategories')
          .insert([{
            name: formData.name,
            description: formData.description || null,
            icon: formData.icon || null,
            category_id: formData.category_id,
          }]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Subcategory created successfully",
        });
      }

      setFormData({ name: '', description: '', icon: '', category_id: '' });
      setEditingSubcategory(null);
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      toast({
        title: "Error",
        description: "Failed to save subcategory",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (subcategory: ServiceSubcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({
      name: subcategory.name,
      description: subcategory.description || '',
      icon: subcategory.icon || '',
      category_id: subcategory.category_id
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subcategory? This will also delete all service providers.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('service_subcategories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subcategory deleted successfully",
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast({
        title: "Error",
        description: "Failed to delete subcategory",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', icon: '', category_id: '' });
    setEditingSubcategory(null);
  };

  const filteredSubcategories = subcategories.filter(sub => 
    selectedCategory === 'all' || sub.category_id === selectedCategory
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Service Subcategories</h2>
          <p className="text-muted-foreground">Manage subcategories within each main category</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subcategory
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category_id">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({...formData, category_id: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="icon">Icon (emoji or icon name)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  placeholder="🍕 or utensils"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSubcategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <Label htmlFor="category-filter">Filter by Category:</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.icon} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Subcategories ({filteredSubcategories.length})
          </CardTitle>
          <CardDescription>
            Subcategories help organize services within main categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubcategories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {selectedCategory === 'all' 
                  ? 'No subcategories found. Create your first subcategory!'
                  : 'No subcategories found for this category.'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubcategories.map((subcategory) => (
                  <TableRow key={subcategory.id}>
                    <TableCell>
                      <span className="text-lg">{subcategory.icon || '📂'}</span>
                    </TableCell>
                    <TableCell className="font-medium">{subcategory.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{subcategory.service_categories.icon}</span>
                        <span>{subcategory.service_categories.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{subcategory.description || '-'}</TableCell>
                    <TableCell>
                      {new Date(subcategory.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(subcategory)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(subcategory.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}