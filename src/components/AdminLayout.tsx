import { useState } from 'react';
import { Users, MessageSquare, BarChart3, Settings, LogOut, Menu, Brain, Calendar, HelpCircle, Tag, FolderOpen, Building2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'quiz-themes', label: 'Quiz Themes', icon: Brain },
  { id: 'quizzes', label: 'Quizzes', icon: MessageSquare },
  { id: 'quiz-questions', label: 'Quiz Questions', icon: HelpCircle },
  { id: 'questions', label: 'Questions', icon: MessageSquare },
  { id: 'daily-questions', label: 'Daily Questions', icon: Calendar },
  { id: 'service-categories', label: 'Service Categories', icon: Tag },
  { id: 'service-subcategories', label: 'Service Subcategories', icon: FolderOpen },
  { id: 'service-providers', label: 'Service Providers', icon: Building2 },
  { id: 'service-stats', label: 'Service Stats', icon: TrendingUp },
];

export function AdminLayout({ children, activeSection, onSectionChange }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout",
      });
    } else {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      window.location.reload();
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-primary">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Couples App Management</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    onSectionChange(item.id);
                    setIsSidebarOpen(false);
                  }}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-card border-r">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden fixed top-4 left-4 z-40">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}