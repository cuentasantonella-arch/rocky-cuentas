import { useState, useMemo } from 'react';
import {
  StickyNote,
  Plus,
  X,
  Pin,
  PinOff,
  Trash2,
  Edit3,
  Check,
  Search,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Note } from '../types';

const NOTE_COLORS = [
  { name: 'Amarillo', value: '#fef08a', textColor: 'text-gray-800' },
  { name: 'Verde', value: '#bbf7d0', textColor: 'text-gray-800' },
  { name: 'Azul', value: '#bfdbfe', textColor: 'text-gray-800' },
  { name: 'Rosa', value: '#fbcfe8', textColor: 'text-gray-800' },
  { name: 'Púrpura', value: '#ddd6fe', textColor: 'text-gray-800' },
  { name: 'Naranja', value: '#fed7aa', textColor: 'text-gray-800' },
];

export function Notes() {
  const { state, addNote, updateNote, deleteNote } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    color: NOTE_COLORS[0].value,
    isPinned: false,
  });

  // Sort notes: pinned first, then by updated date
  const sortedNotes = useMemo(() => {
    let notes = [...state.notes];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      notes = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.content.toLowerCase().includes(query)
      );
    }

    // Sort: pinned first, then by updatedAt
    return notes.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [state.notes, searchQuery]);

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      title: '',
      content: '',
      color: NOTE_COLORS[0].value,
      isPinned: false,
    });
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return;

    if (editingId) {
      const existingNote = state.notes.find((n) => n.id === editingId);
      if (existingNote) {
        await updateNote({
          ...existingNote,
          title: formData.title,
          content: formData.content,
          color: formData.color,
          isPinned: formData.isPinned,
        });
      }
      setEditingId(null);
    } else {
      await addNote({
        title: formData.title,
        content: formData.content,
        color: formData.color,
        isPinned: formData.isPinned,
      });
      setIsCreating(false);
    }

    setFormData({
      title: '',
      content: '',
      color: NOTE_COLORS[0].value,
      isPinned: false,
    });
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setFormData({
      title: note.title,
      content: note.content,
      color: note.color,
      isPinned: note.isPinned,
    });
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({
      title: '',
      content: '',
      color: NOTE_COLORS[0].value,
      isPinned: false,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta nota?')) {
      await deleteNote(id);
    }
  };

  const togglePin = async (note: Note) => {
    await updateNote({
      ...note,
      isPinned: !note.isPinned,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <StickyNote className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Notas</h1>
            <p className="text-sm text-gray-400">{state.notes.length} nota(s)</p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Nueva Nota
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar notas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#1a1f35] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
        />
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="mb-6 p-4 bg-[#16213e] rounded-xl border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            {editingId ? (
              <Edit3 className="w-5 h-5 text-yellow-400" />
            ) : (
              <Plus className="w-5 h-5 text-green-400" />
            )}
            <span className="font-medium text-white">
              {editingId ? 'Editar Nota' : 'Nueva Nota'}
            </span>
          </div>

          <input
            type="text"
            placeholder="Título de la nota..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#1a1f35] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 mb-3"
            autoFocus
          />

          <textarea
            placeholder="Contenido de la nota..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={4}
            className="w-full px-4 py-2.5 bg-[#1a1f35] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 mb-3 resize-none"
          />

          {/* Color Picker */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Color</label>
            <div className="flex gap-2">
              {NOTE_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`w-8 h-8 rounded-lg transition-transform ${
                    formData.color === color.value ? 'ring-2 ring-white scale-110' : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Pin Toggle */}
          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              className="w-4 h-4 rounded border-gray-600 bg-[#1a1f35] text-yellow-500 focus:ring-yellow-500"
            />
            <Pin className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">Fijar en la parte superior</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={!formData.title.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {editingId ? 'Actualizar' : 'Guardar'}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      {sortedNotes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <StickyNote className="w-16 h-16 text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            {searchQuery ? 'No se encontraron notas' : 'No hay notas'}
          </h3>
          <p className="text-sm text-gray-500">
            {searchQuery
              ? 'Intenta con otro término de búsqueda'
              : 'Crea tu primera nota para empezar'}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedNotes.map((note) => {
              const colorConfig = NOTE_COLORS.find((c) => c.value === note.color) || NOTE_COLORS[0];
              return (
                <div
                  key={note.id}
                  className="p-4 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors"
                  style={{ backgroundColor: note.color }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {note.isPinned && (
                        <Pin className="w-4 h-4 text-gray-600" />
                      )}
                      <h3 className={`font-semibold ${colorConfig.textColor}`}>
                        {note.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => togglePin(note)}
                        className="p-1.5 hover:bg-black/10 rounded-lg transition-colors"
                        title={note.isPinned ? 'Desfijar' : 'Fijar'}
                      >
                        {note.isPinned ? (
                          <PinOff className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Pin className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(note)}
                        className="p-1.5 hover:bg-black/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-1.5 hover:bg-black/10 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  {note.content && (
                    <p className={`text-sm mb-3 whitespace-pre-wrap ${colorConfig.textColor.replace('800', '700')}`}>
                      {note.content}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(note.updatedAt)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
