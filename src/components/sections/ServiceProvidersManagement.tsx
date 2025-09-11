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
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Building2, MapPin, Phone, Globe, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUploader } from '@/components/ImageUploader';

interface ServiceCategory {
  id: string;
  name: string;
  icon?: string;
}

interface ServiceSubcategory {
  id: string;
  name: string;
  icon?: string;
  service_categories: ServiceCategory;
}

interface ServiceProvider {
  id: string;
  subcategory_id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  opening_hours?: any;
  price_range?: string;
  image_url?: string;
  website?: string;
  created_at: string;
  service_subcategories: ServiceSubcategory;
}

export function ServiceProvidersManagement() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [subcategories, setSubcategories] = useState<ServiceSubcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subcategory_id: '',
    address: '',
    city: '',
    phone: '',
    website: '',
    price_range: '',
    image_url: '',
    opening_hours: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [providersResponse, subcategoriesResponse] = await Promise.all([
        supabase
          .from('service_providers')
          .select(`
            *,
            service_subcategories (
              id,
              name,
              icon,
              service_categories (
                id,
                name,
                icon
              )
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('service_subcategories')
          .select(`
            id,
            name,
            icon,
            service_categories!inner (
              id,
              name,
              icon
            )
          `)
          .order('name')
      ]);

      if (providersResponse.error) throw providersResponse.error;
      if (subcategoriesResponse.error) throw subcategoriesResponse.error;

      setProviders(providersResponse.data || []);
      setSubcategories(subcategoriesResponse.data?.map((sub: any) => ({
        ...sub,
        service_categories: sub.service_categories
      })) || []);
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
      let openingHours = null;
      if (formData.opening_hours) {
        try {
          openingHours = JSON.parse(formData.opening_hours);
        } catch {
          openingHours = { general: formData.opening_hours };
        }
      }

      const providerData = {
        name: formData.name,
        description: formData.description || null,
        subcategory_id: formData.subcategory_id,
        address: formData.address || null,
        city: formData.city || null,
        phone: formData.phone || null,
        website: formData.website || null,
        price_range: formData.price_range || null,
        image_url: formData.image_url || null,
        opening_hours: openingHours,
      };

      if (editingProvider) {
        const { error } = await supabase
          .from('service_providers')
          .update(providerData)
          .eq('id', editingProvider.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Service provider updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('service_providers')
          .insert([providerData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Service provider created successfully",
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving provider:', error);
      toast({
        title: "Error",
        description: "Failed to save service provider",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (provider: ServiceProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      description: provider.description || '',
      subcategory_id: provider.subcategory_id,
      address: provider.address || '',
      city: provider.city || '',
      phone: provider.phone || '',
      website: provider.website || '',
      price_range: provider.price_range || '',
      image_url: provider.image_url || '',
      opening_hours: provider.opening_hours ? JSON.stringify(provider.opening_hours, null, 2) : ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service provider?')) {
      return;
    }

    try {
      // Check for related service stats first
      const { data: stats } = await supabase
        .from('service_stats')
        .select('id')
        .eq('service_provider_id', id)
        .limit(1);

      if (stats && stats.length > 0) {
        toast({
          title: "Cannot Delete Service Provider",
          description: "This service provider has usage statistics and cannot be deleted. You can edit it instead.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('service_providers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service provider deleted successfully",
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast({
        title: "Error",
        description: "Failed to delete service provider. It might be referenced by other records.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      subcategory_id: '',
      address: '',
      city: '',
      phone: '',
      website: '',
      price_range: '',
      image_url: '',
      opening_hours: ''
    });
    setEditingProvider(null);
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.service_subcategories.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.service_subcategories.service_categories.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubcategory = selectedSubcategory === 'all' || provider.subcategory_id === selectedSubcategory;
    
    return matchesSearch && matchesSubcategory;
  });

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
          <h2 className="text-2xl font-bold tracking-tight">Service Providers</h2>
          <p className="text-muted-foreground">Manage your bons plans and service offerings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProvider ? 'Edit Service Provider' : 'Add New Service Provider'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="subcategory_id">Subcategory</Label>
                  <Select
                    value={formData.subcategory_id}
                    onValueChange={(value) => setFormData({...formData, subcategory_id: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.service_categories.icon} {subcategory.service_categories.name} → {subcategory.icon} {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="name">Business Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="price_range">Price Range</Label>
                  <Input
                    id="price_range"
                    value={formData.price_range}
                    onChange={(e) => setFormData({...formData, price_range: e.target.value})}
                    placeholder="80-120 DH"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                
                  <div className="col-span-2">
                    <Label htmlFor="imageUrl">Service Image</Label>
                    <ImageUploader
                      onImageUpload={(url) => setFormData({...formData, image_url: url})}
                      currentImage={formData.image_url}
                      placeholder="Upload service image"
                    />
                  </div>
                
                <div className="col-span-2">
                  <Label htmlFor="opening_hours">Opening Hours (JSON format)</Label>
                  <Textarea
                    id="opening_hours"
                    value={formData.opening_hours}
                    onChange={(e) => setFormData({...formData, opening_hours: e.target.value})}
                    placeholder='{"mon-fri": "9:00-18:00", "sat": "10:00-15:00"}'
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProvider ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Filter by subcategory" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subcategories</SelectItem>
            {subcategories.map((subcategory) => (
              <SelectItem key={subcategory.id} value={subcategory.id}>
                {subcategory.service_categories.name} → {subcategory.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Service Providers ({filteredProviders.length})
          </CardTitle>
          <CardDescription>
            Manage all your bons plans and service providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProviders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No service providers found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price Range</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{provider.name}</div>
                        {provider.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {provider.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit">
                          {provider.service_subcategories.service_categories.icon} {provider.service_subcategories.service_categories.name}
                        </Badge>
                        <Badge variant="secondary" className="w-fit">
                          {provider.service_subcategories.icon} {provider.service_subcategories.name}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {provider.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {provider.phone}
                          </div>
                        )}
                        {provider.website && (
                          <div className="flex items-center gap-1 text-sm">
                            <Globe className="h-3 w-3" />
                            <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {provider.address && (
                        <div className="flex items-start gap-1 text-sm">
                          <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <div>
                            {provider.address}
                            {provider.city && <div>{provider.city}</div>}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {provider.price_range && (
                        <Badge variant="outline">{provider.price_range}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(provider)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(provider.id)}
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