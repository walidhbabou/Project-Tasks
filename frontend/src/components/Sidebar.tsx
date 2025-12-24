import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CheckSquare, Inbox, Folder, ChevronDown, ChevronRight, Plus, LogOut, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/contexts/ProjectContext';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { projects } = useProjects();
  const [favoritesExpanded, setFavoritesExpanded] = useState(true);

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: CheckSquare, label: 'My Tasks', path: '/tasks' },

  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 h-screen sidebar-gradient flex flex-col">
      {/* Logo */}
      <div className="p-4 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">P</span>
        </div>
        <span className="text-sidebar-foreground font-semibold text-lg">ProjectFlow</span>
      </div>

      {/* Main Navigation */}
      <nav className="px-3 mt-2 flex-1">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <Button
              variant={isActive(item.path) ? 'sidebar' : 'sidebarGhost'}
              size="sidebar"
              className={cn(
                'mb-1',
                isActive(item.path) && 'bg-sidebar-accent'
              )}
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.label}
            </Button>
          </Link>
        ))}

        {/* Favorites Section */}
        <div className="mt-6">
          <button
            onClick={() => setFavoritesExpanded(!favoritesExpanded)}
            className="flex items-center gap-2 px-3 py-2 text-sidebar-foreground/60 text-xs font-medium uppercase tracking-wider w-full hover:text-sidebar-foreground transition-colors"
          >
            {favoritesExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            <Star className="w-3 h-3" />
            Favorites
          </button>

          {favoritesExpanded && (
            <div className="animate-fade-in">
              {projects.slice(0, 5).map((project) => (
                <Link key={project.id} to={`/project/${project.id}`}>
                  <Button
                    variant={isActive(`/project/${project.id}`) ? 'sidebar' : 'sidebarGhost'}
                    size="sidebar"
                    className="mb-1 pl-8"
                  >
                    <span
                      className="w-2 h-2 rounded-sm mr-3"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate">{project.name}</span>
                  </Button>
                </Link>
              ))}

              <Link to="/projects/new">
                <Button
                  variant="sidebarGhost"
                  size="sidebar"
                  className="mb-1 pl-8 text-sidebar-foreground/60"
                >
                  <Plus className="w-4 h-4 mr-3" />
                  New Project
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-muted">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sidebar-foreground text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sidebar-foreground text-sm truncate max-w-[120px]">
              {user?.name}
            </span>
          </div>
          <Button
            variant="sidebarGhost"
            size="icon"
            onClick={logout}
            className="w-8 h-8"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
