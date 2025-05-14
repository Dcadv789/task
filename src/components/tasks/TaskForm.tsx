import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { X, Calendar, Flag, User, Tag, Clock, Plus, RefreshCw } from 'lucide-react';
import { Task } from '../../types';

interface TaskFormProps {
  taskId?: string;
  onClose: () => void;
  preselectedListId?: string | null;
  preselectedClientId?: string | null;
  isSubtask?: boolean;
  parentTask?: Task;
}

const TaskForm: React.FC<TaskFormProps> = ({ 
  taskId,
  onClose, 
  preselectedListId, 
  preselectedClientId,
  isSubtask = false,
  parentTask
}) => {
  const { lists, clients, addTask, tasks, updateTask } = useAppContext();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'baixa' | 'média' | 'alta'>(parentTask?.priority || 'média');
  const [status, setStatus] = useState<'em_aberto' | 'em_andamento' | 'concluido' | 'nao_feito'>('em_aberto');
  const [selectedListId, setSelectedListId] = useState(parentTask?.listId || preselectedListId || lists[0]?.id || '');
  const [selectedClientId, setSelectedClientId] = useState(parentTask?.clientId || preselectedClientId || '');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>(parentTask?.tags || []);
  
  // Estados para recorrência
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'diária' | 'semanal' | 'mensal' | 'anual'>('semanal');
  const [interval, setInterval] = useState(1);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [monthOfYear, setMonthOfYear] = useState(1);
  
  useEffect(() => {
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
        setPriority(task.priority);
        setStatus(task.status);
        setSelectedListId(task.listId);
        setSelectedClientId(task.clientId || '');
        setTags([...task.tags]);
        
        if (task.recurrence) {
          setIsRecurring(true);
          setRecurrenceType(task.recurrence.type);
          setInterval(task.recurrence.interval);
          if (task.recurrence.daysOfWeek) {
            setSelectedDays(task.recurrence.daysOfWeek);
          }
          if (task.recurrence.dayOfMonth) {
            setDayOfMonth(task.recurrence.dayOfMonth);
          }
          if (task.recurrence.monthOfYear) {
            setMonthOfYear(task.recurrence.monthOfYear);
          }
        }
      }
    }
  }, [taskId, tasks]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const recurrenceData = isRecurring ? {
      type: recurrenceType,
      interval,
      endDate: null,
      daysOfWeek: recurrenceType === 'semanal' || (recurrenceType === 'diária' && selectedDays.length > 0) 
        ? selectedDays 
        : undefined,
      dayOfMonth: recurrenceType === 'mensal' ? dayOfMonth : undefined,
      monthOfYear: recurrenceType === 'anual' ? monthOfYear : undefined
    } : null;

    if (isSubtask && parentTask) {
      const newSubtask = {
        id: `subtask-${Date.now()}`,
        title: title.trim(),
        completed: false
      };

      const updatedSubtasks = [...(parentTask.subtasks || []), newSubtask];
      updateTask(parentTask.id, { subtasks: updatedSubtasks });
    } else {
      const taskData = {
        title,
        description,
        completed: status === 'concluido',
        priority: isSubtask ? parentTask?.priority || priority : priority,
        status,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        clientId: isSubtask ? parentTask?.clientId || null : selectedClientId || null,
        listId: isSubtask ? parentTask?.listId || selectedListId : selectedListId,
        parentId: isSubtask ? parentTask?.id || null : null,
        recurrence: recurrenceData,
        tags: isSubtask ? [...parentTask?.tags || []] : tags,
        subtasks: []
      };

      if (taskId) {
        updateTask(taskId, taskData);
      } else {
        addTask(taskData);
      }
    }
    
    onClose();
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
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

  const statusOptions = {
    'em_aberto': 'Em Aberto',
    'em_andamento': 'Em Andamento',
    'concluido': 'Concluído',
    'nao_feito': 'Não Feito'
  };
  
  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {taskId ? 'Editar Tarefa' : isSubtask ? 'Nova Subtarefa' : 'Nova Tarefa'}
        </h2>
        <button
          className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título
            </label>
            <input
              id="title"
              type="text"
              className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Título da tarefa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          {!isSubtask && (
            <>
              {/* Descrição */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  id="description"
                  className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Descrição detalhada da tarefa"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              {/* Linha 1: Data e Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Data de vencimento */}
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Calendar size={16} className="mr-2" />
                    Data de vencimento
                  </label>
                  <input
                    id="dueDate"
                    type="date"
                    className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                
                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Clock size={16} className="mr-2" />
                    Status
                  </label>
                  <select
                    id="status"
                    className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'em_aberto' | 'em_andamento' | 'concluido' | 'nao_feito')}
                  >
                    {Object.entries(statusOptions).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Linha 2: Lista e Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lista */}
                <div>
                  <label htmlFor="list" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Clock size={16} className="mr-2" />
                    Lista
                  </label>
                  <select
                    id="list"
                    className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    value={selectedListId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                    required
                  >
                    {lists.map(list => (
                      <option key={list.id} value={list.id}>{list.name}</option>
                    ))}
                  </select>
                </div>
                
                {/* Cliente */}
                <div>
                  <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <User size={16} className="mr-2" />
                    Cliente (opcional)
                  </label>
                  <select
                    id="client"
                    className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                  >
                    <option value="">Sem cliente</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Prioridade */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Flag size={16} className="mr-2" />
                  Prioridade
                </label>
                <select
                  id="priority"
                  className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'baixa' | 'média' | 'alta')}
                >
                  <option value="baixa">Baixa</option>
                  <option value="média">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
              
              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Tag size={16} className="mr-2" />
                  Tags
                </label>
                <div className="flex">
                  <input
                    id="tags"
                    type="text"
                    className="flex-1 px-4 py-3 rounded-l-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Adicionar tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    type="button"
                    className="px-4 py-3 bg-gray-100 text-gray-600 rounded-r-lg border border-gray-300 hover:bg-gray-200"
                    onClick={handleAddTag}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map(tag => (
                      <span 
                        key={tag} 
                        className="flex items-center text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          onClick={() => removeTag(tag)}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Tarefa recorrente */}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="recurrence-type" className="block text-sm font-medium text-gray-700 mb-2">
                          Frequência
                        </label>
                        <select
                          id="recurrence-type"
                          className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                        <label htmlFor="interval" className="block text-sm font-medium text-gray-700 mb-2">
                          A cada
                        </label>
                        <div className="flex items-center">
                          <input
                            id="interval"
                            type="number"
                            min="1"
                            className="w-24 px-4 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                            checked={!selectedDays.includes(0) && !selectedDays.includes(6)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                // Remover sábado e domingo
                                setSelectedDays([1, 2, 3, 4, 5]);
                              } else {
                                // Incluir todos os dias
                                setSelectedDays([]);
                              }
                            }}
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
                          className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mês
                          </label>
                          <select
                            className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                            className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
            </>
          )}
          
          <div className="flex justify-end pt-6 space-x-3">
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {taskId ? 'Salvar Alterações' : isSubtask ? 'Criar Subtarefa' : 'Criar Tarefa'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;