import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Search, Heart } from 'lucide-react';
import { supabase, Couple } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface CoupleWithProfiles extends Couple {
  user1_profile?: { name: string; } | null;
  user2_profile?: { name: string; } | null;
}

export function CouplesManagement() {
  const [couples, setCouples] = useState<CoupleWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchCouples();
  }, []);

  const fetchCouples = async () => {
    try {
      const { data, error } = await supabase
        .from('couples')
        .select(`
          *,
          user1_profile:profiles!couples_user1_id_fkey(name),
          user2_profile:profiles!couples_user2_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCouples(data || []);
    } catch (error) {
      console.error('Error fetching couples:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch couples",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (coupleId: string) => {
    if (!confirm('Are you sure you want to delete this couple? This will remove the relationship between the users.')) return;

    try {
      // Delete related data first
      const tablesToClean = [
        'daily_questions',
        'quiz_answers',
        'game_stats',
        'chat_threads',
        'calendar_events',
        'calendar_todos',
        'calendar_souvenirs',
        'quiz_results',
        'quiz_invites',
        'simple_chat_notifications',
        'daily_question_notifications'
      ];

      for (const table of tablesToClean) {
        try {
          await supabase
            .from(table)
            .delete()
            .eq('couple_id', coupleId);
        } catch (error) {
          console.error(`Error deleting from ${table}:`, error);
          // Continue with other tables
        }
      }

      // Finally delete the couple
      const { error } = await supabase
        .from('couples')
        .delete()
        .eq('id', coupleId);

      if (error) {
        if (error.message.includes('violates foreign key constraint') || error.code === '23503') {
          toast({
            title: "Cannot Delete Couple",
            description: "This couple cannot be deleted because they have related data that couldn't be removed. Please contact support.",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Couple deleted successfully",
      });
      fetchCouples();
    } catch (error) {
      console.error('Error deleting couple:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete couple. Please try again.",
      });
    }
  };

  const filteredCouples = couples.filter(couple =>
    couple.user1_profile?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    couple.user2_profile?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading couples...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Couples Management</h1>
          <p className="text-muted-foreground">Manage couple relationships and connections</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-brand-pink" />
            Couples ({couples.length})
          </CardTitle>
          <CardDescription>All couple relationships in your app</CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search couples..."
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
                <TableHead>User 1</TableHead>
                <TableHead>User 2</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCouples.map((couple) => (
                <TableRow key={couple.id}>
                  <TableCell className="font-medium">
                    {couple.user1_profile?.name || 'Unknown User'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {couple.user2_profile?.name || 'Not Connected'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={couple.user2_id ? "default" : "secondary"}>
                      {couple.user2_id ? 'Connected' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(couple.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleDelete(couple.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCouples.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No couples found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}