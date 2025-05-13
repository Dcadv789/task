import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Note } from '../../types';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  Grid, 
  List,
  StickyNote
} from 'lucide-react';
import NoteForm from '../notes/NoteForm';
import NoteCard from '../notes/NoteCard';
import { formatDateRelative } from '../../utils/dateUtils';

export const NotesView: React.FC = () => {
  const { notes, searchQuery, setSearchQuery } = useAppContext();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreating, setIsCreating] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  // Filtrar notas com base na busca
  const filteredNotes = notes.filter(note => 
    searchQuery === '' || 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const sortedNotes = [...filteredNotes].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notas</h1>
          <p className="text-gray-500">
            {sortedNotes.length} {sortedNotes.length === 1 ? 'nota' : 'notas'}
          </p>
        </div>
        
        <div className="flex space-x-2">
          {/* Alternar visualização */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button 
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setViewMode('grid')}
              aria-label="Visualização em grade"
            >
              <Grid size={18} />
            </button>
            <button 
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setViewMode('list')}
              aria-label="Visualização em lista"
            >
              <List size={18} />
            </button>
          </div>
          
          {/* Botão Nova Nota */}
          <button 
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            onClick={() => setIsCreating(true)}
          >
            <Plus size={18} className="mr-1" />
            <span>Nova Nota</span>
          </button>
        </div>
      </div>
      
      {/* Barra de busca específica para notas */}
      <div className="mb-6 relative w-full md:w-1/2">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={16} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="py-2 pl-10 pr-4 w-full bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Buscar em suas notas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {isCreating && (
        <div className="mb-6">
          <NoteForm 
            onClose={() => setIsCreating(false)} 
          />
        </div>
      )}
      
      {editingNoteId && (
        <div className="mb-6">
          <NoteForm 
            noteId={editingNoteId}
            onClose={() => setEditingNoteId(null)} 
          />
        </div>
      )}
      
      {sortedNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center p-6">
          <StickyNote size={48} className="text-gray-300 mb-3" />
          <h2 className="text-xl font-medium text-gray-700 mb-1">Nenhuma nota encontrada</h2>
          <p className="text-gray-500 mb-4">
            {searchQuery 
              ? 'Nenhuma nota corresponde à sua busca'
              : 'Adicione uma nova nota para começar'
            }
          </p>
          <button 
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            onClick={() => setIsCreating(true)}
          >
            <Plus size={18} className="mr-1" />
            <span>Nova Nota</span>
          </button>
        </div>
      ) : (
        <div className={`flex-1 ${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-4'
        }`}>
          {sortedNotes.map((note: Note) => (
            <NoteCard 
              key={note.id} 
              note={note}
              viewMode={viewMode}
              onEdit={() => setEditingNoteId(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesView;