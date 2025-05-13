import { Task, TaskList, Client, Note, User } from '../types';

export const generateMockData = () => {
  const user: User = {
    id: 'user-1',
    name: 'João Silva',
    email: 'joao@exemplo.com',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  };

  const lists: TaskList[] = [
    {
      id: 'list-1',
      name: 'Pessoal',
      color: '#3366FF',
      icon: 'user',
    },
    {
      id: 'list-2',
      name: 'Trabalho',
      color: '#FF9F1C',
      icon: 'briefcase',
    },
    {
      id: 'list-3',
      name: 'Projetos',
      color: '#2EC4B6',
      icon: 'folder',
    },
  ];

  const clients: Client[] = [
    {
      id: 'client-1',
      name: 'Empresa ABC',
      email: 'contato@abc.com',
      phone: '(11) 98765-4321',
    },
    {
      id: 'client-2',
      name: 'Consultoria XYZ',
      email: 'contato@xyz.com',
      phone: '(11) 91234-5678',
    },
  ];

  const tasks: Task[] = [
    {
      id: 'task-1',
      title: 'Preparar apresentação para reunião',
      description: 'Criar slides para apresentação de resultados do Q1',
      completed: false,
      priority: 'alta',
      status: 'em_aberto',
      dueDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      clientIds: ['client-1'],
      completedClientIds: [],
      listId: 'list-2',
      parentId: null,
      recurrence: null,
      tags: ['apresentação', 'reunião'],
    },
    {
      id: 'task-2',
      title: 'Comprar mantimentos',
      description: 'Fazer compras no supermercado para a semana',
      completed: false,
      priority: 'média',
      status: 'em_aberto',
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      clientIds: [],
      completedClientIds: [],
      listId: 'list-1',
      parentId: null,
      recurrence: {
        type: 'semanal',
        interval: 1,
        endDate: null,
        daysOfWeek: [6],
      },
      tags: ['pessoal', 'compras'],
    },
    {
      id: 'task-3',
      title: 'Revisar proposta comercial',
      description: 'Revisar a proposta antes de enviar para o cliente',
      completed: false,
      priority: 'alta',
      status: 'em_aberto',
      dueDate: new Date(Date.now() + 1 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      clientIds: ['client-1', 'client-2'],
      completedClientIds: [],
      listId: 'list-2',
      parentId: null,
      recurrence: null,
      tags: ['proposta', 'cliente'],
    },
  ];

  const notes: Note[] = [
    {
      id: 'note-1',
      title: 'Ideias para novo projeto',
      content: 'Aqui estão algumas ideias iniciais para o novo projeto:\n\n- Funcionalidade A\n- Funcionalidade B\n- Integração com sistema X',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'note-2',
      title: 'Reunião com cliente',
      content: 'Pontos discutidos na reunião:\n\n1. Orçamento\n2. Prazo de entrega\n3. Requisitos principais',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];

  return {
    user,
    lists,
    clients,
    tasks,
    notes,
  };
};