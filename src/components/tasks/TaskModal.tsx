import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Task, Client } from '../../types';
import { X, Calendar, Flag, User, Tag, Clock, Plus, ChevronDown, RefreshCw } from 'lucide-react';

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
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'baixa' | 'média' | 'alta'>('média');
  const [status, setStatus] = useState<'em_aberto' | 'em_andamento' | 'concluido' | 'nao_feito'>('em_aberto');
  const [selectedListId, setSelectedListId] = useState(preselectedListId || lists[0]?.id || '');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>(preselectedClientIds || []);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [newClient, setNewClient] = useState('');

  // Estados para recorrência
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'diária' | 'semanal' | 'mensal' | 'anual'>('semanal');
  const [interval, setInterval] = useState(1);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [excludeWeekends, setExcludeWeekends] = useState(true);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [monthOfYear, setMonthOfYear] = useState(1);
  
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

      if (task.recurrence) {
        setIsRecurring(true);
        setRecurrenceType(task.recurrence.type);
        setInterval(task.recurrence.interval);
        if (task.recurrence.daysOfWeek) {
          setSelectedDays(task.recurrence.daysOfWeek);
          setExcludeWeekends(!task.recurrence.daysOfWeek.includes(0) && !task.recurrence.daysOfWeek.includes(6));
        }
        if (task.recurrence.dayOfMonth) {
          setDayOfMonth(task.recurrence.dayOfMonth);
        }
        if (task.recurrence.monthOfYear) {
          setMonthOfYear(task.recurrence.monthOfYear);
        }
      }
    }
  }, [task]);

  // Efeito para atualizar os dias selecionados quando o checkbox de finais de semana muda
  useEffect(() => {
    if (recurrenceType === 'diária') {
      if (excludeWeekends) {
        setSelectedDays([1, 2, 3, 4, 5]); // Apenas dias úteis
      } else {
        setSelectedDays([0, 1, 2, 3, 4, 5, 6]); // Todos os dias
      }
    }
  }, [excludeWeekends, recurrenceType]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const recurrenceData = isRecurring ? {
      type: recurrenceType,
      interval,
      endDate: null,
      daysOfWeek: recurrenceType === 'semanal' || recurrenceType === 'diária'
        ? selectedDays 
        : undefined,
      dayOfMonth: recurrenceType === 'mensal' ? dayOfMonth : undefined,
      monthOfYear: recurrenceType === 'anual' ? monthOfYear : undefined
    } : null;
    
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
      recurrence: recurrenceData,
      tags
    };

    if (task) {
      updateTask(task.id, taskData);
    } else {
      addTask(taskData);
    }
    
    onClose();
  };

  const handleAddClient = (clientId: string) => {
    if (!selectedClientIds.includes(clientId)) {
      setSelectedClientIds([...selectedClientIds, clientId]);
    }
  };

  const handleRemoveClient = (clientId: string) => {
    setSelectedClientIds(selectedClientIds.filter(id => id !== clientId));
  };

  const weekDays = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda' },
    { value: 2, label: 'Terça' },
    { value: 3, label: 'Quarta' },
    { value: 4, label: 'Quinta' },
    { value: 5, label: 'Sexta' },
    { value: 6, label: 'Sábado' }
  ];

  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Data e Status */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lista
                </label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  value={selectedListId}
                  onChange={(e) => setSelectedListId(e.target.value)}
                >
                  {lists.map(list => (
                    <option key={list.id} value={list.id}>{list.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridade
                </label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clientes
              </label>
              <div className="relative">
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder="Selecionar cliente"
                      value={newClient}
                      onChange={(e) => {
                        setNewClient(e.target.value);
                        setShowClientDropdown(true);
                      }}
                      onFocus={() => setShowClientDropdown(true)}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                      onClick={() => setShowClientDropdown(!showClientDropdown)}
                    >
                      <ChevronDown size={20} />
                    </button>
                  </div>
                </div>

                {showClientDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {clients
                      .filter(client => !selectedClientIds.includes(client.id))
                      .filter(client => 
                        client.name.toLowerCase().includes(newClient.toLowerCase())
                      )
                      .map(client => (
                        <button
                          key={client.id}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                          onClick={() => {
                            handleAddClient(client.id);
                            setNewClient('');
                            setShowClientDropdown(false);
                          }}
                        >
                          {client.name}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {selectedClientIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedClientIds.map(clientId => {
                    const client = clients.find(c => c.id === clientId);
                    if (!client) return null;
                    return (
                      <span
                        key={clientId}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                      >
                        {client.name}
                        <button
                          type="button"
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          onClick={() => handleRemoveClient(clientId)}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
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
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                    >
                      {tag}
                      <button
                        type="button"
                        className="ml-2 text-gray-400 hover:text-gray-600"
                        onClick={() => setTags(tags.filter(t => t !== tag))}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Recorrência */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="recurring"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={isRecurring}
                  onChange={() => setIsRecurring(!isRecurring)}
                />
                <label htmlFor="recurring" className="ml-2 flex items-center text-sm text-gray-700">
                  <RefreshCw size={16} className="mr-2" />
                  Tarefa recorrente
                </label>
              </div>
              
              {isRecurring && (
                <div className="pl-6 space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frequência
                      </label>
                      <select
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        value={recurrenceType}
                        onChange={(e) => setRecurrenceType(e.target.value as any)}
                      >
                        <option value="diária">Diária</option>
                        <option value="semanal">Semanal</option>
                        <option value="mensal">Mensal</option>
                        <option value="anual">Anual</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        A cada
                      </label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          min="1"
                          className="w-24 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          value={interval}
                          onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                        />
                        <span className="ml-3 text-sm text-gray-600">
                          {recurrenceType === 'diária' && (interval > 1 ? 'dias' : 'dia')}
                          {recurrenceType === 'semanal' && (interval > 1 ? 'semanas' : 'semana')}
                          {recurrenceType === 'mensal' && (interval > 1 ? 'meses' : 'mês')}
                          {recurrenceType === 'anual' && (interval > 1 ? 'anos' : 'ano')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Opções específicas para cada tipo de recorrência */}
                  {recurrenceType === 'diária' && (
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={excludeWeekends}
                          onChange={(e) => setExcludeWeekends(e.target.checked)}
                        />
                        <span className="text-sm text-gray-700">Excluir finais de semana</span>
                      </label>
                    </div>
                  )}

                  {recurrenceType === 'semanal' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dias da semana
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {weekDays.map(day => (
                          <label key={day.value} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={selectedDays.includes(day.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedDays([...selectedDays, day.value]);
                                } else {
                                  setSelectedDays(selectedDays.filter(d => d !== day.value));
                                }
                              }}
                            />
                            <span className="text-sm text-gray-700">{day.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {recurrenceType === 'mensal' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dia do mês
                      </label>
                      <select
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        value={dayOfMonth}
                        onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                      >
                        {monthDays.map(day => (
                          <option key={day} value={day}>
                            Dia {day}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {recurrenceType === 'anual' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mês
                        </label>
                        <select
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          value={monthOfYear}
                          onChange={(e) => setMonthOfYear(parseInt(e.target.value))}
                        >
                          {months.map((month, index) => (
                            <option key={index + 1} value={index + 1}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dia
                        </label>
                        <select
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          value={dayOfMonth}
                          onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                        >
                          {monthDays.map(day => (
                            <option key={day} value={day}>
                              Dia {day}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
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