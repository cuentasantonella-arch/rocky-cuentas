import { useState } from 'react';
import { RefreshCw, Check, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function SyncButton() {
  const { isOnline, refreshData } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setSyncStatus('idle');

    try {
      await refreshData();
      setLastSync(new Date());
      setSyncStatus('success');

      // Reset status after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('Error de sincronización:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-400" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-400" />
        )}
        <span
          className="text-sm px-2 py-1 rounded"
          style={{
            backgroundColor: isOnline ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: isOnline ? '#22c55e' : '#ef4444',
          }}
        >
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Sync Button */}
      <button
        onClick={handleSync}
        disabled={isSyncing || !isOnline}
        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
        style={{
          backgroundColor: syncStatus === 'success'
            ? 'rgba(34, 197, 94, 0.2)'
            : syncStatus === 'error'
            ? 'rgba(239, 68, 68, 0.2)'
            : 'var(--accent-primary)',
          color: syncStatus !== 'idle' ? 'white' : 'white',
          opacity: isSyncing || !isOnline ? 0.6 : 1,
          cursor: isSyncing || !isOnline ? 'not-allowed' : 'pointer',
        }}
        title="Sincronizar datos con Supabase"
      >
        {isSyncing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Sincronizando...
          </>
        ) : syncStatus === 'success' ? (
          <>
            <Check className="w-4 h-4" />
            ¡Sincronizado!
          </>
        ) : syncStatus === 'error' ? (
          <>
            <AlertCircle className="w-4 h-4" />
            Error
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            Sincronizar
          </>
        )}
      </button>

      {/* Last Sync Time */}
      {lastSync && syncStatus === 'idle' && (
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Última sync: {lastSync.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
