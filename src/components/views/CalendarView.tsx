import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Task } from '../../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Calendar as CalendarIcon
} from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

export const CalendarView: React.FC = () => {
  const { tasks } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month');
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Preparar o calendário
  const calendarDays = [];
  const today = new Date();
  
  // Dias do mês anterior
  for (let i = 0; i < firstDayOfMonth; i++) {
    const day = getDaysInMonth(year, month - 1) - (firstDayOfMonth - i - 1);
    calendarDays.push({
      day,
      month: month - 1,
      year,
      isCurrentMonth: false,
      isToday: false,
      date: new Date(year, month - 1, day)
    });
  }
  
  // Dias do mês atual
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isToday = date.getDate() === today.getDate() && 
                    date.getMonth() === today.getMonth() && 
                    date.getFullYear() === today.getFullYear();
    
    calendarDays.push({
      day,
      month,
      year,
      isCurrentMonth: true,
      isToday,
      date
    });
  }
  
  // Dias do próximo mês
  const remainingCells = 42 - calendarDays.length; // 6 semanas * 7 dias = 42 células
  for (let day = 1; day <= remainingCells; day++) {
    calendarDays.push({
      day,
      month: month + 1,
      year,
      isCurrentMonth: false,
      isToday: false,
      date: new Date(year, month + 1, day)
    });
  }
  
  // Filtrar tarefas pela data
  const getTasksForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getDate() === date.getDate()
      );
    });
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Calendário</h1>
          <p className="text-gray-500">
            Visualize suas tarefas organizadas no calendário
          </p>
        </div>
        
        <div className="flex space-x-2">
          {/* Controles de navegação */}
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              onClick={prevMonth}
              aria-label="Mês anterior"
            >
              <ChevronLeft size={18} />
            </button>
            
            <button 
              className="px-3 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              onClick={goToToday}
            >
              Hoje
            </button>
            
            <button 
              className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              onClick={nextMonth}
              aria-label="Próximo mês"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          
          {/* Seletor de visualização */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button 
              className={`px-3 py-2 ${currentView === 'month' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setCurrentView('month')}
            >
              Mês
            </button>
            <button 
              className={`px-3 py-2 ${currentView === 'week' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setCurrentView('week')}
            >
              Semana
            </button>
            <button 
              className={`px-3 py-2 ${currentView === 'day' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setCurrentView('day')}
            >
              Dia
            </button>
          </div>
        </div>
      </div>
      
      {currentView === 'month' && (
        <div className="flex-1 flex flex-col">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {monthNames[month]} {year}
            </h2>
          </div>
          
          <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Cabeçalho do calendário */}
            <div className="grid grid-cols-7 text-center py-2 border-b border-gray-200 bg-gray-50">
              {weekDays.map(day => (
                <div key={day} className="text-sm font-medium text-gray-700">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Dias do calendário */}
            <div className="grid grid-cols-7 grid-rows-6 flex-1 h-full">
              {calendarDays.map((dayInfo, index) => {
                const tasksForDay = getTasksForDate(dayInfo.date);
                
                return (
                  <div 
                    key={index} 
                    className={`min-h-[100px] border-b border-r border-gray-200 p-1 overflow-hidden ${
                      !dayInfo.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                    } ${dayInfo.isToday ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <span 
                        className={`inline-flex items-center justify-center w-6 h-6 text-sm ${
                          dayInfo.isToday 
                            ? 'bg-blue-600 text-white rounded-full' 
                            : 'text-gray-700'
                        }`}
                      >
                        {dayInfo.day}
                      </span>
                      {dayInfo.isCurrentMonth && (
                        <button 
                          className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100"
                          aria-label="Adicionar tarefa"
                        >
                          <Plus size={14} />
                        </button>
                      )}
                    </div>
                    
                    {/* Tarefas do dia */}
                    <div className="mt-1 space-y-1">
                      {tasksForDay.slice(0, 3).map((task: Task) => (
                        <div 
                          key={task.id} 
                          className={`text-xs p-1 rounded truncate ${
                            task.completed 
                              ? 'bg-gray-100 text-gray-500 line-through' 
                              : task.priority === 'alta' 
                                ? 'bg-red-100 text-red-800'
                                : task.priority === 'média'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {task.title}
                        </div>
                      ))}
                      
                      {tasksForDay.length > 3 && (
                        <div className="text-xs text-gray-500 pl-1">
                          + {tasksForDay.length - 3} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {currentView === 'week' && (
        <div className="flex-1 flex flex-col">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Semana de {formatDate(currentDate.toISOString())}
            </h2>
          </div>
          
          <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-center text-gray-500 mb-2">
              Visualização semanal em desenvolvimento
            </div>
            <div className="flex flex-col items-center justify-center h-full">
              <CalendarIcon size={64} className="text-gray-300 mb-4" />
              <p className="text-gray-600">
                Selecione a visualização mensal para ver o calendário completo
              </p>
            </div>
          </div>
        </div>
      )}
      
      {currentView === 'day' && (
        <div className="flex-1 flex flex-col">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {formatDate(currentDate.toISOString())}
            </h2>
          </div>
          
          <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-center text-gray-500 mb-2">
              Visualização diária em desenvolvimento
            </div>
            <div className="flex flex-col items-center justify-center h-full">
              <CalendarIcon size={64} className="text-gray-300 mb-4" />
              <p className="text-gray-600">
                Selecione a visualização mensal para ver o calendário completo
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;