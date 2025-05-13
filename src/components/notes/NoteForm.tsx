import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { X } from 'lucide-react';

interface NoteFormProps {
  noteId?: string | null;
  onClose: () => void;
}

const NoteForm: React.FC<NoteFormProps> = ({ noteId, onClose }) => {
  const { notes, addNote, updateNote } = useAppContext();
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  useEffect(() => {
    if (noteId) {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
      }
    }
  }, [noteId, notes]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    if (noteId) {
      updateNote(noteId, { title, content });
    } else {
      addNote({ title, content });
    }
    
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">
            {noteId ? 'Editar Nota' : 'Nova Nota'}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                id="title"
                type="text"
                className="w-full rounded-md border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Título da nota"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Conteúdo
              </label>
              <textarea
                id="content"
                className="w-full rounded-md border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Conteúdo da nota..."
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end pt-4 space-x-2">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {noteId ? 'Salvar Alterações' : 'Criar Nota'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteForm;