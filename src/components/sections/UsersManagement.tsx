import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { supabase, Profile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export function UsersManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    country: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch users",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        const { error } = await supabase
          .from('profiles')
          .update({
            name: formData.name,
            gender: formData.gender || null,
            country: formData.country || null,
          })
          .eq('id', editingUser.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "User updated successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingUser(null);
      setFormData({ name: '', gender: '', country: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save user",
      });
    }
  };

  const handleEdit = (user: Profile) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      gender: user.gender || '',
      country: user.country || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    try {
      // First check if user has couple relationships
      const { data: couples, error: couplesCheckError } = await supabase
        .from('couples')
        .select('id')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

      if (couplesCheckError) {
        console.error('Error checking couples:', couplesCheckError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to check user relationships",
        });
        return;
      }

      if (couples && couples.length > 0) {
        toast({
          title: "Cannot Delete User",
          description: "This user has couple relationships. Please delete the couple relationship first in the Couples Management section, then delete the user.",
        });
        return;
      }

      if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

      // Delete from other related tables that might reference this user
      const tablesToClean = [
        'game_stats',
        'quiz_answers', 
        'pulses',
        'answers',
        'chat_messages',
        'service_stats',
        'notifications'
      ];

      for (const table of tablesToClean) {
        try {
          await supabase
            .from(table)
            .delete()
            .eq('user_id', userId);
        } catch (error) {
          console.error(`Error deleting from ${table}:`, error);
          // Continue with other tables
        }
      }

      // Clean up additional user references
      try {
        // Clean sender/receiver references in pulses
        await supabase.from('pulses').delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
        
        // Clean player references in game_stats
        await supabase.from('game_stats').delete().or(`player1_id.eq.${userId},player2_id.eq.${userId}`);
        
        // Clean chat messages by sender
        await supabase.from('chat_messages').delete().eq('sender_id', userId);
        
        // Clean chat viewers
        await supabase.from('chat_viewers').delete().eq('user_id', userId);
      } catch (error) {
        console.error('Error cleaning additional references:', error);
      }

      // Finally, delete the user profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        if (error.message.includes('violates foreign key constraint') || error.code === '23503') {
          toast({
            title: "Cannot Delete User",
            description: "This user cannot be deleted because they have related data that couldn't be removed. Please contact support.",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user. Please try again.",
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.country?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground">Manage user profiles and information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
          <CardDescription>All registered users in your app</CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
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
                <TableHead>Gender</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Invite Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>
                    {user.gender ? (
                      <Badge variant="outline">
                        {user.gender}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{user.country || '-'}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {user.invite_code || '-'}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.completed ? "default" : "secondary"}>
                      {user.completed ? 'Complete' : 'Incomplete'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(user.id)}>
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
              {editingUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user information.' : 'Add a new user to the system.'}
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
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingUser ? 'Update User' : 'Add User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}