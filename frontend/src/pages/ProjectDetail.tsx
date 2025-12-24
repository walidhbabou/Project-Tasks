import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, List, Calendar as CalendarIcon, FileText, Search, Filter, ChevronDown, Trash2, MoreHorizontal } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TaskItem from '@/components/TaskItem';
import TaskDetailPanel from '@/components/TaskDetailPanel';
import TaskStatus from '@/components/TaskStatus';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useProjects } from '@/contexts/ProjectContext';
import { Task, TaskStatus as TaskStatusType } from '@/types';
import { cn } from '@/lib/utils';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Swal from 'sweetalert2';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, addTask, deleteTask, toggleTaskComplete, updateTaskStatus, updateTask, getProjectProgress } = useProjects();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [search, setSearch] = useState('');

  const project = projects.find((p) => p.id === id);

  useEffect(() => {
    if (!project) {
      navigate('/dashboard');
    }
  }, [project, navigate]);

  if (!project) return null;

  const progress = getProjectProgress(project.id);
  const completedToday = project.tasks.filter((t) => t.completed).length;

  // Group tasks by status (Kanban columns)
  const columns = [
    { id: 'NOT_STARTED' as TaskStatusType, title: 'Backlog', color: 'bg-gray-200' },
    { id: 'IN_PROGRESS' as TaskStatusType, title: 'In progress', color: 'bg-yellow-200' },
    { id: 'COMPLETED' as TaskStatusType, title: 'Done', color: 'bg-green-200' },
  ];

  const tasksByStatus = columns.reduce((acc, column) => {
    acc[column.id] = project.tasks.filter((task) => 
      (task.status || 'NOT_STARTED') === column.id
    );
    return acc;
  }, {} as Record<TaskStatusType, Task[]>);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(project.id, newTaskTitle.trim(), undefined, newTaskDueDate || undefined);
      setNewTaskTitle('');
      setNewTaskDueDate('');
      setIsAddingTask(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    // Get the target status from the destination column
    const targetStatus = destination.droppableId as TaskStatusType;
    const targetColumn = columns.find(col => col.id === targetStatus);
    
    if (!targetColumn) return;

    // Update the task with the new status
    const task = project.tasks.find(t => t.id === draggableId);
    if (!task) return;

    // If moving to COMPLETED column, mark as completed
    if (targetStatus === 'COMPLETED') {
      updateTask(project.id, draggableId, {
        ...task,
        status: targetStatus,
        completed: true,
      });
    } else {
      // Otherwise, just update the status
      updateTask(project.id, draggableId, {
        ...task,
        status: targetStatus,
        completed: false,
      });
    }
  };

  const confirmDelete = async (taskId: string) => {
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
      deleteTask(project.id, taskId);
    }
  };

  const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(true);

  const tabs = [
    { id: 'list', label: 'List', icon: List },

  ];

  // Filter tasks based on showOnlyIncomplete flag
  const baseTasks = showOnlyIncomplete 
    ? project.tasks.filter((t) => !t.completed)
    : project.tasks;

  const filteredTasks = baseTasks.filter((t) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(term) ||
      (t.description || '').toLowerCase().includes(term)
    );
  });

  const filteredTasksByStatus = columns.reduce((acc, column) => {
    let columnTasks = filteredTasks.filter((task) => 
      (task.status || 'NOT_STARTED') === column.id
    );
    
    // For the COMPLETED column, always show completed tasks even if showOnlyIncomplete is true
    if (column.id === 'COMPLETED' && showOnlyIncomplete) {
      columnTasks = project.tasks.filter((task) => 
        (task.status || 'NOT_STARTED') === column.id && task.completed
      );
    }
    
    acc[column.id] = columnTasks;
    return acc;
  }, {} as Record<TaskStatusType, Task[]>);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b border-border bg-card p-4">
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: project.color }}
              >
                <span className="text-white font-semibold text-lg">
                  {project.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  {project.name}
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-48"
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-foreground text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </header>

          {/* Progress Bar */}
          <div className="px-4 py-2 border-b border-border bg-card">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {completedToday} task{completedToday !== 1 ? 's' : ''} completed today
              </span>
              <div className="flex-1 flex items-center gap-2">
                <Progress value={progress} indicatorColor={project.color} className="max-w-xs" />
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant={showOnlyIncomplete ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setShowOnlyIncomplete(true)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Incomplete tasks
                </Button>
                <Button 
                  variant={!showOnlyIncomplete ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setShowOnlyIncomplete(false)}
                >
                  <MoreHorizontal className="w-4 h-4 mr-2" />
                  All tasks
                </Button>
              </div>
            </div>
          </div>

          {/* Kanban Board */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex-1 overflow-auto p-4">
              <div className="flex gap-4 h-full">
                {columns.map((column) => (
                  <div key={column.id} className="flex-1 min-w-[300px] flex flex-col">
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-3 h-3 rounded-full', column.color)} />
                        <h3 className="font-semibold text-sm">{column.title}</h3>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                          {filteredTasksByStatus[column.id]?.length || 0}
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" className="w-6 h-6">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Tasks */}
                    <Droppable droppableId={column.id}>
                      {(dropProvided) => (
                        <div
                          ref={dropProvided.innerRef}
                          {...dropProvided.droppableProps}
                          className="flex-1 space-y-2 overflow-y-auto"
                        >
                          {filteredTasksByStatus[column.id]?.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(dragProvided, snapshot) => (
                                <Card
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  className={cn(
                                    'p-3 cursor-pointer hover:shadow-md transition-all group',
                                    selectedTask?.id === task.id && 'ring-2 ring-primary',
                                    snapshot.isDragging && 'shadow-lg opacity-95',
                                    task.status === 'COMPLETED' && 'bg-green-50 border-l-4 border-green-500',
                                    task.status === 'IN_PROGRESS' && 'bg-yellow-50 border-l-4 border-yellow-500',
                                    task.status === 'NOT_STARTED' && 'bg-gray-50 border-l-4 border-gray-400'
                                  )}
                                  onClick={() => setSelectedTask(task)}
                                >
                                  <div className="flex items-start gap-2">
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <TaskStatus
                                        status={task.status || 'NOT_STARTED'}
                                        onClick={() => updateTaskStatus(project.id, task.id)}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={cn(
                                        'text-sm font-medium mb-1',
                                        task.completed && 'line-through text-muted-foreground'
                                      )}>
                                        {task.title}
                                      </p>
                                      {task.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                          {task.description}
                                        </p>
                                      )}
                                      {task.dueDate && (
                                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                          <CalendarIcon className="w-3 h-3" />
                                          <span>{task.dueDate}</span>
                                        </div>
                                      )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        confirmDelete(task.id);
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                  </div>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                          {dropProvided.placeholder}
                          
                          {/* Add Task Button in Column */}
                          {column.id === 'NOT_STARTED' && (
                            <div className="mt-2">
                              {isAddingTask ? (
                                <Card className="p-2">
                                  <Input
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="Task name..."
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleAddTask();
                                      if (e.key === 'Escape') setIsAddingTask(false);
                                    }}
                                    className="mb-2"
                                  />
                                  <Input
                                    type="date"
                                    value={newTaskDueDate}
                                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                                    className="mb-2"
                                  />
                                  <div className="flex gap-2">
                                    <Button onClick={handleAddTask} size="sm" className="flex-1">
                                      Add
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setIsAddingTask(false)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </Card>
                              ) : (
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start text-muted-foreground"
                                  onClick={() => setIsAddingTask(true)}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Task
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
              {filteredTasks.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-muted-foreground">
                    No tasks yet. Click "Add Task" to create one.
                  </p>
                </div>
              )}
            </div>
          </DragDropContext>
        </div>

        {/* Task Detail Panel */}
        {selectedTask && (
          <TaskDetailPanel
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
          />
        )}
      </main>
    </div>
  );
};

export default ProjectDetail;
