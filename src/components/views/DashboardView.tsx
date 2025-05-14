import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  CheckSquare, 
  Clock, 
  Users, 
  AlertTriangle,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import TaskCard from '../tasks/TaskCard';
import { adjustTimezone, isSameDay } from '../../utils/dateUtils';

export const DashboardView: React.FC = () => {
  const { tasks, clients } = useAppContext();
  
  // Obter tarefas do dia usando as funções de ajuste de timezone
  const today = adjustTimezone(new Date());
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = adjustTimezone(new Date(today));
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const tasksForToday = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = adjustTimezone(new Date(task.dueDate));
    taskDate.setHours(0, 0, 0, 0);
    return isSameDay(taskDate, today);
  });
  
  // Estatísticas gerais
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate || t.completed) return false;
    const taskDate = adjustTimezone(new Date(t.dueDate));
    return taskDate < today;
  }).length;
  
  // Estatísticas por status
  const tasksByStatus = {
    'em_aberto': tasks.filter(t => t.status === 'em_aberto').length,
    'em_andamento': tasks.filter(t => t.status === 'em_andamento').length,
    'concluido': tasks.filter(t => t.status === 'concluido').length,
    'nao_feito': tasks.filter(t => t.status === 'nao_feito').length
  };
  
  // Estatísticas por cliente
  const tasksByClient = clients.map(client => ({
    client,
    total: tasks.filter(t => t.clientIds?.includes(client.id) ?? false).length,
    completed: tasks.filter(t => t.clientIds?.includes(client.id) && t.completed).length
  }));
  
  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Tarefas</p>
              <p className="text-2xl font-semibold text-gray-900">{totalTasks}</p>
            </div>
            <CheckSquare className="h-8 w-8 text-blue-500" />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {completedTasks} concluídas ({Math.round((completedTasks / totalTasks) * 100)}%)
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tarefas Hoje</p>
              <p className="text-2xl font-semibold text-gray-900">{tasksForToday.length}</p>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {tasksForToday.filter(t => t.completed).length} concluídas
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes Ativos</p>
              <p className="text-2xl font-semibold text-gray-900">{clients.length}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Com {tasks.filter(t => t.clientIds?.length > 0).length} tarefas
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tarefas Atrasadas</p>
              <p className="text-2xl font-semibold text-gray-900">{overdueTasks}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Precisam de atenção
          </p>
        </div>
      </div>

      {/* Tarefas de Hoje */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Tarefas para Hoje</h2>
        </div>
        <div className="p-4">
          {tasksForToday.length > 0 ? (
            <div className="space-y-3">
              {tasksForToday.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhuma tarefa programada para hoje
            </p>
          )}
        </div>
      </div>

      {/* Estatísticas por Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Por Status</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {Object.entries(tasksByStatus).map(([status, count]) => {
                const percentage = Math.round((count / totalTasks) * 100);
                return (
                  <div key={status} className="flex items-center">
                    <div className="w-32 text-sm text-gray-600">
                      {status === 'em_aberto' && 'Em Aberto'}
                      {status === 'em_andamento' && 'Em Andamento'}
                      {status === 'concluido' && 'Concluído'}
                      {status === 'nao_feito' && 'Não Feito'}
                    </div>
                    <div className="flex-1 ml-4">
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            status === 'concluido' ? 'bg-green-500' :
                            status === 'em_andamento' ? 'bg-yellow-500' :
                            status === 'em_aberto' ? 'bg-blue-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm text-gray-600">
                      {count}
                    </div>
                    <div className="w-16 text-right text-sm text-gray-400">
                      {percentage}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Estatísticas por Cliente */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Por Cliente</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {tasksByClient.map(({ client, total, completed }) => {
                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                return (
                  <div key={client.id} className="flex items-center">
                    <div className="w-32 text-sm text-gray-600 truncate">
                      {client.name}
                    </div>
                    <div className="flex-1 ml-4">
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-32 text-right text-sm">
                      <span className="text-gray-600">{completed}</span>
                      <span className="text-gray-400">/{total}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;