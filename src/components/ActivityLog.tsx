import { useState } from 'react';
import {
  History,
  Plus,
  Edit2,
  Trash2,
  ShoppingCart,
  User,
  Users,
  Package,
  Settings,
  LogIn,
  LogOut,
  Download,
  CheckCircle,
  Filter,
  X,
  Calendar,
  Copy,
  Check,
  StickyNote,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityType, formatDate } from '../types';

import { Ban, RefreshCw } from 'lucide-react';

const activityIcons: Record<ActivityType, React.ReactNode> = {
  account_created: <Plus className="w-4 h-4" />,
  account_updated: <Edit2 className="w-4 h-4" />,
  account_deleted: <Trash2 className="w-4 h-4" />,
  account_sold: <ShoppingCart className="w-4 h-4" />,
  account_available: <RefreshCw className="w-4 h-4" />,
  account_fallen: <Ban className="w-4 h-4" />,
  profile_assigned: <User className="w-4 h-4" />,
  client_created: <Plus className="w-4 h-4" />,
  client_updated: <Edit2 className="w-4 h-4" />,
  client_deleted: <Trash2 className="w-4 h-4" />,
  provider_created: <Plus className="w-4 h-4" />,
  provider_updated: <Edit2 className="w-4 h-4" />,
  provider_deleted: <Trash2 className="w-4 h-4" />,
  product_created: <Plus className="w-4 h-4" />,
  product_updated: <Edit2 className="w-4 h-4" />,
  product_deleted: <Trash2 className="w-4 h-4" />,
  user_login: <LogIn className="w-4 h-4" />,
  user_logout: <LogOut className="w-4 h-4" />,
  settings_updated: <Settings className="w-4 h-4" />,
  backup_created: <Download className="w-4 h-4" />,
  instructive_created: <Plus className="w-4 h-4" />,
  instructive_updated: <Edit2 className="w-4 h-4" />,
  instructive_deleted: <Trash2 className="w-4 h-4" />,
  instructive_copied: <Copy className="w-4 h-4" />,
  note_created: <Plus className="w-4 h-4" />,
  note_updated: <Edit2 className="w-4 h-4" />,
  note_deleted: <Trash2 className="w-4 h-4" />,
};

