import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, TaskList, Client, Note, User, Notification } from '../types';
import { generateMockData } from '../utils/mockData';

interface AppContextType {
  tasks: Task[];
  lists: TaskList[];
  clients: Client[];
  notes: Note[];
  notifications: Notification[];
  currentUser: User;
  activeView: 'dashboard' | 'tarefas' | 'calendario' | 'notas';
  selectedListId: string | null;
  selectedClientId: string | null;
  searchQuery: string;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  setActiveView: (view: 'dashboard' | 'tarefas' | 'calendario' | 'notas') => void;
  setSelectedListId: (id: string | null) => void;
  setSelectedClientId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
  addObservation: (taskId: string, content: string) => void;
  addReminder: (taskId: string, time: number, unit: 'minutos' | 'horas' | 'dias') => void;
  markNotificationAsRead: (notificationId: string) => void;
  addList: (list: Omit<TaskList, 'id'>) => void;
  updateList: (listId: string, updates: Partial<TaskList>) => void;
  deleteList: (listId: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  deleteNote: (noteId: string) => void;
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (clientId: string, updates: Partial<Client>) => void;
  deleteClient: (clientId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockData = generateMockData();
  
  const [tasks, setTasks] = useState<Task[]>(mockData.tasks);
  const [lists, setLists] = useState<TaskList[]>(mockData.lists);
  const [clients, setClients] = useState<Client[]>(mockData.clients);
  const [notes, setNotes] = useState<Note[]>(mockData.notes);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUser] = useState<User>(mockData.user);
  const [activeView, setActiveView] = useState<'dashboard' | 'tarefas' | 'calendario' | 'notas'>('dashboard');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Verificar lembretes a cada minuto
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      tasks.forEach(task => {
        if (!task.dueDate || !task.reminders) return;
        
        const dueDate = new Date(task.dueDate);
        
        task.reminders.forEach(reminder => {
          if (reminder.notified) return;
          
          let reminderTime = new Date(dueDate);
          
          switch (reminder.unit) {
            case 'minutos':
              reminderTime.setMinutes(reminderTime.getMinutes() - reminder.time);
              break;
            case 'horas':
              reminderTime.setHours(reminderTime.getHours() - reminder.time);
              break;
            case 'dias':
              reminderTime.setDate(reminderTime.getDate() - reminder.time);
              break;
          }
          
          if (now >= reminderTime) {
            // Criar notificação
            const notification: Notification = {
              id: `notification-${Date.now()}`,
              type: 'reminder',
              title: 'Lembrete de Tarefa',
              message: `A tarefa "${task.title}" vence em ${reminder.time} ${reminder.unit}`,
              createdAt: new Date().toISOString(),
              read: false,
              taskId: task.id
            };
            
            setNotifications(prev => [...prev, notification]);
            
            // Marcar lembrete como notificado
            updateTask(task.id, {
              reminders: task.reminders?.map(r => 
                r.id === reminder.id ? { ...r, notified: true } : r
              )
            });
          }
        });
      });
    };
    
    const interval = setInterval(checkReminders, 60000); // Verificar a cada minuto
    return () => clearInterval(interval);
  }, [tasks]);

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: task.status || 'em_aberto',
      statusChangedAt: task.status === 'em_andamento' ? new Date().toISOString() : null,
      observations: [],
      reminders: []
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        
        // Se o status está mudando para 'em_andamento', atualizar statusChangedAt
        const statusChangedAt = updates.status === 'em_andamento' && task.status !== 'em_andamento'
          ? new Date().toISOString()
          : task.statusChangedAt;
        
        return { ...task, ...updates, statusChangedAt };
      })
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    
    // Remove any notifications related to this task
    setNotifications(prev => prev.filter(notification => notification.taskId !== taskId));
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId
        ? { 
            ...task, 
            status: task.status === 'concluida' ? 'em_aberto' : 'concluida',
            completedAt: task.status === 'concluida' ? null : new Date().toISOString()
          }
        : task
    ));
  };

  const addObservation = (taskId: string, content: string) => {
    const observation = {
      id: `obs-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      userId: currentUser.id
    };
    
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, observations: [...(task.observations || []), observation] }
        : task
    ));
    
    // Criar notificação
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const notification: Notification = {
        id: `notification-${Date.now()}`,
        type: 'observation',
        title: 'Nova Observação',
        message: `Uma nova observação foi adicionada à tarefa "${task.title}"`,
        createdAt: new Date().toISOString(),
        read: false,
        taskId
      };
      
      setNotifications(prev => [...prev, notification]);
    }
  };

  const addReminder = (taskId: string, time: number, unit: 'minutos' | 'horas' | 'dias') => {
    const reminder = {
      id: `reminder-${Date.now()}`,
      time,
      unit,
      notified: false
    };
    
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, reminders: [...(task.reminders || []), reminder] }
        : task
    ));
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    ));
  };

  const addList = (list: Omit<TaskList, 'id'>) => {
    const newList: TaskList = {
      ...list,
      id: `list-${Date.now()}`
    };
    setLists(prev => [...prev, newList]);
  };

  const updateList = (listId: string, updates: Partial<TaskList>) => {
    setLists(prev => prev.map(list =>
      list.id === listId ? { ...list, ...updates } : list
    ));
  };

  const deleteList = (listId: string) => {
    setLists(prev => prev.filter(list => list.id !== listId));
    // Update tasks that were in this list
    setTasks(prev => prev.map(task =>
      task.listId === listId ? { ...task, listId: null } : task
    ));
  };

  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newNote: Note = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setNotes(prev => [...prev, newNote]);
  };

  const updateNote = (noteId: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note =>
      note.id === noteId
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    ));
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient: Client = {
      ...client,
      id: `client-${Date.now()}`
    };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (clientId: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, ...updates } : client
    ));
  };

  const deleteClient = (clientId: string) => {
    setClients(prev => prev.filter(client => client.id !== clientId));
    // Update tasks associated with this client
    setTasks(prev => prev.map(task =>
      task.clientId === clientId ? { ...task, clientId: null } : task
    ));
  };

  const value = {
    tasks,
    lists,
    clients,
    notes,
    notifications,
    currentUser,
    activeView,
    selectedListId,
    selectedClientId,
    searchQuery,
    darkMode,
    setDarkMode,
    setActiveView,
    setSelectedListId,
    setSelectedClientId,
    setSearchQuery,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    addObservation,
    addReminder,
    markNotificationAsRead,
    addList,
    updateList,
    deleteList,
    addNote,
    updateNote,
    deleteNote,
    addClient,
    updateClient,
    deleteClient,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};