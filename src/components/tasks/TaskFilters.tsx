import React from 'react';
import { Filter, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';

interface FilterOptions {
  showCompleted: boolean;
  priority: 'todas' | 'baixa' | 'média' | 'alta';
  status: 'todas' | 'em_aberto' | 'em_andamento' | 'concluido' | 'nao_feito';
  clientId: string | 'todos';
  listId: string | 'todas';
  sortBy: 'dueDate' | 'priority' | 'createdAt';
  startDate: string;
  endDate: string;
  dateRange: '' | 'hoje' | 'semana' | 'mes';
}

interface TaskFiltersProps {
  filterOptions: FilterOptions;
  showFilters: boolean;
  onFilterChange: (newFilters: Partial<FilterOptions>) => void;
  onToggleFilters: () => void;
  activeFiltersCount: number;
  onDateRangeClick: (range: '' | 'hoje' | 'semana' | 'mes') => void;
  onClearFilters: () => void;
  lists: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; name: string }>;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  filterOptions,
  showFilters,
  onFilterChange,
  onToggleFilters,
  activeFiltersCount,
  onDateRangeClick,
  onClearFilters,
  lists,
  clients
}) => {
  return (
    <>
      <div className="mb-4 flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleFilters}
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

          <div className="flex items-center space-x-2">
            {['hoje', 'semana', 'mes'].map((range) => (
              <button
                key={range}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filterOptions.dateRange === range
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => onDateRangeClick(range as 'hoje' | 'semana' | 'mes')}
              >
                {range === 'hoje' ? 'Hoje' : 
                 range === 'semana' ? 'Esta Semana' : 
                 'Este Mês'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterOptions.showCompleted
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
            onClick={() => onFilterChange({ showCompleted: !filterOptions.showCompleted })}
          >
            {filterOptions.showCompleted ? (
              <>
                <Eye size={16} className="mr-2" />
                Mostrar Concluídas
              </>
            ) : (
              <>
                <EyeOff size={16} className="mr-2" />
                Ocultar Concluídas
              </>
            )}
          </button>

          <select
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:border-blue-500 focus:ring-blue-500 cursor-pointer hover:border-gray-400 transition-colors"
            value={filterOptions.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as 'dueDate' | 'priority' | 'createdAt' })}
          >
            <option value="dueDate">Ordenar por data</option>
            <option value="priority">Ordenar por prioridade</option>
            <option value="createdAt">Ordenar por criação</option>
          </select>

          {activeFiltersCount > 0 && (
            <button
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={onClearFilters}
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

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
                onChange={(e) => onFilterChange({ status: e.target.value as any })}
              >
                <option value="todas">Todos os status</option>
                <option value="em_aberto">Em Aberto</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluido">Concluído</option>
                <option value="nao_feito">Não Feito</option>
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
                onChange={(e) => onFilterChange({ priority: e.target.value as any })}
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
                onChange={(e) => onFilterChange({ listId: e.target.value })}
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
                onChange={(e) => onFilterChange({ clientId: e.target.value })}
              >
                <option value="todos">Todos os clientes</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtros de Data */}
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Intervalo de Datas Específico
            </label>
            <div className="flex items-center gap-4">
              <div className="w-48">
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:border-blue-500 focus:ring-blue-500 cursor-pointer hover:border-gray-400 transition-colors"
                  value={filterOptions.startDate}
                  onChange={(e) => onFilterChange({
                    startDate: e.target.value,
                    dateRange: ''
                  })}
                />
              </div>
              <span className="text-gray-500 font-medium">até</span>
              <div className="w-48">
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:border-blue-500 focus:ring-blue-500 cursor-pointer hover:border-gray-400 transition-colors"
                  value={filterOptions.endDate}
                  min={filterOptions.startDate}
                  onChange={(e) => onFilterChange({
                    endDate: e.target.value,
                    dateRange: ''
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskFilters;