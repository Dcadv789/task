import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Task, Reminder } from '../../types';
import { Bell, Plus, Trash } from 'lucide-react';

interface TaskRemindersProps {
  task: Task;
}

const TaskReminders: React.FC<TaskRemindersProps> = ({ task }) => {
  const { addReminder, updateTask } = useAppContext();
  const [time, setTime] = useState<number>(15);
  const [unit, setUnit] = useState<'minutos' | 'horas' | 'dias'>('minutos');

  const handleAddReminder = () => {
    addReminder(task.id, time, unit);
  };

  const handleRemoveReminder = (reminderId: string) => {
    updateTask(task.id, {
      reminders: task.reminders?.filter(r => r.id !== reminderId)
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Lembretes</h3>

      <div className="flex gap-2">
        <input
          type="number"
          min="1"
          value={time}
          onChange={(e) => setTime(parseInt(e.target.value))}
          className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as 'minutos' | 'horas' | 'dias')}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="minutos">Minutos</option>
          <option value="horas">Horas</option>
          <option value="dias">Dias</option>
        </select>
        <button
          onClick={handleAddReminder}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus size={16} className="mr-2" />
          Adicionar
        </button>
      </div>

      <div className="space-y-2">
        {task.reminders?.map((reminder: Reminder) => (
          <div
            key={reminder.id}
            className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
          >
            <div className="flex items-center space-x-2">
              <Bell size={16} className="text-blue-500" />
              <span className="text-sm text-gray-700">
                {reminder.time} {reminder.unit} antes do vencimento
              </span>
            </div>
            <button
              onClick={() => handleRemoveReminder(reminder.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskReminders;