import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAppContext } from '../../context/AppContext';
import TasksView from '../views/TasksView';
import CalendarView from '../views/CalendarView';
import NotesView from '../views/NotesView';

export const Layout: React.FC = () => {
  const { activeView } = useAppContext();

  const renderMainContent = () => {
    switch (activeView) {
      case 'tarefas':
        return <TasksView />;
      case 'calendario':
        return <CalendarView />;
      case 'notas':
        return <NotesView />;
      default:
        return <TasksView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default Layout;