import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, TaskList, Client, Note, User } from '../types';
import { generateMockData } from '../utils/mockData';

interface AppContextType {
  tasks: Task[];
  lists: TaskList[];
  clients: Client[];
  notes: Note[];
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
  const [currentUser] = useState<User>(mockData.user);
  const [activeView, setActiveView] = useState<'dashboard' | 'tarefas' | 'calendario' | 'notas'>('dashboard');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('lists', JSON.stringify(lists));
  }, [lists]);

  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: task.status || 'em_aberto',
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId && task.parentId !== taskId));
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? {
          ...task,
          completed: !task.completed,
          status: !task.completed ? 'concluido' : 'em_aberto'
        } : task
      )
    );
  };

  const addList = (list: Omit<TaskList, 'id'>) => {
    const newList: TaskList = {
      ...list,
      id: `list-${Date.now()}`,
    };
    setLists((prev) => [...prev, newList]);
  };

  const updateList = (listId: string, updates: Partial<TaskList>) => {
    setLists((prev) =>
      prev.map((list) => (list.id === listId ? { ...list, ...updates } : list))
    );
  };

  const deleteList = (listId: string) => {
    setLists((prev) => prev.filter((list) => list.id !== listId));
    setTasks((prev) => prev.filter((task) => task.listId !== listId));
  };

  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const currentTime = new Date().toISOString();
    const newNote: Note = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
    setNotes((prev) => [...prev, newNote]);
  };

  const updateNote = (noteId: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === noteId
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note
      )
    );
  };

  const deleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
  };

  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient: Client = {
      ...client,
      id: `client-${Date.now()}`,
    };
    setClients((prev) => [...prev, newClient]);
  };

  const updateClient = (clientId: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((client) => (client.id === clientId ? { ...client, ...updates } : client))
    );
  };

  const deleteClient = (clientId: string) => {
    setClients((prev) => prev.filter((client) => client.id !== clientId));
    setTasks((prev) =>
      prev.map((task) =>
        task.clientId === clientId ? { ...task, clientId: null } : task
      )
    );
  };

  const value = {
    tasks,
    lists,
    clients,
    notes,
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