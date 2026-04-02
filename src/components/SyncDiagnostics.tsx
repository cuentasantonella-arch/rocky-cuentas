import { useState, useEffect } from 'react';
import { RefreshCw, Wifi, WifiOff, Check, X, AlertTriangle, Database, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface TableSyncStatus {
  name: string;
  label: string;
  status: 'loading' | 'connected' | 'disconnected' | 'unknown';
  lastSync?: string;
  records: number;
}

export function SyncDiagnostics() {
  const { state, isOnline, refreshData } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastFullSync, setLastFullSync] = useState<Date | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Estado de sincronización por tabla
  const [tableStatus, setTableStatus] = useState<Record<string, 'loading' | 'connected' | 'disconnected' | 'unknown'>>({
    accounts: 'unknown',
    products: 'unknown',
    instructives: 'unknown',
    providers: 'unknown',
    clients: 'unknown',
    settings: 'unknown',
  });

  // Simular verificación de sincronización basada en los datos cargados
  useEffect(() => {
    const checkSyncStatus = () => {
      const newStatus: Record<string, 'loading' | 'connected' | 'disconnected' | 'unknown'> = {};

      // Accounts: siempre funciona porque es la tabla principal
      newStatus.accounts = isOnline ? 'connected' : 'disconnected';

      // Products: si hay datos, está sincronizado
      newStatus.products = state.products.length > 0 && isOnline ? 'connected' : 'unknown';

      // Instructives: si hay datos, está sincronizado
      newStatus.instructives = state.instructives.length > 0 && isOnline ? 'connected' : 'unknown';

      // Providers: si hay datos, está sincronizado
      newStatus.providers = state.providers.length > 0 && isOnline ? 'connected' : 'unknown';

      // Clients: si hay datos, está sincronizado
      newStatus.clients = state.clients.length > 0 && isOnline ? 'connected' : 'unknown';

      // Settings: si hay datos, está sincronizado
      newStatus.settings = isOnline ? 'connected' : 'disconnected';

      setTableStatus(newStatus);
    };

    checkSyncStatus();
    const interval = setInterval(checkSyncStatus, 10000); // Verificar cada 10 segundos

    return () => clearInterval(interval);
  }, [state, isOnline]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setLastFullSync(new Date());
    setIsRefreshing(false);
  };

  const getStatusIcon = (status: 'loading' | 'connected' | 'disconnected' | 'unknown') => {
    switch (status) {
      case 'connected':
        return <Check className="w-4 h-4 text-green-400" />;
      case 'disconnected':
        return <X className="w-4 h-4 text-red-400" />;
      case 'loading':
        return <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: 'loading' | 'connected' | 'disconnected' | 'unknown') => {
    switch (status) {
      case 'connected':
        return 'Sincronizado';
      case 'disconnected':
        return 'Sin conexión';
      case 'loading':
        return 'Cargando...';
      default:
        return 'Desconocido';
    }
  };

  const tables: { key: string; label: string; count: number }[] = [
    { key: 'accounts', label: 'Cuentas', count: state.accounts.length },
    { key: 'products', label: 'Productos', count: state.products.length },
    { key: 'instructives', label: 'Instructivos', count: state.instructives.length },
    { key: 'providers', label: 'Proveedores', count: state.providers.length },
    { key: 'clients', label: 'Clientes', count: state.clients.length },
    { key: 'settings', label: 'Configuración', count: 1 },
  ];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
      }}
    >
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer"
        style={{ borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{
              backgroundColor: isOnline ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            }}
          >
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div>
            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
              Estado de Sincronización
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {isOnline ? 'Conectado a Supabase' : 'Modo offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            className="p-2 rounded-lg transition-colors hover:bg-gray-700/50"
            style={{ color: 'var(--text-muted)' }}
            title="Forzar sincronización"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <span
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Estado general */}
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-elevated)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Conexión a Supabase
              </span>
              <span
                className="px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: isOnline ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: isOnline ? '#22c55e' : '#ef4444',
                }}
              >
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            {lastFullSync && (
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Clock className="w-3 h-3" />
                Última sincronización completa: {lastFullSync.toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Tablas */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <Database className="w-4 h-4" />
              Estado de tablas:
            </div>
            {tables.map((table) => (
              <div
                key={table.key}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: 'var(--bg-elevated)' }}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(tableStatus[table.key])}
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {table.label}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {table.count} registros
                    </p>
                  </div>
                </div>
                <span
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor:
                      tableStatus[table.key] === 'connected'
                        ? 'rgba(34, 197, 94, 0.2)'
                        : tableStatus[table.key] === 'disconnected'
                        ? 'rgba(239, 68, 68, 0.2)'
                        : 'rgba(156, 163, 175, 0.2)',
                    color:
                      tableStatus[table.key] === 'connected'
                        ? '#22c55e'
                        : tableStatus[table.key] === 'disconnected'
                        ? '#ef4444'
                        : '#9ca3af',
                  }}
                >
                  {getStatusText(tableStatus[table.key])}
                </span>
              </div>
            ))}
          </div>

          {/* Instrucciones si hay problemas */}
          {!isOnline && (
            <div
              className="p-3 rounded-lg border"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
              }}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <p className="font-medium mb-1" style={{ color: '#ef4444' }}>
                    Modo offline detectado
                  </p>
                  <p>
                    Los cambios se guardarán localmente y se sincronizarán cuando
                    la conexión se restaure.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Instrucciones para habilitar Realtime */}
          <div
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderColor: 'rgba(59, 130, 246, 0.3)',
            }}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-400 mt-0.5" />
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                <p className="font-medium mb-2" style={{ color: '#3b82f6' }}>
                  ¿Los cambios no se ven en otras PC?
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Ve a tu proyecto en supabase.com/dashboard</li>
                  <li>Ve a Database &gt; Tables</li>
                  <li>Selecciona cada tabla y habilita "Enable Replication"</li>
                  <li>Espera 1-2 minutos y refresca la página</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
