import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Project, Task } from '@/types';
import { useAuth } from './AuthContext';
import { projectApi, taskApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  addProject: (name: string, description?: string, color?: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTask: (projectId: string, title: string, section?: string, dueDate?: string) => Promise<void>;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  toggleTaskComplete: (projectId: string, taskId: string) => Promise<void>;
  updateTaskStatus: (projectId: string, taskId: string) => Promise<void>;
  getProjectProgress: (projectId: string) => number;
  loading: boolean;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  // Load projects from backend when authenticated
  const refreshProjects = async () => {
    if (!isAuthenticated) {
      setProjects([]);
      return;
    }

    try {
      setLoading(true);
      const fetchedProjects = await projectApi.getAllProjects();
      
      // Convert backend format to frontend format
      const formattedProjects = (Array.isArray(fetchedProjects) ? fetchedProjects : []).map((p: any) => ({
        id: String(p.id || p.id.toString()),
        name: p.name || p.title || '',
        description: p.description || '',
        color: p.color || '#0EA5E9',
        tasks: (p.tasks || []).map((t: any) => ({
          id: String(t.id || t.id.toString()),
          title: t.title || '',
          description: t.description || '',
          completed: t.completed || false,
          status: t.status || 'NOT_STARTED',
          projectId: String(p.id || p.id.toString()),
          section: t.section || 'Recently assigned',
          dueDate: t.dueDate || '',
          createdAt: t.createdAt || '',
          tags: t.tags || [],
        })),
        createdAt: p.createdAt || '',
        ownerId: user?.id || '1',
      }));
      
      setProjects(formattedProjects);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les projets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, [isAuthenticated]);

  const addProject = async (name: string, description?: string, color?: string) => {
    try {
      const createdProject = await projectApi.createProject({ name, description, color });
      
      const newProject: Project = {
        id: String(createdProject.id),
        name: createdProject.name || createdProject.title || name,
        description: createdProject.description || '',
        color: createdProject.color || '#0EA5E9',
        tasks: createdProject.tasks?.map((t: any) => ({
          id: String(t.id),
          title: t.title,
          description: t.description,
          completed: t.completed || false,
          status: t.status || 'NOT_STARTED',
          projectId: String(createdProject.id),
          section: t.section || 'Recently assigned',
          dueDate: t.dueDate,
          createdAt: t.createdAt,
          tags: t.tags || [],
        })) || [],
        createdAt: createdProject.createdAt,
        ownerId: user?.id || '1',
      };
      
      setProjects((prev) => [...prev, newProject]);
      await refreshProjects();
      toast({
        title: "Succès",
        description: "Projet créé avec succès",
      });
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de créer le projet",
        variant: "destructive",
      });
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectApi.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
      toast({
        title: "Succès",
        description: "Projet supprimé avec succès",
      });
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le projet",
        variant: "destructive",
      });
    }
  };

  const addTask = async (projectId: string, title: string, section?: string, dueDate?: string) => {
    try {
      const createdTask = await taskApi.createTask(projectId, { title, section, dueDate });
      
      const newTask: Task = {
        id: createdTask.id.toString(),
        title: createdTask.title,
        description: createdTask.description,
        completed: createdTask.completed,
        projectId,
        section: createdTask.section || 'Recently assigned',
        dueDate: createdTask.dueDate,
        createdAt: createdTask.createdAt,
      };
      
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p
        )
      );
      
      toast({
        title: "Succès",
        description: "Tâche créée avec succès",
      });
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la tâche",
        variant: "destructive",
      });
    }
  };

  const updateTask = async (projectId: string, taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await taskApi.updateTask(projectId, taskId, updates);
      
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                tasks: p.tasks.map((t) => 
                  t.id === taskId 
                    ? { 
                        ...t, 
                        ...updates,
                        id: updatedTask.id.toString(),
                      } 
                    : t
                ),
              }
            : p
        )
      );
      
      toast({
        title: "Succès",
        description: "Tâche mise à jour avec succès",
      });
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la tâche",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (projectId: string, taskId: string) => {
    try {
      await taskApi.deleteTask(projectId, taskId);
      
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) }
            : p
        )
      );
      
      toast({
        title: "Succès",
        description: "Tâche supprimée avec succès",
      });
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la tâche",
        variant: "destructive",
      });
    }
  };

  const toggleTaskComplete = async (projectId: string, taskId: string) => {
    try {
      const updatedTask = await taskApi.toggleTaskComplete(projectId, taskId);
      
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                tasks: p.tasks.map((t) =>
                  t.id === taskId ? { ...t, completed: updatedTask.completed } : t
                ),
              }
            : p
        )
      );
    } catch (error: any) {
      console.error('Error toggling task:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'état de la tâche",
        variant: "destructive",
      });
    }
  };

  const updateTaskStatus = async (projectId: string, taskId: string) => {
    try {
      const updatedTask = await taskApi.updateTaskStatus(projectId, taskId);
      
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                tasks: p.tasks.map((t) =>
                  t.id === taskId 
                    ? { 
                        ...t, 
                        status: updatedTask.status, 
                        completed: updatedTask.completed 
                      } 
                    : t
                ),
              }
            : p
        )
      );
    } catch (error: any) {
      console.error('Error updating task status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de la tâche",
        variant: "destructive",
      });
    }
  };

  const getProjectProgress = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project || project.tasks.length === 0) return 0;
    const completed = project.tasks.filter((t) => t.completed).length;
    const raw = (completed / project.tasks.length) * 100;
    // Round to nearest 5% step: 0,5,10,...,100
    const stepped = Math.min(100, Math.max(0, Math.round(raw / 5) * 5));
    return stepped;
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        setCurrentProject,
        addProject,
        deleteProject,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        updateTaskStatus,
        getProjectProgress,
        loading,
        refreshProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
