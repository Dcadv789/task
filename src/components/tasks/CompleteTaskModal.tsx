import React, { useState } from 'react';
import { Task, Client } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { X, CheckSquare } from 'lucide-react';

interface CompleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  clients: Client[];
}

const CompleteTaskModal: React.FC<CompleteTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  clients
}) => {
  const { updateTask } = useAppContext();
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleComplete = () => {
    const allClientsSelected = selectedClientIds.length === task.clientIds.length;
    
    if (allClientsSelected) {
      updateTask(task.id, {
        completed: true,
        status: 'concluido',
        completedClientIds: task.clientIds
      });
    } else {
      updateTask(task.id, {
        completedClientIds: selectedClientIds
      });
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">
            Concluir Tarefa
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Selecione os clientes para os quais a tarefa foi concluída:
          </p>

          <div className="space-y-2">
            {task.clientIds.map(clientId => {
              const client = clients.find(c => c.id === clientId);
              if (!client) return null;

              return (
                <label key={client.id} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedClientIds.includes(client.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedClientIds([...selectedClientIds, client.id]);
                      } else {
                        setSelectedClientIds(selectedClientIds.filter(id => id !== client.id));
                      }
                    }}
                  />
                  <span className="ml-2 text-gray-700">{client.name}</span>
                </label>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center"
              onClick={handleComplete}
            >
              <CheckSquare size={18} className="mr-2" />
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteTaskModal;