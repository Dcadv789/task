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
  X
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterOptions, setFilterOptions] = useState({
    showCompleted: true,
    priority: 'todas' as 'todas' | 'baixa' | 'média' | 'alta',
    status: 'todas' as 'todas' | 'em_aberto' | 'em_andamento' | 'concluido' | 'nao_feito',
    clientId: 'todos' as string | 'todos',
    listId: 'todas' as string | 'todas',
    sortBy: 'dueDate' as 'dueDate' | 'priority' | 'createdAt'
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
      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
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
              sortBy: 'dueDate'
            })}
          >
            Limpar filtros
          </button>
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
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksView;