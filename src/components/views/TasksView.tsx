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
  LayoutList
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
    sortBy: 'dueDate' as 'dueDate' | 'priority' | 'createdAt'
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtrar tarefas
  const filteredTasks = tasks.filter(task => {
    // Filtrar por lista
    if (selectedListId && task.listId !== selectedListId) return false;
    
    // Filtrar por cliente
    if (selectedClientId && task.clientId !== selectedClientId) return false;
    
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
      // Tarefas sem data ficam por último
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
          
          {/* Filtros */}
          <div className="relative">
            <button 
              className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Filtrar tarefas"
            >
              <Filter size={18} />
            </button>
            
            {showFilters && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3">
                <h3 className="font-medium text-gray-700 mb-2">Filtros</h3>
                
                <div className="mb-3">
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
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm text-gray-600 mb-1">Prioridade</label>
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
                
                <div className="mb-2">
                  <label className="block text-sm text-gray-600 mb-1">Ordenar por</label>
                  <select 
                    className="w-full rounded-md border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500"
                    value={filterOptions.sortBy}
                    onChange={(e) => setFilterOptions({
                      ...filterOptions,
                      sortBy: e.target.value as any
                    })}
                  >
                    <option value="dueDate">Data de vencimento</option>
                    <option value="priority">Prioridade</option>
                    <option value="createdAt">Data de criação</option>
                  </select>
                </div>
              </div>
            )}
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