import React from 'react';
import { LayoutList, LayoutGrid, Plus } from 'lucide-react';

interface TaskHeaderProps {
  title: string;
  totalTasks: number;
  completedTasks: number;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  onNewTask: () => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({
  title,
  totalTasks,
  completedTasks,
  viewMode,
  onViewModeChange,
  onNewTask
}) => {
  return (
    <div className="mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-500">
          {totalTasks} {totalTasks === 1 ? 'tarefa' : 'tarefas'} • {completedTasks} concluídas
        </p>
      </div>
      
      <div className="flex space-x-2">
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button 
            className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            onClick={() => onViewModeChange('list')}
            aria-label="Visualização em lista"
          >
            <LayoutList size={18} />
          </button>
          <button 
            className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            onClick={() => onViewModeChange('grid')}
            aria-label="Visualização em grade"
          >
            <LayoutGrid size={18} />
          </button>
        </div>
        
        <button 
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          onClick={onNewTask}
        >
          <Plus size={18} className="mr-1" />
          <span>Nova Tarefa</span>
        </button>
      </div>
    </div>
  );
};

export default TaskHeader;