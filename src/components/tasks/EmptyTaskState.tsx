import React from 'react';
import { ClipboardList, Plus } from 'lucide-react';

interface EmptyTaskStateProps {
  hasSearchQuery: boolean;
  onNewTask: () => void;
}

const EmptyTaskState: React.FC<EmptyTaskStateProps> = ({ hasSearchQuery, onNewTask }) => {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center p-6">
      <ClipboardList size={48} className="text-gray-300 mb-3" />
      <h2 className="text-xl font-medium text-gray-700 mb-1">Nenhuma tarefa encontrada</h2>
      <p className="text-gray-500 mb-4">
        {hasSearchQuery 
          ? 'Nenhuma tarefa corresponde à sua busca'
          : 'Adicione uma nova tarefa para começar'
        }
      </p>
      <button 
        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        onClick={onNewTask}
      >
        <Plus size={18} className="mr-1" />
        <span>Nova Tarefa</span>
      </button>
    </div>
  );
};

export default EmptyTaskState;