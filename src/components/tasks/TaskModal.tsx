import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Task, Client } from '../../types';
import { X, Calendar, Flag, User, Tag, Clock, Plus } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  preselectedListId?: string;
  preselectedClientIds?: string[];
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  preselectedListId,
  preselectedClientIds
}) => {
  const { lists, clients, addTask, updateTask } = useAppContext();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'baixa' | 'média' | 'alta'>('média');
  const [status, setStatus] = useState<'em_aberto' | 'em_andamento' | 'concluido' | 'nao_feito'>('em_aberto');
  const [selectedListId, setSelectedListId] = useState(preselectedListId || lists[0]?.id || '');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>(preselectedClientIds || []);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setPriority(task.priority);
      setStatus(task.status);
      setSelectedListId(task.listId);
      setSelectedClientIds(task.clientIds);
      setTags(task.tags);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    const taskData = {
      title,
      description,
      completed: false,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      clientIds: selectedClientIds,
      completedClientIds: [],
      listId: selectedListId,
      parentId: null,
      recurrence: null,
      tags
    };

    if (task) {
      updateTask(task.id, taskData);
    } else {
      addTask(taskData);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                className="w-full rounded-md border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                className="w-full rounded-md border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Data e Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full rounded-md border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="em_aberto">Em Aberto</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluido">Concluído</option>
                  <option value="nao_feito">Não Feito</option>
                </select>
              </div>
            </div>

            {/* Lista e Prioridade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lista
                </label>
                <select
                  className="w-full rounded-md border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  value={selectedListId}
                  onChange={(e) => setSelectedListId(e.target.value)}
                >
                  {lists.map(list => (
                    <option key={list.id} value={list.id}>{list.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade
                </label>
                <select
                  className="w-full rounded-md border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                >
                  <option value="baixa">Baixa</option>
                  <option value="média">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>

            {/* Clientes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clientes
              </label>
              <div className="border border-gray-200 rounded-md p-2">
                {clients.map(client => (
                  <label key={client.id} className="flex items-center p-2 hover:bg-gray-50">
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
                    <span className="ml-2 text-sm text-gray-700">{client.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-1 rounded-l-md border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTag.trim()) {
                      e.preventDefault();
                      setTags([...tags, newTag.trim()]);
                      setNewTag('');
                    }
                  }}
                  placeholder="Adicionar tag"
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-r-md hover:bg-gray-200"
                  onClick={() => {
                    if (newTag.trim()) {
                      setTags([...tags, newTag.trim()]);
                      setNewTag('');
                    }
                  }}
                >
                  <Plus size={20} />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                    >
                      {tag}
                      <button
                        type="button"
                        className="ml-1 text-gray-400 hover:text-gray-600"
                        onClick={() => setTags(tags.filter(t => t !== tag))}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
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
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {task ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;