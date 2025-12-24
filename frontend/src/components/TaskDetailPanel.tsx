import React, { useState, useEffect } from 'react';
import { X, Check, Calendar as CalendarIcon, User, Folder, Lock, Globe } from 'lucide-react';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProjects } from '@/contexts/ProjectContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { isOverdue as isOverdueFn } from '@/domain/task';

interface TaskDetailPanelProps {
  task: Task | null;
  onClose: () => void;
}

const TaskDetailPanel = ({ task, onClose }: TaskDetailPanelProps) => {
  const { updateTask, toggleTaskComplete } = useProjects();
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState<string>(task?.dueDate || '');
  const isOverdue = task ? isOverdueFn({ ...task, dueDate }) : false;

  useEffect(() => {
    setTitle(task?.title || '');
    setDescription(task?.description || '');
    setDueDate(task?.dueDate || '');
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    updateTask(task.projectId, task.id, { title, description });
  };

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const handleDueDateSelect = async (date?: Date) => {
    if (!date) return;
    const formatted = formatDate(date);
    setDueDate(formatted);
    await updateTask(task.projectId, task.id, { dueDate: formatted });
  };

  return (
    <div className="w-96 border-l border-border bg-card h-full flex flex-col animate-slide-in">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleTaskComplete(task.projectId, task.id)}
          >
            {task.completed ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Completed
              </>
            ) : (
              'Mark Complete'
            )}
          </Button>
        </div>
        <div className="flex items-center gap-1">
        
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Title */}
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          className="text-xl font-semibold border-none bg-transparent px-0 focus-visible:ring-0"
          placeholder="Task name"
        />

        {/* Meta Info */}
        <div className="mt-6 space-y-4">
        
          <div className="flex items-center gap-4">
            <div className="w-24 text-sm text-muted-foreground flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Due date
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={isOverdue ? 'text-destructive' : 'text-muted-foreground'}
                >
                  {dueDate || 'No due date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <div className="p-2">
                  <Calendar
                    mode="single"
                    selected={dueDate ? new Date(dueDate) : undefined}
                    onSelect={handleDueDateSelect}
                    initialFocus
                  />
                  <div className="flex items-center justify-end gap-2 p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        setDueDate('');
                        await updateTask(task.projectId, task.id, { dueDate: '' });
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            {isOverdue && (
              <span className="ml-2 text-xs font-medium text-destructive">Overdue</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <label className="text-sm text-muted-foreground block mb-2">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleSave}
            placeholder="Add more detail to this task..."
            className="min-h-[100px] resize-none"
          />
        </div>

        {/* Subtasks */}
        <div className="mt-6">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            + Add subtask
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">U</span>
          </div>
          <Input
            placeholder="Ask a question or post an update..."
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPanel;
