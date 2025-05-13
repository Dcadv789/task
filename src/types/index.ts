export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'baixa' | 'média' | 'alta';
  status: 'em_aberto' | 'em_andamento' | 'concluido' | 'nao_feito';
  dueDate: string | null;
  createdAt: string;
  clientId: string | null;
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