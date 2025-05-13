// Importar os novos componentes no topo do arquivo
import TaskObservations from './TaskObservations';
import TaskReminders from './TaskReminders';
import TaskStatusTimer from './TaskStatusTimer';

// Adicionar dentro do componente TaskCard, após as tags existentes
{isExpanded && (
  <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
    <TaskStatusTimer task={task} />
    <TaskObservations task={task} />
    <TaskReminders task={task} />
  </div>
)}

export default TaskStatusTimer