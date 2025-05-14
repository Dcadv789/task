import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Client } from '../../types';

interface CalendarFilterProps {
  currentDate: Date;
  currentView: 'month' | 'week' | 'day';
  selectedClientId: string | null;
  clients: Client[];
  recurrenceFilter: 'all' | 'recurring' | 'non-recurring';
  onDateChange: (date: Date) => void;
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  onClientChange: (clientId: string | null) => void;
  onRecurrenceFilterChange: (filter: 'all' | 'recurring' | 'non-recurring') => void;
}

const CalendarFilter: React.FC<CalendarFilterProps> = ({
  currentDate,
  currentView,
  selectedClientId,
  clients,
  recurrenceFilter,
  onDateChange,
  onViewChange,
  onClientChange,
  onRecurrenceFilterChange,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    onDateChange(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    onDateChange(newDate);
  };

  const formatCurrentPeriod = () => {
    if (currentView === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (currentView === 'week') {
      return `Semana ${getWeekNumber(currentDate)} de ${currentDate.getFullYear()}`;
    } else {
      return currentDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  return (
    <div className="flex items-center justify-between mb-6 bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center space-x-4">
        <div className="flex space-x-1 border border-gray-200 rounded-lg p-1">
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              currentView === 'month'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => onViewChange('month')}
          >
            Mês
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              currentView === 'week'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => onViewChange('week')}
          >
            Semana
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              currentView === 'day'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => onViewChange('day')}
          >
            Dia
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            className="p-1.5 hover:bg-gray-100 rounded-lg"
            onClick={navigatePrevious}
          >
            <ChevronLeft size={20} />
          </button>

          <div className="relative">
            <button
              className="flex items-center space-x-2 px-3 py-1.5 hover:bg-gray-100 rounded-lg"
              onClick={() => currentView === 'day' && setShowDatePicker(!showDatePicker)}
            >
              <span className="text-sm font-medium">{formatCurrentPeriod()}</span>
              {currentView === 'day' && <CalendarIcon size={16} />}
            </button>

            {showDatePicker && currentView === 'day' && (
              <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50">
                <input
                  type="date"
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                  value={currentDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    onDateChange(new Date(e.target.value));
                    setShowDatePicker(false);
                  }}
                />
              </div>
            )}
          </div>

          <button
            className="p-1.5 hover:bg-gray-100 rounded-lg"
            onClick={navigateNext}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex space-x-1 border border-gray-200 rounded-lg p-1">
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              recurrenceFilter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => onRecurrenceFilterChange('all')}
          >
            Todas
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              recurrenceFilter === 'recurring'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => onRecurrenceFilterChange('recurring')}
          >
            Recorrentes
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              recurrenceFilter === 'non-recurring'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => onRecurrenceFilterChange('non-recurring')}
          >
            Não Recorrentes
          </button>
        </div>

        <select
          className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-sm"
          value={selectedClientId || ''}
          onChange={(e) => onClientChange(e.target.value || null)}
        >
          <option value="">Todos os clientes</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CalendarFilter;