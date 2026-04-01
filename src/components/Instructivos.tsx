import { useState, useRef } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  Image,
  Upload,
  X,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Instructive } from '../types';

export function Instructivos() {
  const { state, addInstructive, updateInstructive, deleteInstructive, logActivity } = useApp();
  const [selectedInstructive, setSelectedInstructive] = useState<Instructive | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{ title: string; content: string; imageUrl?: string }>({
    title: '',
    content: '',
    imageUrl: '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', content: '', imageUrl: '' });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = async (instructive: Instructive) => {
    try {
      await navigator.clipboard.writeText(instructive.content);
      setCopiedId(instructive.id);
      logActivity('instructive_copied', `Instructivo "${instructive.title}" copiado al portapapeles`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleEdit = (instructive: Instructive) => {
    setSelectedInstructive(instructive);
    setEditForm({
      title: instructive.title,
      content: instructive.content,
      imageUrl: instructive.imageUrl || '',
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (selectedInstructive) {
      updateInstructive({
        ...selectedInstructive,
        title: editForm.title,
        content: editForm.content,
        imageUrl: editForm.imageUrl || undefined,
      });
      setIsEditing(false);
      setSelectedInstructive(null);
    }
  };

  const handleDelete = (id: string) => {
    const instructive = state.instructives.find(i => i.id === id);
    if (instructive) {
      deleteInstructive(id);
      setShowDeleteConfirm(null);
      setSelectedInstructive(null);
    }
  };

  const handleAddNew = () => {
    if (newForm.title.trim() && newForm.content.trim()) {
      addInstructive({
        title: newForm.title,
        content: newForm.content,
        imageUrl: newForm.imageUrl || undefined,
      });
      setNewForm({ title: '', content: '', imageUrl: '' });
      setShowAddModal(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (isEdit) {
          setEditForm(prev => ({ ...prev, imageUrl: base64 }));
        } else {
          setNewForm(prev => ({ ...prev, imageUrl: base64 }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getDefaultImage = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('chatgpt')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/960px-ChatGPT_logo.svg.png';
    }
    if (titleLower.includes('netflix')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Logonetflix.png';
    }
    if (titleLower.includes('spotify')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/7/71/Spotify.png';
    }
    if (titleLower.includes('disney')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Disney_plus_icon.png';
    }
    if (titleLower.includes('amazon') || titleLower.includes('prime')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/3840px-Amazon_Prime_Video_logo.svg.png';
    }
    if (titleLower.includes('hbo')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/HBO_Max_%282025%29.svg/1280px-HBO_Max_%282025%29.svg.png';
    }
    if (titleLower.includes('youtube')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/YouTube_Premium_logo.svg/1280px-YouTube_Premium_logo.svg.png';
    }
    if (titleLower.includes('crunchyroll')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/0/08/Crunchyroll_Logo.png';
    }
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-indigo-400" />
            Instructivos
          </h2>
          <p className="text-gray-400 mt-1">
            Gestiona los instructivos para entregar a tus clientes
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Instructivo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#16213e] rounded-xl p-4 border border-gray-700/50">
          <p className="text-2xl font-bold text-white">{state.instructives.length}</p>
          <p className="text-sm text-gray-400">Total de instructivos</p>
        </div>
        <div className="bg-[#16213e] rounded-xl p-4 border border-gray-700/50">
          <p className="text-2xl font-bold text-green-400">
            {state.instructives.filter(i => i.content.length > 100).length}
          </p>
          <p className="text-sm text-gray-400">Con contenido completo</p>
        </div>
        <div className="bg-[#16213e] rounded-xl p-4 border border-gray-700/50">
          <p className="text-2xl font-bold text-purple-400">
            {state.instructives.filter(i => i.imageUrl).length}
          </p>
          <p className="text-sm text-gray-400">Con imagen personalizada</p>
        </div>
      </div>

      {/* Cards Grid */}
      {state.instructives.length === 0 ? (
        <div className="bg-[#16213e] rounded-xl p-12 text-center border border-gray-700/50">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No hay instructivos</h3>
          <p className="text-gray-500 mb-6">
            Crea instructivos para facilitar la entrega de cuentas a tus clientes.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Crear primer instructivo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {state.instructives.map((instructive) => {
            const imageUrl = instructive.imageUrl || getDefaultImage(instructive.title);
            const isCopied = copiedId === instructive.id;

            return (
              <div
                key={instructive.id}
                className="bg-[#16213e] rounded-xl border border-gray-700/50 overflow-hidden hover:border-indigo-500/50 transition-all group"
              >
                {/* Image */}
                <div className="relative h-32 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={instructive.title}
                      className="w-full h-full object-contain p-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <FileText className="w-12 h-12 text-gray-600" />
                  )}

                  {/* Overlay buttons */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleCopy(instructive)}
                      className={`p-2 rounded-lg transition-colors ${
                        isCopied
                          ? 'bg-green-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                      title="Copiar instructivo"
                    >
                      {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleEdit(instructive)}
                      className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(instructive.id)}
                      className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Copied badge */}
                  {isCopied && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      ¡Copiado!
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2 truncate">{instructive.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                    {instructive.content.substring(0, 80)}
                    {instructive.content.length > 80 ? '...' : ''}
                  </p>
                  <button
                    onClick={() => handleCopy(instructive)}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      isCopied
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar Instructivo
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-red-600/20 px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-red-400">¿Eliminar instructivo?</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-6">
                Esta acción eliminará el instructivo permanentemente. No se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors font-medium"
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && selectedInstructive && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="bg-indigo-600/20 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Editar Instructivo</h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedInstructive(null);
                }}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título del Servicio
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ej: Netflix, ChatGPT, Spotify..."
                />
              </div>

              {/* Image URL or Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Imagen de Portada
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editForm.imageUrl || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="flex-1 px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="URL de la imagen..."
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Subir
                  </button>
                </div>
                {editForm.imageUrl && (
                  <div className="mt-2 relative inline-block">
                    <img
                      src={editForm.imageUrl}
                      alt="Preview"
                      className="h-20 rounded-lg object-contain bg-gray-800"
                    />
                    <button
                      onClick={() => setEditForm(prev => ({ ...prev, imageUrl: '' }))}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contenido del Instructivo
                </label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={12}
                  className="w-full px-4 py-3 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                  placeholder="Escribe aquí el instructivo completo..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editForm.content.length} caracteres
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedInstructive(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors font-medium"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="bg-indigo-600/20 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Nuevo Instructivo</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewForm({ title: '', content: '', imageUrl: '' });
                }}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título del Servicio
                </label>
                <input
                  type="text"
                  value={newForm.title}
                  onChange={(e) => setNewForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ej: Netflix, ChatGPT, Spotify..."
                />
              </div>

              {/* Image URL or Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Imagen de Portada
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newForm.imageUrl || ''}
                    onChange={(e) => setNewForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="flex-1 px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="URL de la imagen..."
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Subir
                  </button>
                </div>
                {newForm.imageUrl && (
                  <div className="mt-2 relative inline-block">
                    <img
                      src={newForm.imageUrl}
                      alt="Preview"
                      className="h-20 rounded-lg object-contain bg-gray-800"
                    />
                    <button
                      onClick={() => setNewForm(prev => ({ ...prev, imageUrl: '' }))}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contenido del Instructivo
                </label>
                <textarea
                  value={newForm.content}
                  onChange={(e) => setNewForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={12}
                  className="w-full px-4 py-3 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                  placeholder="Escribe aquí el instructivo completo..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newForm.content.length} caracteres
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewForm({ title: '', content: '', imageUrl: '' });
                }}
                className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddNew}
                disabled={!newForm.title.trim() || !newForm.content.trim()}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear Instructivo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
