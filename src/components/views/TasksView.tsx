import React, { useState } from 'react';
import TaskCard from '../tasks/TaskCard';
import { useAppContext } from '../../context/AppContext';
import { TaskList, Client, Task } from '../../types';
import { 
  Plus, 
  Filter,
  ListFilter,
  CheckSquare,
  ClipboardList,
  LayoutGrid,
  LayoutList,
  X,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import TaskForm from '../tasks/TaskForm';
import TaskModal from '../tasks/TaskModal';
import { adjustTimezone, isSameDay } from '../../utils/dateUtils';

export const TasksView: React.FC = () => {
  const { 
    tasks, 
    lists, 
    clients, 
    selectedListId, 
    selectedClientId,
    searchQuery
  } = useAppContext();
  
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFilters, setShowFilters] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    showCompleted: true,
    priority: 'todas' as 'todas' | 'baixa' | 'média' | 'alta',
    status: 'todas' as 'todas' | 'em_aberto' | 'em_andamento' | 'concluido' | 'nao_feito',
    clientId: 'todos' as string | 'todos',
    listId: 'todas' as string | 'todas',
    sortBy: 'dueDate' as 'dueDate' | 'priority' | 'createdAt',
    startDate: '',
    endDate: '',
    dateRange: '' as '' | 'hoje' | 'semana' | 'mes'
  });

  // Função auxiliar para gerar ocorrências de tarefas recorrentes
  const generateRecurringTaskOccurrences = (task: Task, startDate: Date, endDate: Date): Date[] => {
    if (!task.recurrence || !task.dueDate) return [];

    const dates: Date[] = [];
    const taskStartDate = new Date(task.dueDate);
    let currentDate = new Date(startDate);
    currentDate.setHours(taskStartDate.getHours(), taskStartDate.getMinutes());

    while (currentDate <= endDate) {
      const { type, interval, daysOfWeek } = task.recurrence;

      switch (type) {
        case 'diária':
          if (!daysOfWeek || daysOfWeek.includes(currentDate.getDay())) {
            dates.push(new Date(currentDate));
          }
          currentDate.setDate(currentDate.getDate() + 1);
          break;

        case 'semanal':
          if (daysOfWeek && daysOfWeek.includes(currentDate.getDay())) {
            const weekNumber = Math.floor((currentDate.getTime() - taskStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
            if (weekNumber % interval === 0) {
              dates.push(new Date(currentDate));
            }
          }
          currentDate.setDate(currentDate.getDate() + 1);
          break;

        case 'mensal':
          if (currentDate.getDate() === taskStartDate.getDate()) {
            const monthDiff = (currentDate.getFullYear() - taskStartDate.getFullYear()) * 12 + 
                            (currentDate.getMonth() - taskStartDate.getMonth());
            if (monthDiff % interval === 0) {
              dates.push(new Date(currentDate));
            }
          }
          currentDate.setDate(currentDate.getDate() + 1);
          break;

        case 'anual':
          if (currentDate.getMonth() === taskStartDate.getMonth() && 
              currentDate.getDate() === taskStartDate.getDate()) {
            const yearDiff = currentDate.getFullYear() - taskStartDate.getFullYear();
            if (yearDiff % interval === 0) {
              dates.push(new Date(currentDate));
            }
          }
          currentDate.setDate(currentDate.getDate() + 1);
          break;
      }
    }

    return dates;
  };

  // Função para verificar se uma tarefa ocorre em um intervalo de datas
  const taskOccursInRange = (task: Task, startDate: Date, endDate: Date): boolean => {
    if (!task.dueDate) return false;

    const taskDate = new Date(task.dueDate);
    
    // Para tarefas não recorrentes
    if (!task.recurrence) {
      return taskDate >= startDate && taskDate <= endDate;
    }

    // Para tarefas recorrentes
    const occurrences = generateRecurringTaskOccurrences(task, startDate, endDate);
    return occurrences.length > 0;
  };
  
  // Filtrar tarefas
  const filteredTasks = tasks.filter(task => {
    // Filtrar por lista selecionada na sidebar
    if (selectedListId && task.listId !== selectedListId) return false;
    
    // Filtrar por cliente selecionado na sidebar
    if (selectedClientId && !task.clientIds?.includes(selectedClientId)) return false;
    
    // Filtrar por lista (do filtro)
    if (filterOptions.listId !== 'todas' && task.listId !== filterOptions.listId) return false;
    
    // Filtrar por cliente (do filtro)
    if (filterOptions.clientId !== 'todos' && !task.clientIds?.includes(filterOptions.clientId)) return false;
    
    // Filtrar por status
    if (filterOptions.status !== 'todas' && task.status !== filterOptions.status) return false;
    
    // Filtrar por status de conclusão
    if (!filterOptions.showCompleted && task.completed) return false;
    
    // Filtrar por prioridade
    if (filterOptions.priority !== 'todas' && task.priority !== filterOptions.priority) return false;
    
    // Filtrar por intervalo de datas específico
    if (filterOptions.startDate && filterOptions.endDate) {
      const startDate = new Date(filterOptions.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(filterOptions.endDate);
      endDate.setHours(23, 59, 59, 999);
      return taskOccursInRange(task, startDate, endDate);
    }
    
    // Filtrar por intervalo predefinido
    if (filterOptions.dateRange) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filterOptions.dateRange === 'hoje') {
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        return taskOccursInRange(task, today, endOfDay);
      }

      if (filterOptions.dateRange === 'semana') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return taskOccursInRange(task, weekStart, weekEnd);
      }

      if (filterOptions.dateRange === 'mes') {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        return taskOccursInRange(task, monthStart, monthEnd);
      }
    }
    
    // Filtrar por busca
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !task.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Não mostrar subtarefas na lista principal
    if (task.parentId) return false;
    
    return true;
  });
  
  // Ordenar tarefas
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (filterOptions.sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (filterOptions.sortBy === 'priority') {
      const priorityWeight = { 'alta': 0, 'média': 1, 'baixa': 2 };
      return priorityWeight[a.priority] - priorityWeight[b.priority];
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
  
  // Obter nome da lista ou cliente selecionado
  const selectedList = selectedListId ? lists.find(list => list.id === selectedListId) : null;
  const selectedClient = selectedClientId ? clients.find(client => client.id === selectedClientId) : null;
  
  const getViewTitle = () => {
    if (selectedList) return selectedList.name;
    if (selectedClient) return `Cliente: ${selectedClient.name}`;
    return 'Todas as Tarefas';
  };

  const statusLabels = {
    'todas': 'Todos os status',
    'em_aberto': 'Em Aberto',
    'em_andamento': 'Em Andamento',
    'concluido': 'Concluído',
    'nao_feito': 'Não Feito'
  };

  const handleDateRangeClick = (range: '' | 'hoje' | 'semana' | 'mes') => {
    setFilterOptions(prev => ({
      ...prev,
      dateRange: prev.dateRange === range ? '' : range,
      startDate: '',
      endDate: ''
    }));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterOptions.status !== 'todas') count++;
    if (filterOptions.priority !== 'todas') count++;
    if (filterOptions.listId !== 'todas') count++;
    if (filterOptions.clientId !== 'todos') count++;
    if (filterOptions.dateRange || (filterOptions.startDate && filterOptions.endDate)) count++;
    if (!filterOptions.showCompleted) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{getViewTitle()}</h1>
          <p className="text-gray-500">
            {sortedTasks.length} {sortedTasks.length === 1 ? 'tarefa' : 'tarefas'} • {tasks.filter(t => t.completed).length} concluídas
          </p>
        </div>
        
        <div className="flex space-x-2">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button 
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setViewMode('list')}
              aria-label="Visualização em lista"
            >
              <LayoutList size={18} />
            </button>
            <button 
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setViewMode('grid')}
              aria-label="Visualização em grade"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          
          <button 
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            onClick={() => setShowNewTaskModal(true)}
          >
            <Plus size={18} className="mr-1" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Cabeçalho dos Filtros */}
      <div className="mb-4 flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-gray-700 hover:text-gray-900"
          >
            <Filter size={20} className="mr-2" />
            <span className="font-medium">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-sm">
                {activeFiltersCount}
              </span>
            )}
            {showFilters ? <ChevronUp size={20} className="ml-2" /> : <ChevronDown size={20} className="ml-2" />}
          </button>

          {/* Filtros Rápidos */}
          <div className="flex items-center space-x-2">
            <button
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterOptions.dateRange === 'hoje'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleDateRangeClick('hoje')}
            >
              Hoje
            </button>
            <button
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterOptions.dateRange === 'semana'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleDateRangeClick('semana')}
            >
              Esta Semana
            </button>
            <button
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterOptions.dateRange === 'mes'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleDateRangeClick('mes')}
            >
              Este Mês
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <select
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:border-blue-500 focus:ring-blue-500 cursor-pointer hover:border-gray-400 transition-colors"
            value={filterOptions.sortBy}
            onChange={(e) => setFilterOptions({
              ...filterOptions,
              sortBy: e.target.value as any
            })}
          >
            <option value="dueDate">Ordenar por data</option>
            <option value="priority">Ordenar por prioridade</option>
            <option value="createdAt">Ordenar por criação</option>
          </select>

          {activeFiltersCount > 0 && (
            <button
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={() => setFilterOptions({
                showCompleted: true,
                priority: 'todas',
                status: 'todas',
                clientId: 'todos',
                listId: 'todas',
                sortBy: 'dueDate',
                startDate: '',
                endDate: '',
                dateRange: ''
              })}
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Painel de Filtros Expandido */}
      {showFilters && (
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Status */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:border-blue-500 focus:ring-blue-500 cursor-pointer hover:border-gray-400 transition-colors"
                value={filterOptions.status}
                onChange={(e) => setFilterOptions({
                  ...filterOptions,
                  status: e.target.value as any
                })}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Prioridade */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Prioridade
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:border-blue-500 focus:ring-blue-500 cursor-pointer hover:border-gray-400 transition-colors"
                value={filterOptions.priority}
                onChange={(e) => setFilterOptions({
                  ...filterOptions,
                  priority: e.target.value as any
                })}
              >
                <option value="todas">Todas as prioridades</option>
                <option value="baixa">Baixa</option>
                <option value="média">Média</option>
                <option value="alta">Alta</option>
              </select>
            </div>

            {/* Lista */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Lista
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:border-blue-500 focus:ring-blue-500 cursor-pointer hover:border-gray-400 transition-colors"
                value={filterOptions.listId}
                onChange={(e) => setFilterOptions({
                  ...filterOptions,
                  listId: e.target.value
                })}
              >
                <option value="todas">Todas as listas</option>
                {lists.map(list => (
                  <option key={list.id} value={list.id}>{list.name}</option>
                ))}
              </select>
            </div>

            {/* Cliente */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Cliente
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:border-blue-500 focus:ring-blue-500 cursor-pointer hover:border-gray-400 transition-colors"
                value={filterOptions.clientId}
                onChange={(e) => setFilterOptions({
                  ...filterOptions,
                  clientId: e.target.value
                })}
              >
                <option value="todos">Todos os clientes</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtros de Data */}
          <div className="mt-8 space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Intervalo de Datas Específico
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:border-blue-500 focus:ring-blue-500 cursor-pointer hover:border-gray-400 transition-colors"
                  value={filterOptions.startDate}
                  onChange={(e) => setFilterOptions({
                    ...filterOptions,
                    startDate: e.target.value,
                    endDate: e.target.value || filterOptions.endDate,
                    dateRange: ''
                  })}
                />
              </div>
              <span className="text-gray-500 font-medium">até</span>
              <div className="flex-1">
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:border-blue-500 focus:ring-blue-500 cursor-pointer hover:border-gray-400 transition-colors"
                  value={filterOptions.endDate}
                  min={filterOptions.startDate}
                  onChange={(e) => setFilterOptions({
                    ...filterOptions,
                    endDate: e.target.value,
                    dateRange: ''
                  })}
                />
              </div>
            </div>
          </div>

          {/* Opções Adicionais */}
          <div className="mt-8 flex items-center">
            <label className="flex items-center text-sm text-gray-700 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                checked={filterOptions.showCompleted}
                onChange={() => setFilterOptions({
                  ...filterOptions,
                  showCompleted: !filterOptions.showCompleted
                })}
              />
              Mostrar tarefas concluídas
            </label>
          </div>
        </div>
      )}

      {showNewTaskModal && (
        <TaskModal
          isOpen={showNewTaskModal}
          onClose={() => setShowNewTaskModal(false)}
          preselectedListId={selectedListId || undefined}
          preselectedClientIds={selectedClientId ? [selectedClientId] : undefined}
        />
      )}

      {editingTaskId && (
        <TaskModal
          isOpen={true}
          task={tasks.find(t => t.id === editingTaskId)}
          onClose={() => setEditingTaskId(null)}
        />
      )}
      
      {sortedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center p-6">
          <ClipboardList size={48} className="text-gray-300 mb-3" />
          <h2 className="text-xl font-medium text-gray-700 mb-1">Nenhuma tarefa encontrada</h2>
          <p className="text-gray-500 mb-4">
            {searchQuery 
              ? 'Nenhuma tarefa corresponde à sua busca'
              : 'Adicione uma nova tarefa para começar'
            }
          </p>
          <button 
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            onClick={() => setShowNewTaskModal(true)}
          >
            <Plus size={18} className="mr-1" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      ) : (
        <div className={`flex-1 overflow-y-auto ${
          viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : ''
        }`}>
          {sortedTasks.map((task: Task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEdit={() => setEditingTaskId(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksView;