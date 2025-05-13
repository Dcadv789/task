import React from 'react';
import { Task } from '../../types';
import { X, Calendar, Flag, User, Tag, Clock } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose }) => {
  const priorityColors = {
    'baixa': 'bg-gray-100 text-gray-700',
    'média': 'bg-yellow-100 text-yellow-700',
    'alta': 'bg-red-100 text-red-700'
  };

  const statusColors = {
    'em_aberto': 'bg-blue-100 text-blue-700',
    'em_andamento': 'bg-yellow-100 text-yellow-700',
    'concluido': 'bg-green-100 text-green-700',
    'nao_feito': 'bg-red-100 text-red-700'
  };

  const statusLabels = {
    'em_aberto': 'Em Aberto',
    'em_andamento': 'Em Andamento',
    'concluido': 'Concluído',
    'nao_feito': 'Não Feito'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Detalhes da Tarefa</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-medium text-gray-900 mb-2">{task.title}</h3>
              <p className="text-gray-600">{task.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className={`flex items-center px-3 py-1 rounded-full ${priorityColors[task.priority]}`}>
                <Flag size={16} className="mr-2" />
                <span className="capitalize">{task.priority}</span>
              </div>

              <div className={`flex items-center px-3 py-1 rounded-full ${statusColors[task.status]}`}>
                <Clock size={16} className="mr-2" />
                <span>{statusLabels[task.status]}</span>
              </div>

              {task.dueDate && (
                <div className="flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                  <Calendar size={16} className="mr-2" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}
            </div>

            {task.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map(tag => (
                    <span
                      key={tag}
                      className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      <Tag size={14} className="mr-2" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {task.recurrence && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recorrência</h4>
                <p className="text-gray-600">
                  {`A cada ${task.recurrence.interval} ${
                    task.recurrence.type === 'diária' ? 'dia(s)' :
                    task.recurrence.type === 'semanal' ? 'semana(s)' :
                    task.recurrence.type === 'mensal' ? 'mês(es)' : 'ano(s)'
                  }`}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
          <div className="text-sm text-gray-500">
            Criada em {new Date(task.createdAt).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;