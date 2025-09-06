import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, MessageSquare, Brain, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ChartContainer } from '@/components/ui/chart';

interface DashboardStats {
  totalUsers: number;
  totalCouples: number;
  totalQuizzes: number;
  totalQuestions: number;
  totalDailyQuestions: number;
  totalAnswers: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCouples: 0,
    totalQuizzes: 0,
    totalQuestions: 0,
    totalDailyQuestions: 0,
    totalAnswers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [users, couples, quizzes, questions, dailyQuestions, answers] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('couples').select('id', { count: 'exact' }),
        supabase.from('quizzes').select('id', { count: 'exact' }),
        supabase.from('questions').select('id', { count: 'exact' }),
        supabase.from('daily_questions').select('id', { count: 'exact' }),
        supabase.from('quiz_answers').select('id', { count: 'exact' }),
      ]);

      setStats({
        totalUsers: users.count || 0,
        totalCouples: couples.count || 0,
        totalQuizzes: quizzes.count || 0,
        totalQuestions: questions.count || 0,
        totalDailyQuestions: dailyQuestions.count || 0,
        totalAnswers: answers.count || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Users', value: stats.totalUsers },
    { name: 'Couples', value: stats.totalCouples },
    { name: 'Quizzes', value: stats.totalQuizzes },
    { name: 'Questions', value: stats.totalQuestions },
  ];

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your couples app metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Active user profiles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Couples</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCouples}</div>
            <p className="text-xs text-muted-foreground">Connected couples</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
            <p className="text-xs text-muted-foreground">Available quizzes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz Answers</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnswers}</div>
            <p className="text-xs text-muted-foreground">Total answers given</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>App Overview</CardTitle>
            <CardDescription>Distribution of app content</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{}}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Statistics</CardTitle>
            <CardDescription>App content metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{}}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Questions</CardTitle>
            <CardDescription>Question management overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Questions</span>
              <span className="font-medium">{stats.totalQuestions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Scheduled Daily Questions</span>
              <span className="font-medium">{stats.totalDailyQuestions}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement</CardTitle>
            <CardDescription>User engagement metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Avg. Answers per User</span>
              <span className="font-medium">
                {stats.totalUsers > 0 ? (stats.totalAnswers / stats.totalUsers).toFixed(1) : '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Completion Rate</span>
              <span className="font-medium">
                {stats.totalQuizzes > 0 ? ((stats.totalAnswers / (stats.totalQuizzes * stats.totalUsers)) * 100).toFixed(1) + '%' : '0%'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}