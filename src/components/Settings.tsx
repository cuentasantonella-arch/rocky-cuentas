import { useState, useRef } from 'react';
import { Save, Bell, DollarSign, Building, Users, Plus, Edit2, Trash2, X, Crown, User, Image, Link, Upload, Trash, Download, Database, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { User as UserType, UserRole } from '../types';

export function SettingsPanel() {
  const { state, updateSettings, dispatch } = useApp();
  const { users, addUser, updateUser, deleteUser, isAdmin, currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreFileRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    businessName: state.settings.businessName,
    currency: state.settings.currency,
    currencySymbol: state.settings.currencySymbol,
    alarmDays: state.settings.alarmDays.join(','),
    logoUrl: state.settings.logoUrl || '',
  });

  const [saved, setSaved] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Logo upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setFormData({ ...formData, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData({ ...formData, logoUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Backup/Restore functions
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: {
        accounts: state.accounts,
        products: state.products,
        providers: state.providers,
        clients: state.clients,
        settings: state.settings,
        activityLog: state.activityLog,
        instructives: state.instructives,
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rocky-cuentas-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const backupData = JSON.parse(content);

        if (!backupData.version || !backupData.data) {
          throw new Error('Formato de archivo no válido');
        }

        const { accounts, products, providers, clients, settings, activityLog, instructives } = backupData.data;

        // Confirmar antes de restaurar
        if (!confirm('¿Estás seguro de restaurar el backup? Esto reemplazará todos los datos actuales.')) {
          return;
        }

        // Restaurar datos
        dispatch({ type: 'SET_STATE', payload: {
          accounts: accounts || [],
          products: products || [],
          providers: providers || [],
          clients: clients || [],
          settings: settings || state.settings,
          activityLog: activityLog || [],
          instructives: instructives || [],
        }});

        setRestoreMessage({ type: 'success', text: '¡Backup restaurado correctamente!' });
        setTimeout(() => setRestoreMessage(null), 3000);
      } catch (error) {
        setRestoreMessage({ type: 'error', text: 'Error al restaurar: archivo no válido' });
        setTimeout(() => setRestoreMessage(null), 3000);
      }
    };
    reader.readAsText(file);

    // Limpiar el input
    if (restoreFileRef.current) {
      restoreFileRef.current.value = '';
    }
  };

  // User management state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    role: 'collaborator' as UserRole,
    password: '',
  });
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const alarmDaysArray = formData.alarmDays
      .split(',')
      .map((d) => parseInt(d.trim()))
      .filter((d) => !isNaN(d) && d > 0)
      .sort((a, b) => b - a);

    updateSettings({
      businessName: formData.businessName.trim(),
      currency: formData.currency,
      currencySymbol: formData.currencySymbol,
      alarmDays: alarmDaysArray.length > 0 ? alarmDaysArray : [7, 3, 1],
      logoUrl: formData.logoUrl.trim() || undefined,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // User management functions
  const handleOpenUserModal = (user?: UserType) => {
    if (user) {
      setEditingUser(user);
      setUserFormData({
        name: user.name,
        role: user.role,
        password: '', // Don't show password
      });
    } else {
      setEditingUser(null);
      setUserFormData({
        name: '',
        role: 'collaborator',
        password: '',
      });
    }
    setUserError('');
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    setUserError('');
    setUserSuccess('');
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');

    if (!editingUser && !userFormData.password) {
      setUserError('La contraseña es requerida para nuevos usuarios');
      return;
    }

    if (!userFormData.name.trim()) {
      setUserError('Todos los campos son requeridos');
      return;
    }

    try {
      if (editingUser) {
        const updatedUser: UserType = {
          ...editingUser,
          name: userFormData.name.trim(),
          role: userFormData.role,
        };
        if (userFormData.password) {
          updatedUser.password = userFormData.password;
        }
        await updateUser(updatedUser);
        setUserSuccess('Usuario actualizado correctamente');
        setTimeout(() => handleCloseUserModal(), 1500);
      } else {
        const result = await addUser({
          name: userFormData.name.trim(),
          role: userFormData.role,
          password: userFormData.password,
        });
        if (result.success) {
          setUserSuccess(`¡Usuario "${userFormData.name}" creado exitosamente!`);
          setTimeout(() => handleCloseUserModal(), 2000);
        } else {
          setUserError(result.error || 'Error al crear usuario');
        }
      }
    } catch (error) {
      setUserError(error instanceof Error ? error.message : 'Error al guardar usuario');
    }
  };

  const handleDeleteUser = (id: string) => {
    if (id === 'admin') {
      alert('No se puede eliminar el usuario administrador');
      return;
    }
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        deleteUser(id);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Error al eliminar usuario');
      }
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-white mb-1">Configuración</h2>
      <p className="text-gray-400 mb-8">Personaliza el sistema según tus necesidades</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General */}
        <div className="bg-[#16213e] rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Building className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">General</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nombre del Negocio
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Mi Empresa"
              />
            </div>

            {/* Logo del sistema */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Logo del Sistema
              </label>

              {/* Preview del logo actual */}
              {formData.logoUrl && (
                <div className="mb-3 p-4 bg-gray-900/50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="h-12 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span className="text-xs text-gray-500">Logo actual</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                    title="Eliminar logo"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Input oculto para cargar archivo */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
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
                    value={formData.logoUrl.startsWith('data:') ? '' : formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="O pega una URL"
                    disabled={formData.logoUrl.startsWith('data:')}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Image className="w-3 h-3" />
                Formatos: PNG, JPG, GIF (máx. 2MB)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Moneda
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => {
                    const currency = e.target.value;
                    const symbols: Record<string, string> = {
                      USD: '$',
                      EUR: '€',
                      COP: '$',
                      MXN: '$',
                      ARS: '$',
                    };
                    setFormData({
                      ...formData,
                      currency,
                      currencySymbol: symbols[currency] || '$',
                    });
                  }}
                  className="w-full px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="USD">USD - Dólar Estadounidense</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="COP">COP - Peso Colombiano</option>
                  <option value="MXN">MXN - Peso Mexicano</option>
                  <option value="ARS">ARS - Peso Argentino</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Símbolo de Moneda
                </label>
                <input
                  type="text"
                  value={formData.currencySymbol}
                  onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="$"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Alarmas */}
        <div className="bg-[#16213e] rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Bell className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Alarmas</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Días de anticipación para alertas (separados por coma)
            </label>
            <input
              type="text"
              value={formData.alarmDays}
              onChange={(e) => setFormData({ ...formData, alarmDays: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="7, 3, 1"
            />
            <p className="text-xs text-gray-500 mt-2">
              Las cuentas se marcarán como "Por Vencer" o "Crítico" según estos días.
              <br />
              Ejemplo: 7,3,1 = Alerta 7 días antes, 3 días antes y 1 día antes.
            </p>
          </div>

          <div className="mt-6 p-4 bg-[#0f0f1a] rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Vista previa de estados:</h4>
            <div className="space-y-2">
              {formData.alarmDays
                .split(',')
                .map((d) => parseInt(d.trim()))
                .filter((d) => !isNaN(d) && d > 0)
                .sort((a, b) => b - a)
                .map((days, index) => (
                  <div key={days} className="flex items-center gap-3">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        index === 0
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {days} días
                    </div>
                    <span className="text-sm text-gray-400">
                      {index === 0 ? '→ Estado: Por Vencer' : '→ Estado: Crítico'}
                    </span>
                  </div>
                ))}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-700/50">
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                  {'< 0 días'}
                </div>
                <span className="text-sm text-gray-400">→ Estado: Vencida</span>
              </div>
            </div>
          </div>
        </div>

        {/* Guardar */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            Guardar Cambios
          </button>
          {saved && (
            <span className="text-green-400 text-sm animate-pulse">
              ¡Cambios guardados!
            </span>
          )}
        </div>
      </form>

      {/* Backup y Restauración */}
      <div className="mt-8 pt-8 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Database className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Backup y Restauración</h3>
            <p className="text-sm text-gray-400">Guarda y restaura tus datos</p>
          </div>
        </div>

        {/* Mensaje de restore */}
        {restoreMessage && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            restoreMessage.type === 'success'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {restoreMessage.type === 'success' ? '✓' : '✗'} {restoreMessage.text}
          </div>
        )}

        <div className="bg-[#16213e] rounded-xl p-6 border border-gray-700/50">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Exportar */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-4 h-4 text-green-400" />
                <h4 className="text-white font-medium">Exportar Backup</h4>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Descarga todos tus datos en un archivo JSON. Puedes guardarlo en Google Drive u otro lugar.
              </p>
              <button
                onClick={handleExportBackup}
                className="flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-600/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar Backup
              </button>
            </div>

            {/* Importar */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-blue-400" />
                <h4 className="text-white font-medium">Restaurar Backup</h4>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Restaura tus datos desde un archivo JSON. ADVERTENCIA: Esto reemplazará todos los datos actuales.
              </p>
              <input
                ref={restoreFileRef}
                type="file"
                accept=".json"
                onChange={handleRestoreBackup}
                className="hidden"
              />
              <button
                onClick={() => restoreFileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Subir Backup
              </button>
            </div>
          </div>

          {/* Advertencia */}
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-200">
              <strong>Tip:</strong> Para usar en 2 PCs, Exporta el backup, súbelo a Google Drive, descárgalo en el otro PC e impórtalo.
            </p>
          </div>
        </div>
      </div>

      {/* Gestión de Usuarios - Solo para administradores */}
      {isAdmin && (
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Gestión de Usuarios</h3>
                <p className="text-sm text-gray-400">Agrega y administra colaboradores</p>
              </div>
            </div>
            <button
              onClick={() => handleOpenUserModal()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Usuario
            </button>
          </div>

          {/* Lista de usuarios */}
          <div className="bg-[#16213e] rounded-xl border border-gray-700/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#0f0f1a]/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Usuario</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rol</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user.role === 'admin' ? 'bg-purple-500/20' : 'bg-gray-700/50'}`}>
                          {user.role === 'admin' ? (
                            <Crown className="w-4 h-4 text-purple-400" />
                          ) : (
                            <User className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <span className="text-white">@{user.name}</span>
                        {currentUser?.id === user.id && (
                          <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs rounded">Tú</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{user.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-gray-700/50 text-gray-400'
                      }`}>
                        {user.role === 'admin' ? 'Administrador' : 'Colaborador'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenUserModal(user)}
                          className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {user.id !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#16213e] px-6 py-4 flex items-center justify-between border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button
                onClick={handleCloseUserModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
              {userError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {userError}
                </div>
              )}
              {userSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                  {userSuccess}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre de Usuario *
                </label>
                <input
                  type="text"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="usuario123"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este será el nombre para iniciar sesión
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Rol *
                </label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as UserRole })}
                  className="w-full px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="collaborator">Colaborador</option>
                  <option value="admin">Administrador</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Los administradores pueden gestionar usuarios y configurações
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Contraseña {editingUser ? '(dejar vacío para no cambiar)' : '*'}
                </label>
                <input
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                  required={!editingUser}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseUserModal}
                  className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors font-medium"
                >
                  {editingUser ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
