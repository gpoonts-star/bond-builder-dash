import { useState, useEffect } from 'react';
import { AdminAuth } from '@/components/AdminAuth';
import { AdminLayout } from '@/components/AdminLayout';
import { Dashboard } from '@/components/sections/Dashboard';
import { UsersManagement } from '@/components/sections/UsersManagement';
import { CouplesManagement } from '@/components/sections/CouplesManagement';
import { QuizThemesManagement } from '@/components/sections/QuizThemesManagement';
import { QuizzesManagement } from '@/components/sections/QuizzesManagement';
import { QuizQuestionsManagement } from '@/components/sections/QuizQuestionsManagement';
import { QuestionsManagement } from '@/components/sections/QuestionsManagement';
import { DailyQuestionsManagement } from '@/components/sections/DailyQuestionsManagement';
import { ServiceCategoriesManagement } from '@/components/sections/ServiceCategoriesManagement';
import { ServiceSubcategoriesManagement } from '@/components/sections/ServiceSubcategoriesManagement';
import { ServiceProvidersManagement } from '@/components/sections/ServiceProvidersManagement';
import { ServiceStatsManagement } from '@/components/sections/ServiceStatsManagement';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    checkAuthStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminAuth onAuthSuccess={handleAuthSuccess} />;
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UsersManagement />;
      case 'couples':
        return <CouplesManagement />;
      case 'quiz-themes':
        return <QuizThemesManagement />;
      case 'quizzes':
        return <QuizzesManagement />;
      case 'quiz-questions':
        return <QuizQuestionsManagement />;
      case 'questions':
        return <QuestionsManagement />;
      case 'daily-questions':
        return <DailyQuestionsManagement />;
      case 'service-categories':
        return <ServiceCategoriesManagement />;
      case 'service-subcategories':
        return <ServiceSubcategoriesManagement />;
      case 'service-providers':
        return <ServiceProvidersManagement />;
      case 'service-stats':
        return <ServiceStatsManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AdminLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderActiveSection()}
    </AdminLayout>
  );
}