import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Task, Observation } from '../../types';
import { MessageSquarePlus, User, Clock, Trash } from 'lucide-react';
import { formatDateRelative } from '../../utils/dateUtils';

interface TaskObservationsProps {
  task: Task;
}

const TaskObservations: React.FC<TaskObservationsProps> = ({ task }) => {
  const { addObservation, updateTask, currentUser } = useAppContext();
  const [newObservation, setNewObservation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObservation.trim()) return;

    addObservation(task.id, newObservation);
    setNewObservation('');
  };

  const handleDeleteObservation = (observationId: string) => {
    updateTask(task.id, {
      observations: task.observations.filter(obs => obs.id !== observationId)
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-gray-900">Observações</h3>
        <div className="text-sm text-gray-500">
          {task.observations?.length || 0} observações
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newObservation}
            onChange={(e) => setNewObservation(e.target.value)}
            placeholder="Adicionar uma observação..."
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
          />
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <MessageSquarePlus size={16} className="mr-2" />
            Adicionar
          </button>
        </div>
      </form>

      <div className="space-y-3 mt-4">
        {task.observations?.map((observation: Observation) => (
          <div key={observation.id} className="bg-gray-50 rounded-lg p-4 relative group">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <User size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {currentUser.name}
                </span>
              </div>
              <button
                onClick={() => handleDeleteObservation(observation.id)}
                className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash size={16} />
              </button>
            </div>
            <p className="mt-2 text-gray-600">{observation.content}</p>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Clock size={14} className="mr-1" />
              {formatDateRelative(observation.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskObservations