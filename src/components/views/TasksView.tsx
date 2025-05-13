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
  Calendar
} from 'lucide-react';
import TaskForm from '../tasks/TaskForm';

export const TasksView: React.FC = () => {
  const { 
    tasks, 
    lists, 
    clients, 
    selectedListId, 
    selectedClientId,
    searchQuery
  } = useAppContext();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterOptions, setFilterOptions] = useState({
    showCompleted: true,
    priority: 'todas' as 'todas' | 'baixa' | 'média' | 'alta',
    status: 'todas' as 'todas' | 'em_aberto' | 'em_andamento' | 'concluido' | 'nao_feito',
    clientId: 'todos' as string | 'todos',
    listId: 'todas' as string | 'todas',
    sortBy: 'dueDate' as 'dueDate' | 'priority' | 'createdAt',
    date: '' as string,
    dateRange: '' as '' | 'hoje' | 'semana' | 'mes'
  });
  
  // Filtrar tarefas
  const filteredTasks = tasks.filter(task => {
    // Filtrar por lista selecionada na sidebar
    if (selectedListId && task.listId !== selectedListId) return false;
    
    // Filtrar por cliente selecionado na sidebar
    if (selectedClientId && task.clientId !== selectedClientId) return false;
    
    // Filtrar por lista (do filtro)
    if (filterOptions.listId !== 'todas' && task.listId !== filterOptions.listId) return false;
    
    // Filtrar por cliente (do filtro)
    if (filterOptions.clientId !== 'todos' && task.clientId !== filterOptions.clientId) return false;
    
    // Filtrar por status
    if (filterOptions.status !== 'todas' && task.status !== filterOptions.status) return false;
    
    // Filtrar por status de conclusão
    if (!filterOptions.showCompleted && task.completed) return false;
    
    // Filtrar por prioridade
    if (filterOptions.priority !== 'todas' && task.priority !== filterOptions.priority) return false;
    
    // Filtrar por data específica
    if (filterOptions.date && task.dueDate) {
      const taskDate = new Date(task.dueDate);
      const filterDate = new Date(filterOptions.date);
      if (
        taskDate.getFullYear() !== filterDate.getFullYear() ||
        taskDate.getMonth() !== filterDate.getMonth() ||
        taskDate.getDate() !== filterDate.getDate()
      ) {
        return false;
      }
    }

    // Filtrar por intervalo de data
    if (filterOptions.dateRange && task.dueDate) {
      const taskDate = new Date(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filterOptions.dateRange === 'hoje') {
        if (
          taskDate.getFullYear() !== today.getFullYear() ||
          taskDate.getMonth() !== today.getMonth() ||
          taskDate.getDate() !== today.getDate()
        ) {
          return false;
        }
      } else if (filterOptions.dateRange === 'semana') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        if (taskDate < weekStart || taskDate > weekEnd) {
          return false;
        }
      } else if (filterOptions.dateRange === 'mes') {
        if (
          taskDate.getFullYear() !== today.getFullYear() ||
          taskDate.getMonth() !== today.getMonth()
        ) {
          return false;
        }
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
      date: '' // Limpa a data específica quando seleciona um intervalo
    }));
  };
  
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
          {/* Alternar visualização */}
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
          
          {/* Botão Nova Tarefa */}
          <button 
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            onClick={() => setIsCreating(true)}
          >
            <Plus size={18} className="mr-1" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Status */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              className="w-full rounded-md border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500"
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
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Prioridade
            </label>
            <select
              className="w-full rounded-md border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500"
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
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Lista
            </label>
            <select
              className="w-full rounded-md border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500"
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
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Cliente
            </label>
            <select
              className="w-full rounded-md border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500"
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
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Data Específica
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                className="flex-1 rounded-md border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500"
                value={filterOptions.date}
                onChange={(e) => setFilterOptions({
                  ...filterOptions,
                  date: e.target.value,
                  dateRange: '' // Limpa o intervalo quando seleciona uma data específica
                })}
              />
              <button
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  filterOptions.dateRange === 'hoje'
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                } border`}
                onClick={() => handleDateRangeClick('hoje')}
              >
                Hoje
              </button>
              <button
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  filterOptions.dateRange === 'semana'
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                } border`}
                onClick={() => handleDateRangeClick('semana')}
              >
                Esta Semana
              </button>
              <button
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  filterOptions.dateRange === 'mes'
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                } border`}
                onClick={() => handleDateRangeClick('mes')}
              >
                Este Mês
              </button>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div className="flex items-center space-x-6">
              <label className="flex items-center text-sm text-gray-600">
                <input 
                  type="checkbox" 
                  className="mr-2 h-4 w-4 rounded border-gray-300"
                  checked={filterOptions.showCompleted}
                  onChange={() => setFilterOptions({
                    ...filterOptions,
                    showCompleted: !filterOptions.showCompleted
                  })}
                />
                Mostrar tarefas concluídas
              </label>

              <select
                className="rounded-md border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500"
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
            </div>

            <button
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={() => setFilterOptions({
                showCompleted: true,
                priority: 'todas',
                status: 'todas',
                clientId: 'todos',
                listId: 'todas',
                sortBy: 'dueDate',
                date: '',
                dateRange: ''
              })}
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </div>
      
      {isCreating && (
        <div className="mb-6">
          <TaskForm 
            onClose={() => setIsCreating(false)} 
            preselectedListId={selectedListId}
            preselectedClientId={selectedClientId}
          />
        </div>
      )}

      {editingTaskId && (
        <div className="mb-6">
          <TaskForm 
            taskId={editingTaskId}
            onClose={() => setEditingTaskId(null)}
          />
        </div>
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
            onClick={() => setIsCreating(true)}
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