// Componente para copiar cuenta desde historial
function CopyAccountButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Solo copiar el email
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-2 rounded-lg transition-colors ${
        copied
          ? 'bg-green-500/30 text-green-400 hover:bg-green-500/40'
          : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
      }`}
      title="Copiar email"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

const activityColors: Record<ActivityType, string> = {
  account_created: 'bg-green-500/20 text-green-400',
  account_updated: 'bg-blue-500/20 text-blue-400',
  account_deleted: 'bg-red-500/20 text-red-400',
  account_sold: 'bg-purple-500/20 text-purple-400',
  account_available: 'bg-orange-500/20 text-orange-400',
  account_fallen: 'bg-red-500/20 text-red-400',
  profile_assigned: 'bg-cyan-500/20 text-cyan-400',
  client_created: 'bg-green-500/20 text-green-400',
  client_updated: 'bg-blue-500/20 text-blue-400',
  client_deleted: 'bg-red-500/20 text-red-400',
  provider_created: 'bg-green-500/20 text-green-400',
  provider_updated: 'bg-blue-500/20 text-blue-400',
  provider_deleted: 'bg-red-500/20 text-red-400',
  product_created: 'bg-green-500/20 text-green-400',
  product_updated: 'bg-blue-500/20 text-blue-400',
  product_deleted: 'bg-red-500/20 text-red-400',
  user_login: 'bg-gray-500/20 text-gray-400',
  user_logout: 'bg-gray-500/20 text-gray-400',
  settings_updated: 'bg-yellow-500/20 text-yellow-400',
  backup_created: 'bg-indigo-500/20 text-indigo-400',
  instructive_created: 'bg-green-500/20 text-green-400',
  instructive_updated: 'bg-blue-500/20 text-blue-400',
  instructive_deleted: 'bg-red-500/20 text-red-400',
  instructive_copied: 'bg-cyan-500/20 text-cyan-400',
  note_created: 'bg-yellow-500/20 text-yellow-400',
  note_updated: 'bg-yellow-500/20 text-yellow-400',
  note_deleted: 'bg-red-500/20 text-red-400',
};

const activityLabels: Record<ActivityType, string> = {
  account_created: 'Cuenta creada',
  account_updated: 'Cuenta actualizada',
  account_deleted: 'Cuenta eliminada',
  account_sold: 'Cuenta marcada como Vendida',
  account_available: 'Cuenta marcada como Disponible',
  account_fallen: 'Cuenta marcada como Caída',
  profile_assigned: 'Perfil asignado',
  client_created: 'Cliente creado',
  client_updated: 'Cliente actualizado',
  client_deleted: 'Cliente eliminado',
  provider_created: 'Proveedor creado',
  provider_updated: 'Proveedor actualizado',
  provider_deleted: 'Proveedor eliminado',
  product_created: 'Producto creado',
  product_updated: 'Producto actualizado',
  product_deleted: 'Producto eliminado',
  user_login: 'Inicio de sesión',
  user_logout: 'Cierre de sesión',
  settings_updated: 'Configuración actualizada',
  backup_created: 'Backup creado',
  instructive_created: 'Instructivo creado',
  instructive_updated: 'Instructivo actualizado',
  instructive_deleted: 'Instructivo eliminado',
  instructive_copied: 'Instructivo copiado',
  note_created: 'Nota creada',
  note_updated: 'Nota actualizada',
  note_deleted: 'Nota eliminada',
};

export function ActivityLog() {
  const { state, clearActivityLog } = useApp();
  const [filterType, setFilterType] = useState<ActivityType | ''>('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredLog = filterType
    ? state.activityLog.filter((entry) => entry.type === filterType)
    : state.activityLog;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleClearLog = () => {
    clearActivityLog();
    setShowClearConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <History className="w-7 h-7 text-indigo-400" />
            Historial de Actividad
          </h2>
          <p className="text-gray-400 mt-1">Registro de todas las acciones realizadas en el sistema</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ActivityType | '')}
              className="pl-10 pr-8 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              {Object.entries(activityLabels).map(([type, label]) => (
                <option key={type} value={type}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {state.activityLog.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#16213e] rounded-xl p-4 border border-gray-700/50">
          <p className="text-2xl font-bold text-white">{state.activityLog.length}</p>
          <p className="text-sm text-gray-400">Total de actividades</p>
        </div>
        <div className="bg-[#16213e] rounded-xl p-4 border border-gray-700/50">
          <p className="text-2xl font-bold text-green-400">
            {state.activityLog.filter((e) => e.type.includes('created')).length}
          </p>
          <p className="text-sm text-gray-400">Registros nuevos</p>
        </div>
        <div className="bg-[#16213e] rounded-xl p-4 border border-gray-700/50">
          <p className="text-2xl font-bold text-blue-400">
            {state.activityLog.filter((e) => e.type.includes('updated')).length}
          </p>
          <p className="text-sm text-gray-400">Actualizaciones</p>
        </div>
        <div className="bg-[#16213e] rounded-xl p-4 border border-gray-700/50">
          <p className="text-2xl font-bold text-purple-400">
            {state.activityLog.filter((e) => e.type === 'account_sold').length}
          </p>
          <p className="text-sm text-gray-400">Cuentas vendidas</p>
        </div>
      </div>

      {/* Activity List */}
      {filteredLog.length === 0 ? (
        <div className="bg-[#16213e] rounded-xl p-12 text-center border border-gray-700/50">
          <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No hay actividades registradas</h3>
          <p className="text-gray-500">Las actividades aparecerán aquí conforme se realicen acciones en el sistema.</p>
        </div>
      ) : (
        <div className="bg-[#16213e] rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="divide-y divide-gray-700/30 max-h-[600px] overflow-y-auto">
            {filteredLog.map((entry) => (
              <div
                key={entry.id}
                className="p-4 hover:bg-white/5 transition-colors flex items-start gap-4"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activityColors[entry.type]
                  }`}
                >
                  {activityIcons[entry.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white">{activityLabels[entry.type]}</span>
                    {entry.userName && (
                      <span className="text-xs px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded">
                        {entry.userName}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{entry.description}</p>
                  {entry.details && (
                    <p className="text-xs text-gray-500 mt-1 bg-gray-800/50 px-2 py-1 rounded inline-block">
                      {entry.details}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {entry.accountEmail && (
                    <CopyAccountButton email={entry.accountEmail} />
                  )}
                  <div className="text-right">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatTimestamp(entry.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-red-600/20 px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-red-400">¿Limpiar historial?</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-6">
                Esta acción eliminará todo el historial de actividad. Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleClearLog}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors font-medium"
                >
                  Sí, limpiar todo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
