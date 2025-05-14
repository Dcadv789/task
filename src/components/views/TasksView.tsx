import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Task } from '../../types';
import TaskHeader from '../tasks/TaskHeader';
import TaskFilters from '../tasks/TaskFilters';
import TaskList from '../tasks/TaskList';
import EmptyTaskState from '../tasks/EmptyTaskState';
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

    const taskDate = adjustTimezone(new Date(task.dueDate));
    
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
      const startDate = adjustTimezone(new Date(filterOptions.startDate));
      startDate.setHours(0, 0, 0, 0);
      const endDate = adjustTimezone(new Date(filterOptions.endDate));
      endDate.setHours(23, 59, 59, 999);
      return taskOccursInRange(task, startDate, endDate);
    }
    
    // Filtrar por intervalo predefinido
    if (filterOptions.dateRange) {
      const today = adjustTimezone(new Date());
      today.setHours(0, 0, 0, 0);

      if (filterOptions.dateRange === 'hoje') {
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        if (!task.dueDate) return false;
        const taskDate = adjustTimezone(new Date(task.dueDate));
        return isSameDay(taskDate, today);
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

  const handleFilterChange = (newFilters: Partial<typeof filterOptions>) => {
    setFilterOptions(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilterOptions({
      showCompleted: true,
      priority: 'todas',
      status: 'todas',
      clientId: 'todos',
      listId: 'todas',
      sortBy: 'dueDate',
      startDate: '',
      endDate: '',
      dateRange: ''
    });
  };

  return (
    <div className="h-full flex flex-col">
      <TaskHeader
        title={getViewTitle()}
        totalTasks={sortedTasks.length}
        completedTasks={tasks.filter(t => t.completed).length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewTask={() => setShowNewTaskModal(true)}
      />

      <TaskFilters
        filterOptions={filterOptions}
        showFilters={showFilters}
        onFilterChange={handleFilterChange}
        onToggleFilters={() => setShowFilters(!showFilters)}
        activeFiltersCount={getActiveFiltersCount()}
        onDateRangeClick={handleDateRangeClick}
        onClearFilters={handleClearFilters}
        lists={lists}
        clients={clients}
      />
      
      {sortedTasks.length === 0 ? (
        <EmptyTaskState
          hasSearchQuery={!!searchQuery}
          onNewTask={() => setShowNewTaskModal(true)}
        />
      ) : (
        <TaskList
          tasks={sortedTasks}
          viewMode={viewMode}
          onEditTask={setEditingTaskId}
        />
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
    </div>
  );
};

export default TasksView;