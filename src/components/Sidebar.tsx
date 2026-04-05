import { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  CreditCard,
  PlusCircle,
  Upload,
  Package,
  Users,
  User,
  UserCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  Crown,
  History,
  BookOpen,
  Sun,
  Moon,
  Zap,
  RefreshCw,
  Wifi,
  WifiOff,
  Check,
  AlertCircle,
  PackageCheck,
  StickyNote,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getAccountStatus } from '../types';

type Page = 'dashboard' | 'accounts' | 'add' | 'import' | 'products' | 'providers' | 'clients' | 'settings' | 'activity' | 'instructivos' | 'notes';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { state, isOnline, isInitialSync, refreshData } = useApp();
  const { currentUser, logout, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [agregarExpanded, setAgregarExpanded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSync = async () => {
    if (isSyncing || !isOnline) return;
    setIsSyncing(true);
    setSyncStatus('idle');
    try {
      await refreshData();
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const expiringCount = state.accounts.filter(
    (acc) => {
      const status = getAccountStatus(acc.expiryDate, state.settings.alarmDays);
      return status === 'expiring' || status === 'critical' || status === 'expired';
    }
  ).length;

  const totalAccounts = state.accounts.length;

  // Calcular productos con poco stock (2 o menos cuentas disponibles)
  const lowStockProducts = useMemo(() => {
    const productCounts = state.products.map(product => {
      const count = state.accounts.filter(acc =>
        acc.productType === product.name &&
        (acc.saleStatus === 'available' || acc.saleStatus === 'fallen')
      ).length;
      return { product, count };
    });
    return productCounts.filter(p => p.count <= 2 && p.count > 0);
  }, [state.accounts, state.products]);

  const lowStockCount = lowStockProducts.length;

  const navItems = [
    { id: 'dashboard' as Page, label: 'Panel de Control', icon: LayoutDashboard },
    { id: 'accounts' as Page, label: 'Cuentas', icon: CreditCard },
    { id: 'add' as Page, label: 'Agregar', icon: PlusCircle, hasSubmenu: true },
    { id: 'clients' as Page, label: 'Clientes', icon: UserCircle },
    { id: 'products' as Page, label: 'Productos', icon: Package },
    { id: 'providers' as Page, label: 'Proveedores', icon: Users },
    { id: 'notes' as Page, label: 'Notas', icon: StickyNote },
    { id: 'instructivos' as Page, label: 'Instructivos', icon: BookOpen },
    { id: 'activity' as Page, label: 'Historial', icon: History, adminOnly: true },
    { id: 'settings' as Page, label: 'Configuración', icon: Settings },
  ];

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark': return <Moon className="w-4 h-4" />;
      case 'light': return <Sun className="w-4 h-4" />;
      case 'neon': return <Zap className="w-4 h-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'dark': return 'Oscuro';
      case 'light': return 'Claro';
      case 'neon': return 'Neón';
    }
  };

  const cycleTheme = () => {
    const themes: ('dark' | 'light' | 'neon')[] = ['dark', 'light', 'neon'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <aside
      className="flex flex-col transition-all duration-300 border-r"
      style={{
        width: collapsed ? '4rem' : '16rem',
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Logo */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-3">
          {state.settings.logoUrl ? (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden"
              style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
            >
              <img src={state.settings.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)' }}
            >
              <span className="text-white font-bold text-lg">R</span>
            </div>
          )}
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                {state.settings.businessName}
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sistema de Gestión</p>
            </div>
          )}
        </div>
      </div>

      {/* Theme Toggle */}
      {!collapsed && (
        <div className="p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={cycleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
            }}
          >
            {getThemeIcon()}
            <span className="flex-1 text-left text-sm font-medium">{getThemeLabel()}</span>
            <div
              className="px-2 py-0.5 rounded text-xs font-bold"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white',
              }}
            >
              {theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '⚡'}
            </div>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const hasAlert = item.id === 'accounts' && expiringCount > 0;
          const isAgregarActive = item.id === 'add' && (currentPage === 'add' || currentPage === 'import');

          // Si es el item "Agregar" con submenú
          if (item.hasSubmenu) {
            return (
              <div key={item.id}>
                <button
                  onClick={() => setAgregarExpanded(!agregarExpanded)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: isAgregarActive ? 'var(--accent-primary)' : 'transparent',
                    color: isAgregarActive ? 'white' : 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isAgregarActive) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isAgregarActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${agregarExpanded ? 'rotate-90' : ''}`}
                      />
                    </>
                  )}
                </button>

                {/* Submenu */}
                {!collapsed && agregarExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    <button
                      onClick={() => onNavigate('add')}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200"
                      style={{
                        backgroundColor: currentPage === 'add' ? 'var(--accent-secondary)' : 'transparent',
                        color: currentPage === 'add' ? 'white' : 'var(--text-secondary)',
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage !== 'add') {
                          e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage !== 'add') {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }
                      }}
                    >
                      <PlusCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">Agregar Manualmente</span>
                    </button>
                    <button
                      onClick={() => onNavigate('import')}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200"
                      style={{
                        backgroundColor: currentPage === 'import' ? 'var(--accent-secondary)' : 'transparent',
                        color: currentPage === 'import' ? 'white' : 'var(--text-secondary)',
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage !== 'import') {
                          e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage !== 'import') {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }
                      }}
                    >
                      <Upload className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">Importar desde Excel</span>
                    </button>
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <div className="relative">
                <Icon className="w-5 h-5 flex-shrink-0" />
                {/* Badge con total de cuentas */}
                {item.id === 'accounts' && totalAccounts > 0 && (
                  <span
                    className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold rounded-full px-1"
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: 'white',
                    }}
                  >
                    {totalAccounts > 99 ? '99+' : totalAccounts}
                  </span>
                )}
                {/* Badge de alerta (cuentas por vencer) */}
                {hasAlert && (
                  <span
                    className="absolute -top-1 -left-1 flex items-center justify-center w-4 h-4 text-[9px] font-bold rounded-full animate-pulse-slow"
                    style={{
                      backgroundColor: 'var(--warning)',
                      color: 'white',
                    }}
                  >
                    {expiringCount > 9 ? '+' : expiringCount}
                  </span>
                )}
              </div>
              {!collapsed && (
                <>
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  {/* Badge de alerta en texto (cuentas por vencer o vencidas) */}
                  {hasAlert && (
                    <span
                      className="flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full"
                      style={{
                        backgroundColor: 'var(--warning-bg)',
                        color: 'var(--warning)',
                        border: '1px solid var(--warning)',
                      }}
                    >
                      {expiringCount} alertas
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Alert Banner */}
      {!collapsed && expiringCount > 0 && (
        <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: 'var(--warning-bg)',
              borderColor: 'var(--warning)',
              borderWidth: '1px',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-4 h-4" style={{ color: 'var(--warning)' }} />
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--warning)' }}
              >
                {expiringCount} alertas
              </span>
            </div>
            <div className="text-xs" style={{ color: 'var(--warning)' }}>
              <span>por vencer + vencidas</span>
            </div>
            <button
              onClick={() => onNavigate('accounts')}
              className="text-xs transition-colors"
              style={{ color: 'var(--warning)' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Ver alertas →
            </button>
          </div>
        </div>
      )}

      {/* Stock Alert Banner - Productos con poco stock */}
      {!collapsed && lowStockCount > 0 && (
        <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderColor: '#EF4444',
              borderWidth: '1px',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <PackageCheck className="w-4 h-4 text-red-400" />
              <span
                className="text-sm font-medium"
                style={{ color: '#EF4444' }}
              >
                {lowStockCount} producto{lowStockCount !== 1 ? 's' : ''} bajo stock
              </span>
            </div>
            <div className="text-xs" style={{ color: '#F87171' }}>
              <span>Máximo 2 cuentas disponibles</span>
            </div>
            <div className="mt-2 space-y-1">
              {lowStockProducts.slice(0, 3).map(({ product, count }) => (
                <div key={product.id} className="flex items-center justify-between text-xs">
                  <span style={{ color: '#F87171' }}>{product.name}</span>
                  <span
                    className="font-bold px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: count === 1 ? '#EF4444' : count === 2 ? '#F59E0B' : '#EF4444',
                      color: 'white',
                    }}
                  >
                    {count}
                  </span>
                </div>
              ))}
              {lowStockProducts.length > 3 && (
                <span className="text-xs" style={{ color: '#F87171' }}>
                  +{lowStockProducts.length - 3} más
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Menu */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
        {/* Sync Button */}
        {!collapsed && (
          <button
            onClick={handleSync}
            disabled={isSyncing || !isOnline}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-2"
            style={{
              backgroundColor: isInitialSync
                ? 'rgba(99, 102, 241, 0.3)'
                : syncStatus === 'success'
                ? 'rgba(34, 197, 94, 0.2)'
                : syncStatus === 'error'
                ? 'rgba(239, 68, 68, 0.2)'
                : isOnline
                ? 'var(--accent-primary)'
                : 'var(--bg-elevated)',
              opacity: isSyncing || !isOnline ? 0.6 : 1,
            }}
          >
            {isInitialSync ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                <span className="text-sm text-indigo-400 font-medium">Sincronizando...</span>
              </>
            ) : isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span className="text-sm text-white">Sincronizando...</span>
              </>
            ) : syncStatus === 'success' ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">¡Sincronizado!</span>
              </>
            ) : syncStatus === 'error' ? (
              <>
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">Error</span>
              </>
            ) : (
              <>
                <RefreshCw className={`w-4 h-4 ${!isOnline ? 'text-gray-400' : 'text-white'}`} />
                <span className={`text-sm ${!isOnline ? 'text-gray-400' : 'text-white'}`}>
                  Sincronizar
                </span>
                {!isOnline && <span className="text-xs text-gray-500 ml-1">(Offline)</span>}
                {isOnline && <span className="text-xs text-green-400 ml-1">• En línea</span>}
              </>
            )}
          </button>
        )}

        {/* Collapsed Sync Button */}
        {collapsed && (
          <button
            onClick={handleSync}
            disabled={!isOnline}
            className="w-full flex items-center justify-center p-2 rounded-lg mb-2 transition-colors"
            style={{
              backgroundColor: isInitialSync
                ? 'rgba(99, 102, 241, 0.3)'
                : isOnline
                ? 'var(--accent-primary)'
                : 'var(--bg-elevated)',
              opacity: !isOnline ? 0.6 : 1,
            }}
            title={isInitialSync ? 'Sincronizando...' : isOnline ? 'Sincronizar datos' : 'Sin conexión'}
          >
            <RefreshCw className={`w-4 h-4 animate-spin ${isInitialSync ? 'text-indigo-400' : !isOnline ? 'text-gray-400' : 'text-white'}`} />
          </button>
        )}

        {collapsed ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-2 rounded-lg transition-colors"
            style={{ color: 'var(--danger)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--danger-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 p-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--bg-elevated)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
              >
                {isAdmin ? (
                  <Crown className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {currentUser?.name}
                </p>
                <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                  {currentUser?.role === 'admin' ? 'Administrador' : 'Colaborador'}
                </p>
              </div>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-90' : ''}`}
                style={{ color: 'var(--text-muted)' }}
              />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div
                className="absolute bottom-full left-0 right-0 mb-2 rounded-lg shadow-xl overflow-hidden z-50"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div className="p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{currentUser?.name}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-colors"
                  style={{ color: 'var(--danger)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--danger-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
