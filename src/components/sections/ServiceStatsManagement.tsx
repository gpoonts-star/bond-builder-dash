import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Eye, Calendar } from 'lucide-react';

interface ServiceStats {
  provider_id: string;
  provider_name: string;
  category_name: string;
  subcategory_name: string;
  total_views: number;
  unique_users: number;
  latest_access: string;
}

interface CategoryStats {
  category: string;
  views: number;
  providers: number;
}

export function ServiceStatsManagement() {
  const [stats, setStats] = useState<ServiceStats[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0);
  const [totalProviders, setTotalProviders] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get service usage statistics
      const { data: statsData, error: statsError } = await supabase
        .from('service_stats')
        .select(`
          service_provider_id,
          user_id,
          accessed_at,
          service_providers!inner (
            id,
            name,
            service_subcategories!inner (
              name,
              service_categories!inner (
                name
              )
            )
          )
        `);

      if (statsError) throw statsError;

      // Process the data to get aggregated stats
      const providerStats: { [key: string]: ServiceStats } = {};
      const categoryData: { [key: string]: CategoryStats } = {};

      statsData?.forEach((stat: any) => {
        const provider = stat.service_providers;
        if (!provider) return;

        const providerId = stat.service_provider_id;
        const categoryName = provider.service_subcategories?.service_categories?.name || 'Unknown';
        const subcategoryName = provider.service_subcategories?.name || 'Unknown';

        // Aggregate provider stats
        if (!providerStats[providerId]) {
          providerStats[providerId] = {
            provider_id: providerId,
            provider_name: provider.name,
            category_name: categoryName,
            subcategory_name: subcategoryName,
            total_views: 0,
            unique_users: 0,
            latest_access: stat.accessed_at
          };
        }

        providerStats[providerId].total_views++;
        
        if (stat.accessed_at > providerStats[providerId].latest_access) {
          providerStats[providerId].latest_access = stat.accessed_at;
        }

        // Aggregate category stats
        if (!categoryData[categoryName]) {
          categoryData[categoryName] = {
            category: categoryName,
            views: 0,
            providers: new Set().size
          };
        }
        categoryData[categoryName].views++;
      });

      // Calculate unique users per provider
      const uniqueUserCounts: { [key: string]: Set<string> } = {};
      statsData?.forEach((stat) => {
        if (!uniqueUserCounts[stat.service_provider_id]) {
          uniqueUserCounts[stat.service_provider_id] = new Set();
        }
        if (stat.user_id) {
          uniqueUserCounts[stat.service_provider_id].add(stat.user_id);
        }
      });

      Object.keys(uniqueUserCounts).forEach(providerId => {
        if (providerStats[providerId]) {
          providerStats[providerId].unique_users = uniqueUserCounts[providerId].size;
        }
      });

      // Get provider counts per category
      const { data: providerCounts, error: providerError } = await supabase
        .from('service_providers')
        .select(`
          service_subcategories!inner (
            service_categories!inner (
              name
            )
          )
        `);

      if (!providerError && providerCounts) {
        const categoryProviderCounts: { [key: string]: number } = {};
        providerCounts.forEach((provider: any) => {
          const categoryName = provider.service_subcategories?.service_categories?.name || 'Unknown';
          categoryProviderCounts[categoryName] = (categoryProviderCounts[categoryName] || 0) + 1;
        });

        Object.keys(categoryData).forEach(category => {
          categoryData[category].providers = categoryProviderCounts[category] || 0;
        });
      }

      const sortedStats = Object.values(providerStats).sort((a, b) => b.total_views - a.total_views);
      const sortedCategoryStats = Object.values(categoryData).sort((a, b) => b.views - a.views);

      setStats(sortedStats);
      setCategoryStats(sortedCategoryStats);
      setTotalViews(sortedStats.reduce((sum, stat) => sum + stat.total_views, 0));
      setTotalProviders(sortedStats.length);

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Service Usage Statistics</h2>
        <p className="text-muted-foreground">Track how users interact with your service providers</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Providers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProviders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryStats.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Views/Provider</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalProviders > 0 ? Math.round(totalViews / totalProviders) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Views by Category</CardTitle>
            <CardDescription>Distribution of service views across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="views"
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Categories Performance</CardTitle>
            <CardDescription>Views vs providers count by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#8884d8" name="Views" />
                <Bar dataKey="providers" fill="#82ca9d" name="Providers" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Provider Performance</CardTitle>
          <CardDescription>Detailed statistics for each service provider</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No usage statistics available yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subcategory</TableHead>
                  <TableHead>Total Views</TableHead>
                  <TableHead>Unique Users</TableHead>
                  <TableHead>Latest Access</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((stat) => (
                  <TableRow key={stat.provider_id}>
                    <TableCell className="font-medium">{stat.provider_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{stat.category_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{stat.subcategory_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{stat.total_views}</Badge>
                    </TableCell>
                    <TableCell>{stat.unique_users}</TableCell>
                    <TableCell>
                      {new Date(stat.latest_access).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
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