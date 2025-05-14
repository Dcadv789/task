import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAppContext } from '../../context/AppContext';
import TasksView from '../views/TasksView';
import CalendarView from '../views/CalendarView';
import NotesView from '../views/NotesView';
import DashboardView from '../views/DashboardView';
import RecurringTasksView from '../views/RecurringTasksView';

export const Layout: React.FC = () => {
  const { activeView } = useAppContext();

  const renderMainContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'tarefas':
        return <TasksView />;
      case 'calendario':
        return <CalendarView />;
      case 'notas':
        return <NotesView />;
      case 'recorrentes':
        return <RecurringTasksView />;
      default:
        return <DashboardView />;
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