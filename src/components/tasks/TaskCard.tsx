import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Task } from '../../types';
import { 
  Circle,
  Clock, 
  Calendar, 
  Flag,
  ChevronDown,
  ChevronUp,
  Users,
  Tag,
  Trash,
  Edit,
  MessageSquare,
  Bell,
  ListPlus,
  CheckCircle2,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { formatDate, formatDateRelative } from '../../utils/dateUtils';
import TaskStatusTimer from './TaskStatusTimer';
import TaskObservations from './TaskObservations';
import TaskReminders from './TaskReminders';
import TaskModal from './TaskModal';
import TaskForm from './TaskForm';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import Notification from '../common/Notification';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { toggleTaskCompletion, deleteTask, clients, lists, updateTask } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showObservationsModal, setShowObservationsModal] = useState(false);
  const [showAddSubtaskModal, setShowAddSubtaskModal] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const list = lists.find(l => l.id === task.listId);
  const taskClients = clients.filter(c => task.clientIds.includes(c.id));

  const priorityColors = {
    'baixa': 'bg-blue-100 text-blue-700',
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

  const formatRecurrence = (task: Task) => {
    if (!task.recurrence) return null;
    
    const { type, interval } = task.recurrence;
    let text = `A cada ${interval} `;
    
    switch (type) {
      case 'diária':
        text += interval === 1 ? 'dia' : 'dias';
        break;
      case 'semanal':
        text += interval === 1 ? 'semana' : 'semanas';
        if (task.recurrence.daysOfWeek?.length) {
          const dias = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
          text += ` (${task.recurrence.daysOfWeek.map(d => dias[d]).join(', ')})`;
        }
        break;
      case 'mensal':
        text += interval === 1 ? 'mês' : 'meses';
        if (task.recurrence.dayOfMonth) {
          text += ` (dia ${task.recurrence.dayOfMonth})`;
        }
        break;
      case 'anual':
        text += interval === 1 ? 'ano' : 'anos';
        break;
    }
    
    return text;
  };

  const handleStatusChange = (newStatus: 'concluido' | 'nao_feito') => {
    updateTask(task.id, {
      status: newStatus,
      completed: newStatus === 'concluido'
    });
  };

  const handleSubtaskStatusChange = (subtaskId: string, completed: boolean) => {
    const updatedSubtasks = task.subtasks?.map(subtask => 
      subtask.id === subtaskId 
        ? { ...subtask, completed }
        : subtask
    );
    
    updateTask(task.id, { subtasks: updatedSubtasks });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks?.filter(subtask => subtask.id !== subtaskId);
    updateTask(task.id, { subtasks: updatedSubtasks });
  };

  const handleDeleteConfirm = () => {
    try {
      deleteTask(task.id);
      setShowDeleteModal(false);
      setNotification({
        type: 'success',
        message: 'Tarefa excluída com sucesso!'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Erro ao excluir a tarefa. Tente novamente.'
      });
    }
  };

  return (
    <>
      <div className={`bg-white rounded-lg shadow-sm border overflow-hidden transition-all duration-200 mb-4 ${
        task.status === 'nao_feito' 
          ? 'border-red-200 bg-red-50'
          : task.completed 
            ? 'border-green-200' 
            : 'border-gray-200 hover:border-blue-200'
      }`}>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <button
                onClick={() => handleStatusChange(task.status === 'concluido' ? 'em_aberto' : 'concluido')}
                className={`mt-1 p-1.5 rounded-md transition-colors ${
                  task.status === 'concluido'
                    ? 'text-green-500 hover:bg-green-50'
                    : task.status === 'nao_feito'
                      ? 'text-red-500 hover:bg-red-50'
                      : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                {task.status === 'concluido' || task.status === 'nao_feito' 
                  ? <CheckCircle2 size={22} /> 
                  : <Circle size={22} />
                }
              </button>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-lg font-medium ${
                      task.status === 'concluido'
                        ? 'text-green-500 line-through'
                        : task.status === 'nao_feito'
                        ? 'text-red-500 line-through'
                        : 'text-gray-900'
                    }`}>
                      {task.title}
                    </h3>
                    {task.subtasks && task.subtasks.length > 0 && (
                      <button
                        onClick={() => setShowSubtasks(!showSubtasks)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showSubtasks ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </button>
                    )}
                  </div>
                  
                  {task.description && (
                    <p className={`mt-2 text-sm px-1 ${
                      task.status === 'concluido' || task.status === 'nao_feito'
                        ? 'text-gray-400 line-through'
                        : 'text-gray-600'
                    }`}>
                      {task.description}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 px-1">
                  {/* Status */}
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                    statusColors[task.status]
                  }`}>
                    <Clock size={14} className="mr-1.5" />
                    {statusLabels[task.status]}
                  </span>

                  {/* Prioridade */}
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                    priorityColors[task.priority]
                  }`}>
                    <Flag size={14} className="mr-1.5" />
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>

                  {/* Data */}
                  {task.dueDate && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                      <Calendar size={14} className="mr-1.5" />
                      {formatDate(task.dueDate)}
                    </span>
                  )}

                  {/* Recorrência */}
                  {task.recurrence && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                      <RefreshCw size={14} className="mr-1.5" />
                      {formatRecurrence(task)}
                    </span>
                  )}

                  {/* Lista */}
                  {list && (
                    <span 
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{ backgroundColor: `${list.color}20`, color: list.color }}
                    >
                      {list.name}
                    </span>
                  )}

                  {/* Badge de Observações */}
                  {task.observations && task.observations.length > 0 && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                      <MessageSquare size={14} className="mr-1.5" />
                      {task.observations.length} {task.observations.length === 1 ? 'observação' : 'observações'}
                    </span>
                  )}

                  {/* Lembretes */}
                  {task.reminders && task.reminders.length > 0 && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                      <Bell size={14} className="mr-1.5" />
                      {task.reminders.length} {task.reminders.length === 1 ? 'lembrete' : 'lembretes'}
                    </span>
                  )}
                </div>

                {/* Clientes */}
                {taskClients.length > 0 && (
                  <div className="flex items-center space-x-2 px-1">
                    <Users size={14} className="text-gray-400" />
                    <div className="flex items-center space-x-1">
                      {taskClients.map((client, index) => (
                        <React.Fragment key={client.id}>
                          <span className="text-sm text-gray-600">{client.name}</span>
                          {index < taskClients.length - 1 && (
                            <span className="text-gray-400">•</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {task.tags.map(tag => (
                      <span 
                        key={tag}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-sm bg-gray-100 text-gray-600"
                      >
                        <Tag size={12} className="mr-1.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Subtarefas */}
                {showSubtasks && task.subtasks && task.subtasks.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-medium text-gray-700">Subtarefas</h4>
                    {task.subtasks.map(subtask => (
                      <div key={subtask.id} className="flex items-center justify-between group">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleSubtaskStatusChange(subtask.id, !subtask.completed)}
                            className={`p-1 rounded-md ${
                              subtask.completed ? 'text-green-500' : 'text-gray-400'
                            }`}
                          >
                            {subtask.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                          </button>
                          <span className={`text-sm ${
                            subtask.completed ? 'line-through text-gray-400' : 'text-gray-600'
                          }`}>
                            {subtask.title}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteSubtask(subtask.id)}
                          className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-1">
              <button
                onClick={() => setShowObservationsModal(true)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full"
                title="Observações e Lembretes"
              >
                <MessageSquare size={18} />
              </button>
              <button
                onClick={() => setShowAddSubtaskModal(true)}
                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-gray-100 rounded-full"
                title="Adicionar Subtarefa"
              >
                <ListPlus size={18} />
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                title="Editar"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-full"
                title="Excluir"
              >
                <Trash size={18} />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                title={isExpanded ? "Recolher" : "Expandir"}
              >
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-6 space-y-6 border-t border-gray-100 pt-6">
              <TaskStatusTimer task={task} />
              
              {/* Observações */}
              {task.observations && task.observations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Observações</h4>
                  {task.observations.map(obs => (
                    <div key={obs.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{obs.content}</span>
                        <span className="text-gray-400">{formatDateRelative(obs.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Lembretes */}
              {task.reminders && task.reminders.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Lembretes</h4>
                  {task.reminders.map(reminder => (
                    <div key={reminder.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <Bell size={14} className="mr-2 text-indigo-500" />
                          {reminder.time} {reminder.unit} antes do vencimento
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      {showEditModal && (
        <TaskModal
          task={task}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Modal de Observações e Lembretes */}
      {showObservationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Observações e Lembretes
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <TaskObservations task={task} onClose={() => setShowObservationsModal(false)} />
              <TaskReminders task={task} onClose={() => setShowObservationsModal(false)} />
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                onClick={() => setShowObservationsModal(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar Subtarefa */}
      {showAddSubtaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <TaskForm
              isSubtask={true}
              parentTask={task}
              onClose={() => setShowAddSubtaskModal(false)}
            />
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Excluir Tarefa"
        message="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
      />

      {/* Notificação */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};

export default TaskCard;