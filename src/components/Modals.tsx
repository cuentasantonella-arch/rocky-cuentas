import { useState, useRef } from 'react';
import { X, Plus, Edit2, Trash2, Image, Link, Send, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, Provider, Client } from '../types';

export function ProductManager() {
  const { state, addProduct, updateProduct, deleteProduct } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [productSearch, setProductSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    icon: 'tv',
    plans: '',
    color: '#6366f1',
    imageUrl: '',
  });

  // Calcular estadísticas por producto
  const getProductStats = (productName: string) => {
    const productAccounts = state.accounts.filter(acc => acc.productType === productName);
    const total = productAccounts.length;
    const disponibles = productAccounts.filter(acc => acc.plan === 'Disponible').length;
    const vendidas = total - disponibles;
    return { total, disponibles, vendidas };
  };

  // Logo upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen debe ser menor a 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, imageUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        icon: product.icon,
        plans: product.plans.join(', '),
        color: product.color,
        imageUrl: product.imageUrl || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', icon: 'tv', plans: '', color: '#6366f1', imageUrl: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ name: '', icon: 'tv', plans: '', color: '#6366f1', imageUrl: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const plansArray = formData.plans.split(',').map((p) => p.trim()).filter(Boolean);

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: formData.name.trim(),
        icon: formData.icon,
        plans: plansArray,
        color: formData.color,
        imageUrl: formData.imageUrl.trim() || undefined,
      });
    } else {
      addProduct({
        name: formData.name.trim(),
        icon: formData.icon,
        plans: plansArray,
        color: formData.color,
        imageUrl: formData.imageUrl.trim() || undefined,
      });
    }

    handleCloseModal();
  };

  const handleDelete = (product: Product) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      deleteProduct(product);
    }
  };

  // Filtrar productos por búsqueda
  const filteredProducts = state.products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestionar Productos</h2>
          <p className="text-gray-400 mt-1">Agrega, edita o elimina tipos de productos con su logo</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </button>
      </div>

      {/* Buscador de productos */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          className="w-full px-4 py-3 pl-10 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {productSearch && (
          <button
            onClick={() => setProductSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Contador de resultados */}
      {productSearch && (
        <p className="text-sm text-gray-400">
          {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-[#16213e] rounded-xl overflow-hidden border border-gray-700/50 hover:border-gray-600 transition-all hover:shadow-lg hover:shadow-black/20"
          >
            {/* Header con imagen mas grande */}
            <div className="relative h-28 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-20 h-20 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: product.color + '30' }}
                >
                  <div
                    className="w-12 h-12 rounded-lg"
                    style={{ backgroundColor: product.color }}
                  />
                </div>
              )}
              {/* Acciones siempre visibles */}
              <div className="absolute top-1 right-1 flex items-center gap-1">
                <button
                  onClick={() => handleOpenModal(product)}
                  className="p-1.5 bg-indigo-600/80 hover:bg-indigo-600 rounded text-white transition-colors shadow-lg"
                  title="Editar"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDelete(product)}
                  className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded text-white transition-colors shadow-lg"
                  title="Eliminar"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-3">
              <h3 className="text-base font-bold text-white truncate text-center leading-tight">{product.name}</h3>
              {/* Estadísticas de cuentas */}
              {(() => {
                const stats = getProductStats(product.name);
                return (
                  <div className="flex items-center justify-center gap-3 mt-3 pt-2 border-t border-gray-700/50">
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">{stats.total}</p>
                      <p className="text-[10px] text-gray-500">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-emerald-400">{stats.disponibles}</p>
                      <p className="text-[10px] text-gray-500">Disp</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-indigo-400">{stats.vendidas}</p>
                      <p className="text-[10px] text-gray-500">Vend</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-[#16213e] px-6 py-4 flex items-center justify-between border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Preview de imagen */}
              {formData.imageUrl && (
                <div className="mb-4 p-4 bg-gray-900/50 rounded-xl flex items-center justify-between">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="h-20 object-contain"
                    onError={() => {
                      alert('No se pudo cargar la imagen.');
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                    title="Eliminar imagen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Netflix, Spotify, etc."
                  required
                />
              </div>

              {/* Logo del producto */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Logo / Imagen del Producto
                </label>

                {/* Input oculto para cargar archivo */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Opciones de carga */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-indigo-400 hover:bg-indigo-600/30 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Subir desde PC</span>
                  </button>
                  <div className="flex-1 relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="url"
                      value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="O pega una URL"
                      disabled={formData.imageUrl.startsWith('data:')}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Image className="w-3 h-3" />
                  Formatos: PNG, JPG, GIF (máx. 2MB)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Planes (separados por coma)
                </label>
                <input
                  type="text"
                  value={formData.plans}
                  onChange={(e) => setFormData({ ...formData, plans: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Plan 1, Plan 2, Plan 3"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ejemplo: Completo 4K, 2 Pantallas, 5 Perfiles
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Color de Marca
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-12 rounded-lg border-2 border-gray-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors font-medium"
                >
                  {editingProduct ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProviderManager() {
  const { state, addProvider, updateProvider, deleteProvider } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    productType: '',
    contact: '',
    email: '',
    telegramUsername: '',
    supportUrl: '',
    notes: '',
  });

  const handleOpenModal = (provider?: Provider) => {
    if (provider) {
      setEditingProvider(provider);
      setFormData({
        name: provider.name,
        productType: provider.productType || '',
        contact: provider.contact || '',
        email: provider.email || '',
        telegramUsername: provider.telegramUsername || '',
        supportUrl: provider.supportUrl || '',
        notes: provider.notes || '',
      });
    } else {
      setEditingProvider(null);
      setFormData({ name: '', productType: '', contact: '', email: '', telegramUsername: '', supportUrl: '', notes: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProvider(null);
    setFormData({ name: '', productType: '', contact: '', email: '', telegramUsername: '', supportUrl: '', notes: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productType) {
      alert('Por favor selecciona el tipo de cuenta que provee este proveedor');
      return;
    }

    if (editingProvider) {
      updateProvider({
        ...editingProvider,
        name: formData.name.trim(),
        productType: formData.productType,
        contact: formData.contact.trim() || undefined,
        email: formData.email.trim() || undefined,
        telegramUsername: formData.telegramUsername.trim() || undefined,
        supportUrl: formData.supportUrl.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });
    } else {
      addProvider({
        name: formData.name.trim(),
        productType: formData.productType,
        contact: formData.contact.trim() || undefined,
        email: formData.email.trim() || undefined,
        telegramUsername: formData.telegramUsername.trim() || undefined,
        supportUrl: formData.supportUrl.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });
    }

    handleCloseModal();
  };

  const handleDelete = (provider: Provider) => {
    if (confirm('¿Estás seguro de eliminar este proveedor?')) {
      deleteProvider(provider);
    }
  };

  // Contar cuentas por proveedor
  const accountsByProvider = state.accounts.reduce((acc, account) => {
    acc[account.provider] = (acc[account.provider] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestionar Proveedores</h2>
          <p className="text-gray-400 mt-1">Agrega, edita o elimina proveedores</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Proveedor
        </button>
      </div>

      {state.providers.length === 0 ? (
        <div className="bg-[#16213e] rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📦</span>
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No hay proveedores</h3>
          <p className="text-gray-500">
            Agrega proveedores para llevar un mejor control.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.providers.map((provider) => {
            // Encontrar el producto para mostrar su logo
            const product = state.products.find(p => p.name === provider.productType);
            return (
              <div
                key={provider.id}
                className="bg-[#16213e] rounded-xl p-5 border border-gray-700/50 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {product?.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={provider.productType}
                        className="w-10 h-10 object-contain rounded"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: (product?.color || '#6366f1') + '30' }}
                      >
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: product?.color || '#6366f1' }}
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">{provider.name}</h3>
                      <p className="text-xs text-indigo-400">{provider.productType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(provider)}
                      className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(provider)}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {provider.email && (
                  <p className="text-sm text-gray-400">{provider.email}</p>
                )}
                {provider.contact && (
                  <p className="text-sm text-gray-400">{provider.contact}</p>
                )}
                {provider.telegramUsername && (
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Send className="w-3 h-3" />
                    @{provider.telegramUsername}
                  </p>
                )}
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                  <p className="text-xs text-gray-500">
                    {accountsByProvider[provider.name] || 0} cuentas activas
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#16213e] px-6 py-4 flex items-center justify-between border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">
                {editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre del Proveedor *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Nombre del proveedor"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tipo de Cuenta que Provee *
                </label>
                <select
                  value={formData.productType}
                  onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar plataforma...</option>
                  {state.products.map((product) => (
                    <option key={product.id} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Indica qué tipo de cuenta de streaming provee este proveedor
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="email@proveedor.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Teléfono / Contacto
                </label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="+57 300 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Usuario Telegram
                </label>
                <div className="relative">
                  <Send className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={formData.telegramUsername}
                    onChange={(e) => setFormData({ ...formData, telegramUsername: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="nombre_usuario"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Sin @ (ejemplo: proveedor123)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  URL de Soporte
                </label>
                <input
                  type="url"
                  value={formData.supportUrl}
                  onChange={(e) => setFormData({ ...formData, supportUrl: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="https://ejemplo.com/soporte"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Aparece en la sección "Soporte" para acceso rápido
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Notas adicionales..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors font-medium"
                >
                  {editingProvider ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function ClientManager() {
  const { state, addClient, updateClient, deleteClient } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    notes: '',
  });

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        contact: client.contact || '',
        email: client.email || '',
        notes: client.notes || '',
      });
    } else {
      setEditingClient(null);
      setFormData({ name: '', contact: '', email: '', notes: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({ name: '', contact: '', email: '', notes: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('El nombre del cliente es requerido');
      return;
    }

    if (editingClient) {
      updateClient({
        ...editingClient,
        name: formData.name.trim(),
        contact: formData.contact.trim() || undefined,
        email: formData.email.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });
    } else {
      addClient({
        name: formData.name.trim(),
        contact: formData.contact.trim() || undefined,
        email: formData.email.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });
    }

    handleCloseModal();
  };

  const handleDelete = (client: Client) => {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      deleteClient(client);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestionar Clientes</h2>
          <p className="text-gray-400 mt-1">Agrega y administra tus clientes</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </button>
      </div>

      {state.clients.length === 0 ? (
        <div className="bg-[#16213e] rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👥</span>
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No hay clientes</h3>
          <p className="text-gray-500">
            Agrega clientes para asignarlos a las cuentas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.clients.map((client) => (
            <div
              key={client.id}
              className="bg-[#16213e] rounded-xl p-5 border border-gray-700/50 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(client)}
                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(client)}
                    className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{client.name}</h3>
              {client.email && (
                <p className="text-sm text-gray-400">{client.email}</p>
              )}
              {client.contact && (
                <p className="text-sm text-gray-400">{client.contact}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#16213e] px-6 py-4 flex items-center justify-between border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">
                {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Nombre del cliente"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="email@cliente.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Teléfono / Contacto
                </label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="+57 300 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Notas adicionales..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors font-medium"
                >
                  {editingClient ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
