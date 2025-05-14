import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { TaskList } from '../../types';
import { 
  CheckSquare, 
  Calendar, 
  StickyNote, 
  Plus, 
  User, 
  Briefcase, 
  Folder, 
  Hash,
  Users,
  LayoutDashboard,
  RefreshCw
} from 'lucide-react';

const iconsMap: Record<string, React.ReactNode> = {
  'user': <User size={18} />,
  'briefcase': <Briefcase size={18} />,
  'folder': <Folder size={18} />
};

export const Sidebar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    lists, 
    selectedListId, 
    setSelectedListId,
    clients,
    selectedClientId,
    setSelectedClientId
  } = useAppContext();

  const handleListClick = (listId: string) => {
    setSelectedListId(listId === selectedListId ? null : listId);
    setActiveView('tarefas');
  };

  const handleClientClick = (clientId: string) => {
    setSelectedClientId(clientId === selectedClientId ? null : clientId);
    setActiveView('tarefas');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto flex-shrink-0">
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-800 mb-6">GerenciaTarefas</h1>

        <div className="space-y-8">
          {/* Seções principais */}
          <div className="space-y-1">
            <button 
              className={`flex items-center w-full p-2 rounded-lg text-left ${
                activeView === 'dashboard'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => {
                setActiveView('dashboard');
                setSelectedListId(null);
                setSelectedClientId(null);
              }}
            >
              <LayoutDashboard size={18} className="mr-2" />
              <span>Dashboard</span>
            </button>
            
            <button 
              className={`flex items-center w-full p-2 rounded-lg text-left ${
                activeView === 'tarefas' && !selectedListId && !selectedClientId
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => {
                setActiveView('tarefas');
                setSelectedListId(null);
                setSelectedClientId(null);
              }}
            >
              <CheckSquare size={18} className="mr-2" />
              <span>Todas as Tarefas</span>
            </button>
            
            <button 
              className={`flex items-center w-full p-2 rounded-lg text-left ${
                activeView === 'recorrentes'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => {
                setActiveView('recorrentes');
                setSelectedListId(null);
                setSelectedClientId(null);
              }}
            >
              <RefreshCw size={18} className="mr-2" />
              <span>Tarefas Recorrentes</span>
            </button>
            
            <button 
              className={`flex items-center w-full p-2 rounded-lg text-left ${
                activeView === 'calendario'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveView('calendario')}
            >
              <Calendar size={18} className="mr-2" />
              <span>Calendário</span>
            </button>
            
            <button 
              className={`flex items-center w-full p-2 rounded-lg text-left ${
                activeView === 'notas'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveView('notas')}
            >
              <StickyNote size={18} className="mr-2" />
              <span>Notas</span>
            </button>
          </div>

          {/* Listas de tarefas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Minhas Listas
              </h2>
              <button 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                aria-label="Adicionar lista"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="space-y-1">
              {lists.map((list: TaskList) => (
                <button
                  key={list.id}
                  className={`flex items-center w-full p-2 rounded-lg text-left ${
                    selectedListId === list.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => handleListClick(list.id)}
                >
                  <span 
                    className="mr-2 flex-shrink-0" 
                    style={{ color: list.color }}
                  >
                    {iconsMap[list.icon] || <Hash size={18} />}
                  </span>
                  <span className="truncate">{list.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Clientes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Clientes
              </h2>
              <button 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                aria-label="Adicionar cliente"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="space-y-1">
              {clients.map((client) => (
                <button
                  key={client.id}
                  className={`flex items-center w-full p-2 rounded-lg text-left ${
                    selectedClientId === client.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => handleClientClick(client.id)}
                >
                  <Users size={18} className="mr-2 text-gray-500" />
                  <span className="truncate">{client.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;