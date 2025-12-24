import React from 'react';
import { TaskStatus as TaskStatusType } from '@/types';
import { Circle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskStatusProps {
  status: TaskStatusType;
  onClick?: () => void;
  className?: string;
}

const TaskStatus: React.FC<TaskStatusProps> = ({ status, onClick, className }) => {
  const isCompleted = status === 'COMPLETED';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
        isCompleted
          ? 'bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600'
          : 'border-gray-300 hover:border-green-500',
        onClick && 'cursor-pointer',
        !onClick && 'cursor-default',
        className
      )}
      title={isCompleted ? 'Marquer comme non terminé' : 'Marquer comme terminé'}
    >
      {isCompleted && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </button>
  );
};

export default TaskStatus;
