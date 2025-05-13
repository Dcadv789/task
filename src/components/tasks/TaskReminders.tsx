import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Task, Reminder } from '../../types';
import { Bell, Plus, Trash, X } from 'lucide-react';

interface TaskRemindersProps {
  task: Task;
  onClose?: () => void;
}

const TaskReminders: React.FC<TaskRemindersProps> = ({ task, onClose }) => {
  const { addReminder, updateTask } = useAppContext();
  const [time, setTime] = useState<number>(15);
  const [unit, setUnit] = useState<'minutos' | 'horas' | 'dias'>('minutos');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddReminder = () => {
    addReminder(task.id, time, unit);
    setShowAddForm(false);
  };

  const handleRemoveReminder = (reminderId: string) => {
    updateTask(task.id, {
      reminders: task.reminders?.filter(r => r.id !== reminderId)
    });
  };

  return (
    <div className="space-y-4">
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Adicionar Novo Lembrete
        </button>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Novo Lembrete</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
          
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Plus size={16} className="mr-2" />
              Adicionar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {task.reminders?.map((reminder: Reminder) => (
          <div
            key={reminder.id}
            className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full">
                <Bell size={16} />
              </div>
              <span className="text-sm text-gray-700">
                {reminder.time} {reminder.unit} antes do vencimento
              </span>
            </div>
            <button
              onClick={() => handleRemoveReminder(reminder.id)}
              className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
            >
              <Trash size={16} />
            </button>
          </div>
        ))}
      </div>

      {onClose && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskReminders;