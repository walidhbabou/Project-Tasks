import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Folder, CheckSquare, Clock } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ProjectCard from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { projects } = useProjects();
  const { user } = useAuth();

  const totalTasks = projects.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasks = projects.reduce(
    (acc, p) => acc + p.tasks.filter((t) => t.completed).length,
    0
  );
  const pendingTasks = totalTasks - completedTasks;

  const stats = [
    { icon: Folder, label: 'Projects', value: projects.length, color: 'bg-tag-purple' },
    { icon: CheckSquare, label: 'Completed', value: completedTasks, color: 'bg-success' },
    { icon: Clock, label: 'Pending', value: pendingTasks, color: 'bg-warning' },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="border-b border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Good morning, {user?.name}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's what's happening with your projects
              </p>
            </div>
            <Link to="/projects/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </Link>
          </div>
        </header>

        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card border border-border rounded-lg p-4 flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Projects Grid */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Projects</h2>
            {projects.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No projects yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first project to get started
                </p>
                <Link to="/projects/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
