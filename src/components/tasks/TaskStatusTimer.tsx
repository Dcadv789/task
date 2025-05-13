import React from 'react';
import { Task } from '../../types';
import { Clock } from 'lucide-react';

interface TaskStatusTimerProps {
  task: Task;
}

const TaskStatusTimer: React.FC<TaskStatusTimerProps> = ({ task }) => {
  if (task.status !== 'em_andamento' || !task.statusChangedAt) return null;

  const getTimeInProgress = () => {
    const startDate = new Date(task.statusChangedAt!);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      const diffInHours = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60));
        return `${diffInMinutes} minuto${diffInMinutes === 1 ? '' : 's'}`;
      }
      return `${diffInHours} hora${diffInHours === 1 ? '' : 's'}`;
    }
    return `${diffInDays} dia${diffInDays === 1 ? '' : 's'}`;
  };

  return (
    <div className="flex items-center text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
      <Clock size={14} className="mr-1" />
      <span>Em andamento há {getTimeInProgress()}</span>
    </div>
  );
};

export default TaskStatusTimer;