import React from 'react';
import { Note } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { Edit, Trash } from 'lucide-react';
import { formatDateRelative } from '../../utils/dateUtils';

interface NoteCardProps {
  note: Note;
  viewMode: 'grid' | 'list';
  onEdit: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, viewMode, onEdit }) => {
  const { deleteNote } = useAppContext();
  
  // Para visualização em grade, limitar o conteúdo
  const maxContentLength = viewMode === 'grid' ? 150 : 300;
  const displayContent = note.content.length > maxContentLength
    ? `${note.content.substring(0, maxContentLength)}...`
    : note.content;
  
  return (
    <div className={`bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
      viewMode === 'list' ? 'flex' : ''
    }`}>
      {viewMode === 'list' && (
        <div className="bg-yellow-50 w-2"></div>
      )}
      
      <div className="p-4 flex-1">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-900 text-lg mb-1">{note.title}</h3>
          
          <div className="flex space-x-1">
            <button 
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              onClick={onEdit}
              aria-label="Editar nota"
            >
              <Edit size={16} />
            </button>
            <button 
              className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-gray-100"
              onClick={() => deleteNote(note.id)}
              aria-label="Excluir nota"
            >
              <Trash size={16} />
            </button>
          </div>
        </div>
        
        <div className="mt-2 text-gray-600 whitespace-pre-line text-sm">
          {displayContent}
        </div>
        
        <div className="mt-3 text-xs text-gray-500">
          Atualizada {formatDateRelative(note.updatedAt)}
        </div>
      </div>
    </div>
  );
};

export default NoteCard;