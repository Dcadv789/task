import React, { useState } from 'react';
import { Task } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  User, 
  Trash, 
  Edit,
  ChevronDown,
  ChevronUp,
  Flag,
  Tag,
  Repeat,
  Plus,
  ChevronRight
} from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import TaskForm from './TaskForm';

interface TaskCardProps {
  task: Task;
  showSubtasks?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, showSubtasks = true }) => {
  const { 
    toggleTaskCompletion, 
    deleteTask, 
    tasks,
    clients,
    updateTask,
    addTask
  } = useAppContext();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  
  const subtasks = tasks.filter(t => t.parentId === task.id);
  const client = clients.find(c => c.id === task.clientId);
  
  const priorityColors = {
    'baixa': 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    'média': 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'alta': 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200'
  };
  
  const priorityIcons = {
    'baixa': <Flag size={14} />,
    'média': <Flag size={14} />,
    'alta': <Flag size={14} />
  };

  const statusColors = {
    'em_aberto': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'em_andamento': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'concluido': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'nao_feito': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  const statusLabels = {
    'em_aberto': 'Em Aberto',
    'em_andamento': 'Em Andamento',
    'concluido': 'Concluído',
    'nao_feito': 'Não Feito'
  };

  const handleStatusChange = (newStatus: Task['status']) => {
    updateTask(task.id, { status: newStatus });
  };

  const isPastDue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  
  const handleAddSubtask = (subtaskData: Omit<Task, 'id' | 'createdAt'>) => {
    addTask({
      ...subtaskData,
      parentId: task.id,
      listId: task.listId,
      status: 'em_aberto'
    });
    setIsAddingSubtask(false);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm mb-3 transition-all ${
      task.completed ? 'opacity-75' : ''
    }`}>
      <div className="p-4">
        <div className="flex items-start">
          <button 
            className="flex-shrink-0 mt-1 mr-3"
            onClick={() => toggleTaskCompletion(task.id)}
          >
            {task.completed ? (
              <CheckCircle className="text-green-500 h-5 w-5" />
            ) : (
              <Circle className="text-gray-400 dark:text-gray-500 h-5 w-5" />
            )}
          </button>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {task.parentId && (
                  <ChevronRight size={16} className="text-gray-400 mr-2" />
                )}
                <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                  {task.title}
                </h3>
              </div>
              
              <div className="flex space-x-1 ml-2">
                <button 
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Editar tarefa"
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Excluir tarefa"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
            
            {isExpanded && task.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 mb-3">{task.description}</p>
            )}
            
            <div className="flex flex-wrap gap-2 mt-2">
              {task.dueDate && (
                <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
                  isPastDue ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  <Clock size={12} className="mr-1" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}
              
              {!task.parentId && (
                <div className={`flex items-center text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                  {priorityIcons[task.priority]}
                  <span className="ml-1 capitalize">{task.priority}</span>
                </div>
              )}

              <div className={`flex items-center text-xs px-2 py-1 rounded-full ${statusColors[task.status]}`}>
                <span>{statusLabels[task.status]}</span>
              </div>
              
              {client && !task.parentId && (
                <div className="flex items-center text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                  <User size={12} className="mr-1" />
                  <span>{client.name}</span>
                </div>
              )}
              
              {task.recurrence && !task.parentId && (
                <div className="flex items-center text-xs px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
                  <Repeat size={12} className="mr-1" />
                  <span>Recorrente</span>
                </div>
              )}
              
              {!task.parentId && task.tags && task.tags.length > 0 && (isExpanded || task.tags.length === 1) && (
                task.tags.map(tag => (
                  <div 
                    key={tag} 
                    className="flex items-center text-xs px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-full"
                  >
                    <Tag size={12} className="mr-1" />
                    <span>{tag}</span>
                  </div>
                ))
              )}
              
              {!task.parentId && !isExpanded && task.tags && task.tags.length > 1 && (
                <div className="flex items-center text-xs px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                  <Tag size={12} className="mr-1" />
                  <span>+{task.tags.length - 1}</span>
                </div>
              )}
            </div>

            {!task.parentId && (
              <div className="mt-3">
                <button
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                  onClick={() => setIsAddingSubtask(true)}
                >
                  <Plus size={14} className="mr-1" />
                  Adicionar subtarefa
                </button>
              </div>
            )}
            
            {isAddingSubtask && (
              <div className="mt-3">
                <TaskForm
                  onClose={() => setIsAddingSubtask(false)}
                  onSubmit={handleAddSubtask}
                  isSubtask
                  parentTask={task}
                />
              </div>
            )}
            
            {showSubtasks && subtasks.length > 0 && isExpanded && (
              <div className="mt-4 space-y-2">
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Subtarefas ({subtasks.filter(s => s.completed).length}/{subtasks.length})</h4>
                <div className="space-y-2">
                  {subtasks.map(subtask => (
                    <TaskCard 
                      key={subtask.id} 
                      task={subtask} 
                      showSubtasks={false}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {showSubtasks && subtasks.length > 0 && !isExpanded && (
              <div className="mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {subtasks.filter(s => s.completed).length}/{subtasks.length} subtarefas concluídas
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {(task.description || subtasks.length > 0 || task.tags.length > 1) && !task.parentId && (
        <div 
          className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-xs text-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-center">
            {isExpanded ? (
              <>
                <ChevronUp size={14} className="mr-1" />
                <span>Recolher</span>
              </>
            ) : (
              <>
                <ChevronDown size={14} className="mr-1" />
                <span>Expandir</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;