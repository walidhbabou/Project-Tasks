import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Calendar as CalendarIcon, ChevronRight, Search } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TaskStatus from '@/components/TaskStatus';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProjects } from '@/contexts/ProjectContext';
import { Task } from '@/types';
import { cn } from '@/lib/utils';
import Swal from 'sweetalert2';
import { Input } from '@/components/ui/input';

const MyTasks = () => {
  const navigate = useNavigate();
  const { projects, deleteTask, updateTaskStatus } = useProjects();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  // Récupérer toutes les tâches non complétées de tous les projets
  const incompleteTasks: (Task & { projectId: string; projectName: string; projectColor: string })[] = [];
  
  projects.forEach((project) => {
    project.tasks
      .filter((task) => !task.completed)
      .forEach((task) => {
        incompleteTasks.push({
          ...task,
          projectId: project.id,
          projectName: project.name,
          projectColor: project.color,
        });
      });
  });

  // Trier par date d'échéance (les plus proches en premier)
  const sortedTasks = incompleteTasks.sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const filteredTasks = sortedTasks.filter((t) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(term) ||
      (t.description || '').toLowerCase().includes(term) ||
      t.projectName.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedTasks = filteredTasks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const confirmDelete = async (taskId: string, projectId: string) => {
    const result = await Swal.fire({
      title: 'Supprimer cette tâche ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc2626',
    });
    if (result.isConfirmed) {
      deleteTask(projectId, taskId);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Tasks</h1>
              <p className="text-muted-foreground">
                {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} shown
              </p>
            </div>
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search tasks"
                className="pl-9"
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {filteredTasks.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  All caught up!
                </h2>
                <p className="text-muted-foreground">
                  You have no incomplete tasks. Great job!
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-3">
              {pagedTasks.map((task) => (
                <Card
                  key={task.id}
                  className="p-4 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start gap-4">
                    {/* Status Button */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <TaskStatus
                        status={task.status || 'NOT_STARTED'}
                        onClick={() => updateTaskStatus(task.projectId, task.id)}
                      />
                    </div>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {/* Project Badge */}
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: task.projectColor }}
                        />
                        <button
                          onClick={() => navigate(`/projects/${task.projectId}`)}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {task.projectName}
                        </button>
                      </div>

                      {/* Task Title */}
                      <h3 className="text-base font-medium text-foreground mb-1">
                        {task.title}
                      </h3>

                      {/* Task Description */}
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {task.description}
                        </p>
                      )}

                      {/* Due Date */}
                      {task.dueDate && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{task.dueDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/projects/${task.projectId}`)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => confirmDelete(task.id, task.projectId)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {filteredTasks.length > 0 && (
          <div className="border-t border-border p-4 flex items-center justify-between bg-card">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyTasks;
