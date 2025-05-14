import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Task } from '../../types';
import { RefreshCw, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { formatDate, adjustTimezone, isSameDay } from '../../utils/dateUtils';

export const RecurringTasksView: React.FC = () => {
  const { tasks } = useAppContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'upcoming' | 'history'>('upcoming');

  // Filtrar apenas tarefas recorrentes
  const recurringTasks = tasks.filter(task => task.recurrence);

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

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tarefas Recorrentes</h1>
        <p className="text-gray-500">
          {recurringTasks.length} {recurringTasks.length === 1 ? 'tarefa recorrente' : 'tarefas recorrentes'}
        </p>
      </div>

      <div className="flex space-x-2 mb-6">
        <button
          className={`px-4 py-2 rounded-lg ${
            viewMode === 'upcoming'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setViewMode('upcoming')}
        >
          Próximas Ocorrências
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            viewMode === 'history'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setViewMode('history')}
        >
          Histórico
        </button>
      </div>

      <div className="space-y-6">
        {recurringTasks.map(task => (
          <div key={task.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    <RefreshCw size={14} className="inline mr-1" />
                    {formatRecurrencePattern(task)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {selectedTask?.id === task.id ? 'Recolher' : 'Expandir'}
                </button>
              </div>
            </div>

            {selectedTask?.id === task.id && (
              <div className="p-4">
                <div className="space-y-4">
                  {viewMode === 'upcoming' ? (
                    <>
                      <h4 className="font-medium text-gray-700">Próximas Ocorrências</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getNextOccurrences(task).map((date, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center">
                              <Calendar size={16} className="text-gray-400 mr-2" />
                              <span className="text-gray-700">{formatDate(date.toISOString())}</span>
                            </div>
                            {isDateCompleted(task, date) ? (
                              <CheckCircle2 size={18} className="text-green-500" />
                            ) : (
                              <Circle size={18} className="text-gray-300" />
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 className="font-medium text-gray-700">Histórico de Conclusões</h4>
                      {task.completedDates?.length ? (
                        <div className="space-y-2">
                          {task.completedDates.map((date, index) => (
                            <div
                              key={index}
                              className="flex items-center p-3 bg-gray-50 rounded-lg"
                            >
                              <CheckCircle2 size={18} className="text-green-500 mr-2" />
                              <span className="text-gray-700">{formatDate(date)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">Nenhuma conclusão registrada</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecurringTasksView;