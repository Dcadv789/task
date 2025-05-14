import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Task } from '../../types';
import { Plus, Clock, CheckSquare, Calendar } from 'lucide-react';
import CalendarFilter from '../calendar/CalendarFilter';
import TaskModal from '../calendar/TaskModal';

export const CalendarView: React.FC = () => {
  const { tasks, clients } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [recurrenceFilter, setRecurrenceFilter] = useState<'all' | 'recurring' | 'non-recurring'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
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
          dates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + interval);
          break;

        case 'semanal':
          if (daysOfWeek && daysOfWeek.includes(currentDate.getDay())) {
            dates.push(new Date(currentDate));
          }
          currentDate.setDate(currentDate.getDate() + 1);
          break;

        case 'mensal':
          if (currentDate.getDate() === taskStartDate.getDate()) {
            dates.push(new Date(currentDate));
          }
          currentDate.setDate(currentDate.getDate() + 1);
          break;

        case 'anual':
          if (currentDate.getMonth() === taskStartDate.getMonth() && 
              currentDate.getDate() === taskStartDate.getDate()) {
            dates.push(new Date(currentDate));
          }
          currentDate.setDate(currentDate.getDate() + 1);
          break;
      }
    }

    return dates;
  };

  // Função para obter todas as tarefas para uma data específica
  const getTasksForDate = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return tasks.filter(task => {
      // Filtrar por cliente se selecionado
      if (selectedClientId && !task.clientIds.includes(selectedClientId)) return false;

      // Filtrar por recorrência
      const isRecurring = !!task.recurrence;
      if (recurrenceFilter === 'recurring' && !isRecurring) return false;
      if (recurrenceFilter === 'non-recurring' && isRecurring) return false;

      if (!task.dueDate) return false;

      const taskDate = new Date(task.dueDate);
      
      // Para tarefas não recorrentes
      if (!task.recurrence) {
        return taskDate >= startOfDay && taskDate <= endOfDay;
      }

      // Para tarefas recorrentes
      const occurrences = generateRecurringTaskOccurrences(task, startOfDay, endOfDay);
      return occurrences.length > 0;
    });
  };

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
  
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Obter os dias da semana atual
  const getCurrentWeekDays = () => {
    const days = [];
    const firstDay = new Date(currentDate);
    firstDay.setDate(firstDay.getDate() - firstDay.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const renderMonthView = () => {
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
    const remainingCells = 42 - calendarDays.length;
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

    return (
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
              
              <div className="mt-1 space-y-1">
                {tasksForDay.map((task: Task) => (
                  <button 
                    key={task.id} 
                    className={`w-full text-left text-xs p-1 rounded truncate ${
                      task.completed 
                        ? 'bg-gray-100 text-gray-500 line-through' 
                        : task.priority === 'alta' 
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'média'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                    }`}
                    onClick={() => setSelectedTask(task)}
                  >
                    {task.title}
                  </button>
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
    );
  };

  const renderWeekView = () => {
    const weekDays = getCurrentWeekDays();
    const today = new Date();

    return (
      <div className="grid grid-cols-7 gap-6">
        {weekDays.map((date, index) => {
          const tasksForDay = getTasksForDate(date);
          const isToday = date.toDateString() === today.toDateString();

          return (
            <div key={index} className="flex flex-col">
              <div className={`p-3 text-center rounded-lg mb-4 ${
                isToday ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
              }`}>
                <div className="text-sm font-medium">
                  {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </div>
                <div className="text-lg font-semibold">
                  {date.getDate()}
                </div>
              </div>
              <div className="space-y-3">
                {tasksForDay.map(task => (
                  <button
                    key={task.id}
                    className="w-full text-left"
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className={`p-3 rounded-lg shadow-sm border transition-all ${
                      task.completed 
                        ? 'bg-gray-50 border-gray-200'
                        : task.priority === 'alta'
                          ? 'bg-white border-red-200 hover:border-red-300'
                          : task.priority === 'média'
                            ? 'bg-white border-yellow-200 hover:border-yellow-300'
                            : 'bg-white border-blue-200 hover:border-blue-300'
                    }`}>
                      <div className="flex items-start gap-2">
                        {task.completed ? (
                          <CheckSquare className="w-4 h-4 mt-1 text-green-500" />
                        ) : (
                          <Clock className={`w-4 h-4 mt-1 ${
                            task.priority === 'alta' ? 'text-red-500' :
                            task.priority === 'média' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`} />
                        )}
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${
                            task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const tasksForDay = getTasksForDate(currentDate);
    const isToday = currentDate.toDateString() === new Date().toDateString();

    if (tasksForDay.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
          <div className={`p-4 rounded-full ${
            isToday ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <Calendar className={`w-8 h-8 ${
              isToday ? 'text-blue-600' : 'text-gray-500'
            }`} />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {currentDate.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </h3>
          <p className="mt-2 text-gray-500">
            Nenhuma tarefa para este dia
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className={`p-4 rounded-lg text-center ${
          isToday ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
        }`}>
          <h2 className="text-lg font-semibold">
            {currentDate.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </h2>
        </div>

        <div className="space-y-4">
          {tasksForDay.map(task => (
            <button
              key={task.id}
              className="w-full text-left"
              onClick={() => setSelectedTask(task)}
            >
              <div className={`p-4 rounded-lg shadow-sm border transition-all ${
                task.completed 
                  ? 'bg-gray-50 border-gray-200'
                  : task.priority === 'alta'
                    ? 'bg-white border-red-200 hover:border-red-300'
                    : task.priority === 'média'
                      ? 'bg-white border-yellow-200 hover:border-yellow-300'
                      : 'bg-white border-blue-200 hover:border-blue-300'
              }`}>
                <div className="flex items-start gap-3">
                  {task.completed ? (
                    <CheckSquare className="w-5 h-5 mt-1 text-green-500" />
                  ) : (
                    <Clock className={`w-5 h-5 mt-1 ${
                      task.priority === 'alta' ? 'text-red-500' :
                      task.priority === 'média' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} />
                  )}
                  <div className="flex-1">
                    <h3 className={`text-base font-medium ${
                      task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                    }`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {task.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        task.priority === 'alta' 
                          ? 'bg-red-100 text-red-700'
                          : task.priority === 'média'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}>
                        {task.priority}
                      </span>
                      {task.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Calendário</h1>
        <p className="text-gray-500">
          Visualize suas tarefas organizadas no calendário
        </p>
      </div>

      <CalendarFilter
        currentDate={currentDate}
        currentView={currentView}
        selectedClientId={selectedClientId}
        clients={clients}
        recurrenceFilter={recurrenceFilter}
        onDateChange={setCurrentDate}
        onViewChange={setCurrentView}
        onClientChange={setSelectedClientId}
        onRecurrenceFilterChange={setRecurrenceFilter}
      />
      
      <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
        {currentView === 'month' && (
          <>
            <div className="grid grid-cols-7 text-center py-2 border-b border-gray-200 bg-gray-50">
              {weekDays.map(day => (
                <div key={day} className="text-sm font-medium text-gray-700">
                  {day}
                </div>
              ))}
            </div>
            {renderMonthView()}
          </>
        )}
        
        <div className="p-6">
          {currentView === 'week' && renderWeekView()}
          {currentView === 'day' && renderDayView()}
        </div>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default CalendarView;