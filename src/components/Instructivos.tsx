import { useState, useRef } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Copy,
  Check,
  Upload,
  X,
  FileText,
  Download,
  FileUp,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { supabase } from '../lib/supabase';

export function Instructivos() {
  const { state, updateProduct, addProduct, deleteProduct, logActivity } = useApp();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{ name: string; instructive: string; imageUrl?: string }>({
    name: '',
    instructive: '',
    imageUrl: '',
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', content: '', imageUrl: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Productos con instructivos
  const productsWithInstructives = state.products.filter(p => p.instructive && p.instructive.trim() !== '');

  const handleCopy = async (product: Product) => {
    if (!product.instructive) return;
    try {
      await navigator.clipboard.writeText(product.instructive);
      setCopiedId(product.id);
      logActivity('instructive_copied', `Instructivo "${product.name}" copiado al portapapeles`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name,
      instructive: product.instructive || '',
      imageUrl: product.imageUrl || '',
    });
    setIsEditing(true);
  };

  const handleDelete = (product: Product) => {
    if (confirm(`¿Eliminar el instructivo de "${product.name}"?`)) {
      deleteProduct(product);
      logActivity('instructive_deleted', `Instructivo "${product.name}" eliminado`);
      setShowDeleteConfirm(null);
    }
  };

  const handleSaveEdit = () => {
    if (selectedProduct) {
      updateProduct({
        ...selectedProduct,
        name: editForm.name,
        instructive: editForm.instructive,
        imageUrl: editForm.imageUrl || undefined,
      });
      setIsEditing(false);
      setSelectedProduct(null);
      logActivity('instructive_updated', `Instructivo "${editForm.name}" actualizado`);
    }
  };

  const handleAddNew = () => {
    if (newForm.title.trim() && newForm.content.trim()) {
      addProduct({
        name: newForm.title,
        icon: 'tv',
        plans: [],
        color: '#6366f1',
        imageUrl: newForm.imageUrl || undefined,
        instructive: newForm.content,
      });
      setNewForm({ title: '', content: '', imageUrl: '' });
      setShowAddModal(false);
      logActivity('instructive_created', `Producto "${newForm.title}" creado con instructivo`);
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

  const getDefaultImage = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('chatgpt')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/960px-ChatGPT_logo.svg.png';
    }
    if (nameLower.includes('netflix')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Logonetflix.png';
    }
    if (nameLower.includes('spotify')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/7/71/Spotify.png';
    }
    if (nameLower.includes('disney')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Disney_plus_icon.png';
    }
    if (nameLower.includes('amazon') || nameLower.includes('prime')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/3840px-Amazon_Prime_Video_logo.svg.png';
    }
    if (nameLower.includes('hbo')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/HBO_Max_%282025%29.svg/1280px-HBO_Max_%282025%29.svg.png';
    }
    if (nameLower.includes('youtube')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/YouTube_Premium_logo.svg/1280px-YouTube_Premium_logo.svg.png';
    }
    if (nameLower.includes('crunchyroll')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/0/08/Crunchyroll_Logo.png';
    }
    if (nameLower.includes('maxplayer') || nameLower.includes('max player')) {
      return '/images/maxplayer-logo.png';
    }
    return '';
  };

  // Exportar instructivos a archivo JSON
  const handleExport = () => {
    const dataToExport = productsWithInstructives.map(p => ({
      name: p.name,
      instructive: p.instructive,
      imageUrl: p.imageUrl || '',
    }));

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `instructivos-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    logActivity('instructive_created', `Exportados ${productsWithInstructives.length} instructivos`);
  };

  // Manejar archivo de importación
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedData = JSON.parse(content);

        if (!Array.isArray(importedData)) {
          setImportMessage({ type: 'error', text: 'El archivo no tiene el formato correcto' });
          return;
        }

        let added = 0;
        for (const item of importedData) {
          if (item.name && item.instructive) {
            // Verificar si ya existe uno con el mismo nombre
            const exists = state.products.some(
              p => p.name.toLowerCase() === item.name.toLowerCase()
            );
            if (!exists) {
              addProduct({
                name: item.name,
                icon: 'tv',
                plans: [],
                color: '#6366f1',
                imageUrl: item.imageUrl || undefined,
                instructive: item.instructive,
              });
              added++;
            }
          }
        }

        if (added > 0) {
          setImportMessage({ type: 'success', text: `Se importaron ${added} instructivos exitosamente` });
          logActivity('instructive_created', `Importados ${added} instructivos`);
          setTimeout(() => {
            setShowImportModal(false);
            setImportMessage(null);
          }, 2000);
        } else {
          setImportMessage({ type: 'error', text: 'Todos los instructivos ya existen o el archivo está vacío' });
        }
      } catch (err) {
        setImportMessage({ type: 'error', text: 'Error al leer el archivo JSON' });
      }
    };
    reader.readAsText(file);

    // Limpiar el input
    if (e.target) e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-indigo-400" />
            Instructivos
          </h2>
          <p className="text-gray-400 mt-1">
            Instructivos para entregar a tus clientes
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors flex items-center gap-2"
            title="Importar instructivos"
          >
            <FileUp className="w-4 h-4" />
            Importar
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2"
            title="Exportar instructivos"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#16213e] rounded-xl p-4 border border-gray-700/50">
          <p className="text-2xl font-bold text-white">{productsWithInstructives.length}</p>
          <p className="text-sm text-gray-400">Total de instructivos</p>
        </div>
        <div className="bg-[#16213e] rounded-xl p-4 border border-gray-700/50">
          <p className="text-2xl font-bold text-green-400">
            {productsWithInstructives.filter(p => (p.instructive?.length || 0) > 100).length}
          </p>
          <p className="text-sm text-gray-400">Con contenido completo</p>
        </div>
        <div className="bg-[#16213e] rounded-xl p-4 border border-gray-700/50">
          <p className="text-2xl font-bold text-purple-400">
            {productsWithInstructives.filter(p => p.imageUrl).length}
          </p>
          <p className="text-sm text-gray-400">Con imagen personalizada</p>
        </div>
      </div>

      {/* Cards Grid */}
      {productsWithInstructives.length === 0 ? (
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
          {productsWithInstructives.map((product) => {
            const imageUrl = product.imageUrl || getDefaultImage(product.name);
            const isCopied = copiedId === product.id;

            return (
              <div
                key={product.id}
                className="bg-[#16213e] rounded-lg border border-gray-700/50 overflow-hidden hover:border-indigo-500/50 transition-all group cursor-pointer"
              >
                {/* Image pequeño */}
                <div className="relative h-16 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <FileText className="w-6 h-6 text-gray-600" />
                  )}

                  {/* Overlay buttons compactos */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleCopy(product)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isCopied
                          ? 'bg-green-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                      title="Copiar"
                    >
                      {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Content compacto */}
                <div className="p-1.5">
                  <h3 className="text-xs font-medium text-white truncate text-center">{product.name}</h3>
                  <button
                    onClick={() => handleCopy(product)}
                    className={`w-full mt-1 py-1 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                      isCopied
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3" />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="bg-indigo-600/20 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Editar Instructivo</h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedProduct(null);
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
                  Nombre del Servicio
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
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

              {/* Instructive Content */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contenido del Instructivo
                </label>
                <textarea
                  value={editForm.instructive}
                  onChange={(e) => setEditForm(prev => ({ ...prev, instructive: e.target.value }))}
                  rows={12}
                  className="w-full px-4 py-3 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                  placeholder="Escribe aquí el instructivo completo..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editForm.instructive.length} caracteres
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedProduct(null);
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

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-green-600/20 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <FileUp className="w-5 h-5" />
                Importar Instructivos
              </h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportMessage(null);
                }}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {importMessage && (
                <div className={`mb-4 p-3 rounded-lg ${
                  importMessage.type === 'success'
                    ? 'bg-green-600/20 border border-green-500 text-green-400'
                    : 'bg-red-600/20 border border-red-500 text-red-400'
                }`}>
                  {importMessage.text}
                </div>
              )}

              <p className="text-gray-300 mb-4">
                Selecciona un archivo JSON previamente exportado con tus instructivos.
              </p>

              <input
                ref={importFileRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />

              <button
                onClick={() => importFileRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-gray-600 rounded-xl hover:border-green-500 hover:bg-green-600/10 transition-all flex flex-col items-center justify-center gap-2"
              >
                <FileUp className="w-8 h-8 text-gray-400" />
                <span className="text-gray-300">Seleccionar archivo JSON</span>
                <span className="text-xs text-gray-500">instructivos-backup-*.json</span>
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Los instructivos que ya existen serán omitidos durante la importación.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
