import React, { useState } from 'react';
import { Check, Calendar, MoreHorizontal, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import { Task } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import TaskStatus from '@/components/TaskStatus';
import { isOverdue as isOverdueFn } from '@/domain/task';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onStatusChange?: () => void;
  onDelete: () => void;
  onSelect: () => void;
  isSelected?: boolean;
}

const tagColors = {
  blue: 'bg-tag-blue/20 text-tag-blue',
  green: 'bg-tag-green/20 text-tag-green',
  orange: 'bg-tag-orange/20 text-tag-orange',
  purple: 'bg-tag-purple/20 text-tag-purple',
  pink: 'bg-tag-pink/20 text-tag-pink',
};

const TaskItem = ({ task, onToggle, onStatusChange, onDelete, onSelect, isSelected }: TaskItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isOverdue = isOverdueFn(task);

  return (
    <div
      className={cn(
        'group flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer',
        isSelected && 'bg-secondary'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {/* Status Button - Case à cocher */}
      <div onClick={(e) => e.stopPropagation()}>
        <TaskStatus
          status={task.status || 'NOT_STARTED'}
          onClick={onStatusChange}
        />
      </div>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm transition-colors',
              task.completed && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </span>
          {isOverdue && (
            <span className="text-xs font-medium text-destructive">Overdue</span>
          )}
          
          {/* Status Label */}
          {task.status === 'COMPLETED' && (
            <span className="text-xs font-medium text-green-500">
              Terminé
            </span>
          )}

          {/* Tags */}
          {task.tags?.map((tag) => (
            <span
              key={tag.id}
              className={cn(
                'px-2 py-0.5 rounded text-xs font-medium',
                tagColors[tag.color]
              )}
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* Due Date */}
      {task.dueDate && (
        <div
          className={cn(
            'flex items-center gap-1 text-sm',
            isOverdue ? 'text-destructive' : 'text-muted-foreground'
          )}
        >
          {isOverdue ? (
            <AlertTriangle className="w-3 h-3" />
          ) : (
            <Calendar className="w-3 h-3" />
          )}
          <span>{task.dueDate}</span>
        </div>
      )}

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity',
              isHovered && 'opacity-100'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelect(); }}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TaskItem;
