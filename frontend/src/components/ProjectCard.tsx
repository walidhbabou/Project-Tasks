import React from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { Project } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProjects } from '@/contexts/ProjectContext';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const { getProjectProgress, deleteProject } = useProjects();
  const progress = getProjectProgress(project.id);
  const taskCount = project.tasks.length;
  const completedCount = project.tasks.filter((t) => t.completed).length;

  return (
    <Link to={`/project/${project.id}`}>
      <div className="group bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/30">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: project.color }}
            >
              <span className="text-white font-semibold text-lg">
                {project.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-card-foreground group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {taskCount} tasks • {completedCount} completed
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  deleteProject(project.id);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} indicatorColor={project.color} />
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
