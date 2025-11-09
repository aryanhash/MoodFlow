import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  ChevronDown,
  Bell,
  HelpCircle
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function UserMenu() {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const user = isAuthenticated ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setLocation("/login");
  };

  if (!isAuthenticated) {
    return (
      <Button
        onClick={() => setLocation("/login")}
        variant="outline"
        className="border-purple-200 text-purple-600 hover:bg-purple-50"
      >
        Sign In
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
            {user?.name || 'User'}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {user?.name || 'User'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {user?.email || 'user@example.com'}
          </p>
        </div>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => setLocation("/profile")}>
          <User className="w-4 h-4 mr-2" />
          Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => setLocation("/notifications")}>
          <Bell className="w-4 h-4 mr-2" />
          Notifications
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => setLocation("/help")}>
          <HelpCircle className="w-4 h-4 mr-2" />
          Help & Support
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={toggleTheme}>
          {theme === 'light' ? (
            <>
              <Moon className="w-4 h-4 mr-2" />
              Dark Mode
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 mr-2" />
              Light Mode
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => setLocation("/settings")}>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
