import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Task } from '../../types';
import { 
  RefreshCw, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp,
  Clock,
  CalendarDays,
  CalendarCheck
} from 'lucide-react';
import { formatDate, adjustTimezone, isSameDay } from '../../utils/dateUtils';

export const RecurringTasksView: React.FC = () => {
  const { tasks, updateTask } = useAppContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'upcoming' | 'history'>('upcoming');
  const [expandedDates, setExpandedDates] = useState<{[key: string]: boolean}>({});

  // Filtrar apenas tarefas recorrentes
  const recurringTasks = tasks.filter(task => task.recurrence);

  // Obter tarefas para hoje e amanhã
  const today = adjustTimezone(new Date());
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Gerar próximas ocorrências para uma tarefa
  const getNextOccurrences = (task: Task, numberOfOccurrences = 10): Date[] => {
    if (!task.recurrence || !task.dueDate) return [];

    const dates: Date[] = [];
    const startDate = adjustTimezone(new Date(task.dueDate));
    let currentDate = new Date(startDate);

    while (dates.length < numberOfOccurrences) {
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
            const weekNumber = Math.floor((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
            if (weekNumber % interval === 0) {
              dates.push(new Date(currentDate));
            }
          }
          currentDate.setDate(currentDate.getDate() + 1);
          break;

        case 'mensal':
          if (currentDate.getDate() === startDate.getDate()) {
            const monthDiff = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
                            (currentDate.getMonth() - startDate.getMonth());
            if (monthDiff % interval === 0) {
              dates.push(new Date(currentDate));
            }
          }
          currentDate.setDate(currentDate.getDate() + 1);
          break;

        case 'anual':
          if (currentDate.getMonth() === startDate.getMonth() && 
              currentDate.getDate() === startDate.getDate()) {
            const yearDiff = currentDate.getFullYear() - startDate.getFullYear();
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

  // Verificar se uma data específica foi concluída
  const isDateCompleted = (task: Task, date: Date): boolean => {
    return task.completedDates?.some(completedDate => 
      isSameDay(new Date(completedDate), date)
    ) || false;
  };

  // Marcar uma data como concluída ou não concluída
  const toggleDateCompletion = (task: Task, date: Date) => {
    const isCompleted = isDateCompleted(task, date);
    const newCompletedDates = isCompleted
      ? task.completedDates?.filter(d => !isSameDay(new Date(d), date))
      : [...(task.completedDates || []), date.toISOString()];
    
    updateTask(task.id, { completedDates: newCompletedDates });
  };

  const formatRecurrencePattern = (task: Task) => {
    if (!task.recurrence) return '';
    
    const { type, interval, daysOfWeek } = task.recurrence;
    let pattern = `A cada ${interval} `;
    
    switch (type) {
      case 'diária':
        pattern += interval === 1 ? 'dia' : 'dias';
        if (daysOfWeek?.length) {
          const dias = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
          pattern += ` (${daysOfWeek.map(d => dias[d]).join(', ')})`;
        }
        break;
      case 'semanal':
        pattern += interval === 1 ? 'semana' : 'semanas';
        if (daysOfWeek?.length) {
          const dias = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
          pattern += ` (${daysOfWeek.map(d => dias[d]).join(', ')})`;
        }
        break;
      case 'mensal':
        pattern += interval === 1 ? 'mês' : 'meses';
        break;
      case 'anual':
        pattern += interval === 1 ? 'ano' : 'anos';
        break;
    }
    
    return pattern;
  };

  // Agrupar tarefas por data
  const getTasksForDate = (date: Date) => {
    return recurringTasks.filter(task => {
      const occurrences = getNextOccurrences(task, 30);
      return occurrences.some(occurrence => isSameDay(occurrence, date));
    });
  };

  const tasksForToday = getTasksForDate(today);
  const tasksForTomorrow = getTasksForDate(tomorrow);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Tarefas Recorrentes</h1>
        <p className="text-gray-500">
          {recurringTasks.length} {recurringTasks.length === 1 ? 'tarefa recorrente' : 'tarefas recorrentes'}
        </p>
      </div>

      {/* Grid de Hoje e Amanhã */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarefas de Hoje */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Hoje</h2>
            </div>
          </div>
          <div className="p-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-gray-100">
            {tasksForToday.length > 0 ? (
              <div className="space-y-3">
                {tasksForToday.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleDateCompletion(task, today)}
                        className={`p-1 rounded-full transition-colors ${
                          isDateCompleted(task, today)
                            ? 'text-green-500 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {isDateCompleted(task, today) ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </button>
                      <span className={`font-medium ${
                        isDateCompleted(task, today) ? 'text-gray-400 line-through' : 'text-gray-700'
                      }`}>
                        {task.title}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatRecurrencePattern(task)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Nenhuma tarefa recorrente para hoje
              </p>
            )}
          </div>
        </div>

        {/* Tarefas de Amanhã */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
            <div className="flex items-center">
              <CalendarDays className="w-5 h-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Amanhã</h2>
            </div>
          </div>
          <div className="p-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-gray-100">
            {tasksForTomorrow.length > 0 ? (
              <div className="space-y-3">
                {tasksForTomorrow.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleDateCompletion(task, tomorrow)}
                        className={`p-1 rounded-full transition-colors ${
                          isDateCompleted(task, tomorrow)
                            ? 'text-green-500 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {isDateCompleted(task, tomorrow) ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </button>
                      <span className={`font-medium ${
                        isDateCompleted(task, tomorrow) ? 'text-gray-400 line-through' : 'text-gray-700'
                      }`}>
                        {task.title}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatRecurrencePattern(task)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Nenhuma tarefa recorrente para amanhã
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Lista Completa */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center">
            <CalendarCheck className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Todas as Tarefas Recorrentes</h2>
          </div>
        </div>
        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-100">
          {recurringTasks.map(task => (
            <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    <RefreshCw size={14} className="inline mr-1" />
                    {formatRecurrencePattern(task)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setExpandedDates(prev => ({
                      ...prev,
                      [task.id]: !prev[task.id]
                    }));
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                >
                  {expandedDates[task.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>

              {expandedDates[task.id] && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {getNextOccurrences(task, 30).map((date, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                        isSameDay(date, today)
                          ? 'bg-blue-50 border border-blue-100 hover:bg-blue-100'
                          : isSameDay(date, tomorrow)
                            ? 'bg-purple-50 border border-purple-100 hover:bg-purple-100'
                            : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleDateCompletion(task, date)}
                          className={`p-1 rounded-full transition-colors ${
                            isDateCompleted(task, date)
                              ? 'text-green-500 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {isDateCompleted(task, date) ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>
                        <div>
                          <span className={`block font-medium ${
                            isDateCompleted(task, date) ? 'text-gray-400 line-through' : 'text-gray-700'
                          }`}>
                            {formatDate(date.toISOString())}
                          </span>
                          <span className="text-xs text-gray-500">
                            {isSameDay(date, today)
                              ? 'Hoje'
                              : isSameDay(date, tomorrow)
                                ? 'Amanhã'
                                : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecurringTasksView;