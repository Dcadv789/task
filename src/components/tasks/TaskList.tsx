import React from 'react';
import { Task } from '../../types';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  viewMode: 'list' | 'grid';
  onEditTask: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, viewMode, onEditTask }) => {
  return (
    <div className={`flex-1 overflow-y-auto ${
      viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : ''
    }`}>
      {tasks.map((task: Task) => (
        <TaskCard 
          key={task.id} 
          task={task} 
          onEdit={() => onEditTask(task.id)}
        />
      ))}
    </div>
  );
};

export default TaskList;