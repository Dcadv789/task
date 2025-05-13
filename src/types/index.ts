export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'baixa' | 'média' | 'alta';
  status: 'em_aberto' | 'em_andamento' | 'concluido' | 'nao_feito';
  statusChangedAt: string | null; // Nova propriedade
  dueDate: string | null;
  createdAt: string;
  clientIds: string[];
  completedClientIds: string[];
  listId: string;
  parentId: string | null;
  recurrence: Recurrence | null;
  tags: string[];
  observations: Observation[]; // Nova propriedade
  reminders: Reminder[]; // Nova propriedade
}

export interface Observation {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
}

export interface Reminder {
  id: string;
  time: number; // Quantidade de tempo antes do vencimento
  unit: 'minutos' | 'horas' | 'dias';
  notified: boolean;
}

export interface Notification {
  id: string;
  type: 'reminder' | 'status_change' | 'observation';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  taskId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'baixa' | 'média' | 'alta';
  status: 'em_aberto' | 'em_andamento' | 'concluido' | 'nao_feito';
  dueDate: string | null;
  createdAt: string;
  clientIds: string[];
  completedClientIds: string[];
  listId: string;
  parentId: string | null;
  recurrence: Recurrence | null;
  tags: string[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  taskId: string;
}

export interface TaskList {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Recurrence {
  type: 'diária' | 'semanal' | 'mensal' | 'anual';
  interval: number;
  endDate: string | null;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  monthOfYear?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  taskId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}