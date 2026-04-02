import { useState } from 'react';
import { Plus, Upload, RefreshCw, Trash2, Download, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Account } from '../types';
import { AccountForm } from './AccountForm';
import { AccountTable } from './AccountTable';
import { StatsCards, AlertList } from './StatsCards';
import { ImportExcel } from './ImportExcel';
import { ProductManager, ProviderManager } from './Modals';
import { SettingsPanel } from './Settings';
import { SyncDiagnostics } from './SyncDiagnostics';
import { exportBackupExcel, downloadImportTemplate } from '../utils/export';

type Page = 'dashboard' | 'accounts' | 'add' | 'import' | 'products' | 'providers' | 'settings';

export function Dashboard() {
  const { state } = useApp();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Dashboard
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          Resumen del estado de tus cuentas streaming
        </p>
      </div>

      {/* Sync Diagnostics */}
      <SyncDiagnostics />

      {/* Stats */}
      <StatsCards accounts={state.accounts} />

      {/* Alerts */}
      <AlertList accounts={state.accounts} />

      {/* Quick Actions */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('navigate', { detail: 'add' }));
            }}
            className="flex items-center gap-3 p-4 rounded-lg transition-colors group"
            style={{ backgroundColor: 'var(--bg-elevated)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
          >
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'var(--accent-primary)', opacity: 0.2 }}
            >
              <Plus className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Nueva Cuenta</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Agregar manualmente</p>
            </div>
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('navigate', { detail: 'import' }));
            }}
            className="flex items-center gap-3 p-4 rounded-lg transition-colors group"
            style={{ backgroundColor: 'var(--bg-elevated)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
          >
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'var(--success)', opacity: 0.2 }}
            >
              <Upload className="w-5 h-5" style={{ color: 'var(--success)' }} />
            </div>
            <div>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Importar</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Desde archivo Excel</p>
            </div>
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('navigate', { detail: 'accounts' }));
            }}
            className="flex items-center gap-3 p-4 rounded-lg transition-colors group"
            style={{ backgroundColor: 'var(--bg-elevated)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
          >
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'var(--accent-secondary)', opacity: 0.2 }}
            >
              <RefreshCw className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} />
            </div>
            <div>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Ver Todas</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{state.accounts.length} cuentas</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

export function AccountsPage() {
  const { state, deleteAccount } = useApp();
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Account | null>(null);

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleDuplicate = (account: Account) => {
    const duplicateAccount = {
      ...account,
      id: '',
      email: account.email + ' (copia)',
      profiles: account.profiles?.map(p => ({ ...p, clientId: undefined, clientName: '' })),
    };
    setEditingAccount(duplicateAccount);
    setShowForm(true);
  };

  const handleDelete = (account: Account) => {
    setShowDeleteConfirm(account);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      deleteAccount(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Cuentas</h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Gestiona todas tus cuentas streaming
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAccount(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
        >
          <Plus className="w-4 h-4" />
          Nueva Cuenta
        </button>
      </div>

      <AccountTable
        accounts={state.accounts}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
      />

      {/* Edit/Create Modal */}
      {showForm && (
        <AccountForm
          account={editingAccount || undefined}
          onClose={() => {
            setShowForm(false);
            setEditingAccount(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div
            className="rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            style={{ backgroundColor: 'var(--bg-card)' }}
          >
            <div className="p-6 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'var(--danger-bg)' }}
              >
                <Trash2 className="w-8 h-8" style={{ color: 'var(--danger)' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Eliminar Cuenta
              </h3>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                ¿Estás seguro de eliminar la cuenta de{' '}
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {showDeleteConfirm.clientName}
                </span>
                ? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-6 py-3 rounded-lg transition-colors"
                  style={{
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 rounded-lg transition-colors font-medium"
                  style={{ backgroundColor: 'var(--danger)', color: 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AddAccountPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Agregar Cuenta</h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          Ingresa los datos de una nueva cuenta
        </p>
      </div>

      <div
        className="rounded-xl p-8 text-center"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'var(--accent-primary)', opacity: 0.2 }}
        >
          <Plus className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
        </div>
        <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Nueva Cuenta
        </h3>
        <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
          Completa el formulario para agregar una nueva cuenta
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 rounded-lg transition-colors font-medium"
          style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
        >
          Abrir Formulario
        </button>
      </div>

      {showForm && (
        <AccountForm
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

export function ImportPage() {
  const { state, logActivity } = useApp();
  const [showImport, setShowImport] = useState(false);

  const handleExportBackup = () => {
    if (state.accounts.length === 0) {
      alert('No hay cuentas para exportar');
      return;
    }
    exportBackupExcel(state.accounts);
    logActivity('backup_created', 'Backup de cuentas exportado', `${state.accounts.length} cuentas exportadas`);
  };

  const handleDownloadTemplate = () => {
    downloadImportTemplate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Importar y Exportar Cuentas</h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          Gestiona la importación y exportación de tus cuentas streaming
        </p>
      </div>

      {/* Acciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Importar */}
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: 'var(--success-bg)' }}
            >
              <Upload className="w-6 h-6" style={{ color: 'var(--success)' }} />
            </div>
            <div>
              <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Importar Cuentas</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Desde archivo Excel</p>
            </div>
          </div>
          <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Sube un archivo Excel (.xlsx, .xls, .csv) con tus cuentas para importarlas de forma masiva.
          </p>
          <button
            onClick={() => setShowImport(true)}
            className="w-full px-6 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--success)', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <Upload className="w-4 h-4" />
            Seleccionar Archivo
          </button>
        </div>

        {/* Backup */}
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: 'var(--accent-primary)', opacity: 0.2 }}
            >
              <Download className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div>
              <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Backup de Cuentas</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{state.accounts.length} cuentas</p>
            </div>
          </div>
          <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Exporta todas tus cuentas en un archivo Excel con email, contraseña y fecha de vencimiento.
          </p>
          <button
            onClick={handleExportBackup}
            className="w-full px-6 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
          >
            <Download className="w-4 h-4" />
            Descargar Backup
          </button>
        </div>
      </div>

      {/* Descargar plantilla */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: 'var(--accent-secondary)', opacity: 0.2 }}
            >
              <FileSpreadsheet className="w-6 h-6" style={{ color: 'var(--accent-secondary)' }} />
            </div>
            <div>
              <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Plantilla de Importación</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Descarga la plantilla para importar cuentas</p>
            </div>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="px-6 py-3 rounded-lg transition-colors font-medium flex items-center gap-2"
            style={{ backgroundColor: 'var(--accent-secondary)', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <Download className="w-4 h-4" />
            Descargar Plantilla
          </button>
        </div>
        <div
          className="mt-4 p-4 rounded-lg"
          style={{ backgroundColor: 'var(--bg-elevated)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Cómo usar:</strong> Descarga la plantilla, completa los datos en las columnas correspondientes y luego importa el archivo.
          </p>
        </div>
      </div>

      {showImport && (
        <ImportExcel
          onClose={() => setShowImport(false)}
          onSuccess={() => setShowImport(false)}
        />
      )}
    </div>
  );
}
