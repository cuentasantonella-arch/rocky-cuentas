import { useState, useMemo, Fragment } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Copy,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  ShoppingCart,
  Users,
  ChevronRight,
  Files,
  Share2,
  Check,
  Ban,
  RefreshCw,
  Square,
  CheckSquare,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Account, getAccountStatus, getDaysRemaining, formatDate, AccountStatus, SaleStatus, getProfilesCount, areAllProfilesSold, areAllProfilesMarkedSold, countSoldProfiles, Profile, TWO_SCREEN_PRODUCTS } from '../types';

interface AccountTableProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  onDuplicate: (account: Account) => void;
  showFilters?: boolean;
}

type SortField = 'clientName' | 'productType' | 'expiryDate' | 'saleDate' | 'provider';
type SortDirection = 'asc' | 'desc';

export function AccountTable({ accounts, onEdit, onDelete, onDuplicate, showFilters = true }: AccountTableProps) {
  const { state, updateAccount, addClient, logActivity, deleteAccount } = useApp();
  const [search, setSearch] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterStatus, setFilterStatus] = useState<AccountStatus | ''>('');
  const [filterSale, setFilterSale] = useState<SaleStatus | ''>('');
  const [filterProvider, setFilterProvider] = useState('');
  const [sortField, setSortField] = useState<SortField>('expiryDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [expandedProfiles, setExpandedProfiles] = useState<Record<string, boolean>>({});
  const [copiedProfile, setCopiedProfile] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  // Estado para selección múltiple
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  // Estado para pestañas por producto
  const [selectedProductTab, setSelectedProductTab] = useState<string>('all');

  // Limpiar filtro de producto cuando se cambia de pestaña
  const handleTabChange = (productName: string) => {
    setSelectedProductTab(productName);
    setFilterProduct(''); // Limpiar el dropdown de producto
  };

  // Obtener productos únicos que tienen cuentas
  const productsWithAccounts = useMemo(() => {
    const productNames = new Set(accounts.map(acc => acc.productType));
    return state.products.filter(p => productNames.has(p.name));
  }, [accounts, state.products]);

  // Función para marcar/desmarcar perfil como vendido
  const handleToggleProfileSold = (account: Account, profileSlot: number) => {
    if (!account.profiles) return;

    const updatedProfiles = account.profiles.map(p => {
      if (p.slot === profileSlot) {
        return { ...p, sold: !p.sold };
      }
      return p;
    });

    // Verificar si todos los perfiles están vendidos
    const allSold = updatedProfiles.every(p => p.sold === true);

    updateAccount({
      ...account,
      profiles: updatedProfiles,
      saleStatus: allSold ? 'sold' : 'available',
    });
  };

  // Función para cambiar rápidamente el estado de venta (Vendida/Disponible)
  const handleQuickSaleStatus = (account: Account) => {
    const newStatus: SaleStatus = account.saleStatus === 'sold' ? 'available' : 'sold';

    // Si se marca como vendida, calcular fechas si no existen
    if (newStatus === 'sold' && !account.saleDate) {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const duration = account.duration || 1;
      const totalDays = duration * 30; // 1 mes = 30 días
      const expiryDate = new Date(today);
      expiryDate.setDate(expiryDate.getDate() + totalDays);
      const expiryDateStr = expiryDate.toISOString().split('T')[0];

      updateAccount({
        ...account,
        saleStatus: newStatus,
        saleDate: todayStr,
        expiryDate: expiryDateStr,
      });
      logActivity(
        'account_sold',
        `Cuenta ${account.email} marcada como Vendida`,
        `Producto: ${account.productType} | Plan: ${account.plan} | Duración: ${duration === 1 ? '30 días' : `${duration} meses`}`,
        undefined,
        account.id
      );
    } else if (newStatus === 'available') {
      updateAccount({
        ...account,
        saleStatus: newStatus,
      });
      logActivity(
        'account_available',
        `Cuenta ${account.email} marcada como Disponible`,
        `Producto: ${account.productType} | Plan: ${account.plan}`,
        undefined,
        account.id
      );
    } else {
      updateAccount({
        ...account,
        saleStatus: newStatus,
      });
      logActivity(
        'account_sold',
        `Cuenta ${account.email} marcada como Vendida`,
        `Producto: ${account.productType} | Plan: ${account.plan}`,
        undefined,
        account.id
      );
    }
  };

  // Función para marcar cuenta como CAÍDA
  const handleMarkAsFallen = (account: Account) => {
    const today = new Date().toISOString().split('T')[0];

    // Confirmar con el usuario
    if (confirm(`¿Marcar la cuenta ${account.email} como CAÍDA?\n\nEsto establecerá la fecha de vencimiento a hoy y la marcará como vencida.`)) {
      updateAccount({
        ...account,
        expiryDate: today, // Establecer como vencida hoy
        // Si tiene perfiles, desmarcar todos como vendidos
        profiles: account.profiles?.map(p => ({ ...p, sold: false })),
        saleStatus: 'available' as SaleStatus,
      });
      logActivity(
        'account_fallen',
        `Cuenta ${account.email} marcada como Caída`,
        `Producto: ${account.productType} | Plan: ${account.plan} | Cliente: ${account.clientName || 'N/A'}`,
        undefined,
        account.id
      );
    }
  };

  // Función para marcar todos los perfiles como vendidos
  const handleMarkAllProfilesSold = (account: Account) => {
    if (!account.profiles) return;

    // Calcular fechas de venta
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    // Usar duración existente o 1 mes por defecto (1 mes = 30 días)
    const duration = account.duration || 1;
    const totalDays = duration * 30;
    // Calcular fecha de vencimiento
    const expiryDate = new Date(today);
    expiryDate.setDate(expiryDate.getDate() + totalDays);
    const expiryDateStr = expiryDate.toISOString().split('T')[0];

    const updatedProfiles = account.profiles.map(p => ({
      ...p,
      sold: true,
      clientName: p.clientName || 'Vendido',
    }));

    updateAccount({
      ...account,
      profiles: updatedProfiles,
      saleStatus: 'sold' as SaleStatus,
      saleDate: account.saleDate || todayStr,
      duration: duration,
      expiryDate: account.expiryDate || expiryDateStr,
    });
  };

  // Funciones para selección múltiple
  const toggleSelectAll = () => {
    if (selectedAccounts.size === filteredAndSortedAccounts.length) {
      setSelectedAccounts(new Set());
    } else {
      setSelectedAccounts(new Set(filteredAndSortedAccounts.map(acc => acc.id)));
    }
  };

  const toggleSelectAccount = (accountId: string) => {
    const newSelected = new Set(selectedAccounts);
    if (newSelected.has(accountId)) {
      newSelected.delete(accountId);
    } else {
      newSelected.add(accountId);
    }
    setSelectedAccounts(newSelected);
  };

  // Operaciones masivas
  const handleBulkMarkAsSold = () => {
    if (selectedAccounts.size === 0) return;

    if (!confirm(`¿Marcar ${selectedAccounts.size} cuentas como Vendidas?`)) return;

    selectedAccounts.forEach(accountId => {
      const account = accounts.find(acc => acc.id === accountId);
      if (!account) return;

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const duration = account.duration || 1;
      const totalDays = duration * 30;
      const expiryDate = new Date(today);
      expiryDate.setDate(expiryDate.getDate() + totalDays);
      const expiryDateStr = expiryDate.toISOString().split('T')[0];

      updateAccount({
        ...account,
        saleStatus: 'sold',
        saleDate: account.saleDate || todayStr,
        expiryDate: account.expiryDate || expiryDateStr,
        clientName: account.clientName || 'Cliente',
      });
    });

    logActivity('account_sold', `${selectedAccounts.size} cuentas marcadas como Vendidas`);
    setSelectedAccounts(new Set());
  };

  const handleBulkMarkAsAvailable = () => {
    if (selectedAccounts.size === 0) return;

    if (!confirm(`¿Marcar ${selectedAccounts.size} cuentas como Disponibles?`)) return;

    selectedAccounts.forEach(accountId => {
      const account = accounts.find(acc => acc.id === accountId);
      if (!account) return;

      updateAccount({
        ...account,
        saleStatus: 'available',
        clientName: '',
        clientContact: undefined,
        saleDate: '',
        expiryDate: '',
        profiles: account.profiles?.map(p => ({ ...p, sold: false })),
      });
    });

    logActivity('account_available', `${selectedAccounts.size} cuentas marcadas como Disponibles`);
    setSelectedAccounts(new Set());
  };

  const handleBulkMarkAsFallen = () => {
    if (selectedAccounts.size === 0) return;

    if (!confirm(`¿Marcar ${selectedAccounts.size} cuentas como Caídas?`)) return;

    const today = new Date().toISOString().split('T')[0];

    selectedAccounts.forEach(accountId => {
      const account = accounts.find(acc => acc.id === accountId);
      if (!account) return;

      updateAccount({
        ...account,
        expiryDate: today,
        saleStatus: 'available' as SaleStatus,
        profiles: account.profiles?.map(p => ({ ...p, sold: false })),
      });
    });

    logActivity('account_fallen', `${selectedAccounts.size} cuentas marcadas como Caídas`);
    setSelectedAccounts(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedAccounts.size === 0) return;

    if (!confirm(`¿Eliminar ${selectedAccounts.size} cuentas? Esta acción no se puede deshacer.`)) return;

    selectedAccounts.forEach(accountId => {
      const account = accounts.find(acc => acc.id === accountId);
      if (account) {
        deleteAccount(account);
      }
    });

    setSelectedAccounts(new Set());
  };

  // Función para generar mensaje de entrega al cliente
  const generateDeliveryMessage = (account: Account, profile: { slot: number; clientName: string; pin?: string }) => {
    const product = state.products.find(p => p.name === account.productType);
    const provider = state.providers.find(p => p.name === account.provider);

    const durationText = account.duration === 12 ? '1 año' : (account.duration === 1 ? '30 días' : `${account.duration} meses`);
    const profileLabel = account.plan.includes('Pantalla') ? 'Pantalla' : 'Perfil';

    let message = `🎬 *CUENTA ${account.productType.toUpperCase()}*\n\n`;
    message += `📧 *Correo:* ${account.email}\n`;
    message += `🔐 *Contraseña:* ${account.password}\n\n`;
    message += `👤 *${profileLabel}:* ${profile.clientName}\n`;

    if (profile.pin) {
      message += `🔢 *PIN:* ${profile.pin}\n`;
    }

    message += `\n📅 *Inicio:* ${formatDate(account.saleDate)}\n`;
    message += `⏰ *Vence:* ${formatDate(account.expiryDate)}\n`;
    message += `📆 *Duración:* ${durationText}\n\n`;

    if (provider) {
      message += `🏪 *Proveedor:* ${provider.name}\n`;
      if (provider.telegramUsername) {
        message += `💬 *Telegram:* @${provider.telegramUsername}\n`;
      }
    }

    message += `\n⚠️ *No cambiar datos de la cuenta*\n`;
    message += `🚫 *No compartir con terceros*\n\n`;
    message += `_Enviado desde Rocky Cuentas_`;

    return message;
  };

  // Función para copiar mensaje al portapapeles
  const handleCopyDeliveryMessage = (account: Account, profile: { slot: number; clientName: string; pin?: string }) => {
    const message = generateDeliveryMessage(account, profile);
    navigator.clipboard.writeText(message);

    // Mostrar confirmación
    setCopiedProfile(`${account.id}-${profile.slot}`);
    setTimeout(() => {
      setCopiedProfile(null);
    }, 3000);
  };

  // Configuración de estados de vencimiento
  const statusConfig: Record<AccountStatus, { icon: typeof CheckCircle; color: string; label: string }> = {
    active: { icon: CheckCircle, color: 'text-green-400 bg-green-400/10', label: 'Activa' },
    expiring: { icon: Clock, color: 'text-yellow-400 bg-yellow-400/10', label: 'Por Vencer' },
    critical: { icon: AlertTriangle, color: 'text-red-400 bg-red-400/10', label: 'Crítico' },
    expired: { icon: XCircle, color: 'text-gray-400 bg-gray-400/10', label: 'Vencida' },
  };

  // Lista única de proveedores para el filtro
  const providersList = useMemo(() => {
    const providers = new Set(accounts.map(acc => acc.provider));
    return Array.from(providers).sort();
  }, [accounts]);

  const filteredAndSortedAccounts = useMemo(() => {
    let result = [...accounts];

    // Filtrar por pestaña de producto
    if (selectedProductTab !== 'all') {
      result = result.filter((acc) => acc.productType === selectedProductTab);
    }

    // Filtrar por búsqueda
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (acc) =>
          acc.email.toLowerCase().includes(searchLower) ||
          acc.clientName.toLowerCase().includes(searchLower) ||
          acc.provider.toLowerCase().includes(searchLower) ||
          acc.productType.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por producto (dropdown)
    if (filterProduct) {
      result = result.filter((acc) => acc.productType === filterProduct);
    }

    // Filtrar por proveedor
    if (filterProvider) {
      result = result.filter((acc) => acc.provider === filterProvider);
    }

    // Filtrar por estado
    if (filterStatus) {
      result = result.filter((acc) => getAccountStatus(acc.expiryDate, state.settings.alarmDays) === filterStatus);
    }

    // Filtrar por estado de venta
    if (filterSale) {
      result = result.filter((acc) => acc.saleStatus === filterSale);
    }

    // Ordenar
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'clientName':
          comparison = a.clientName.localeCompare(b.clientName);
          break;
        case 'productType':
          comparison = a.productType.localeCompare(b.productType);
          break;
        case 'expiryDate':
          comparison = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
          break;
        case 'saleDate':
          comparison = new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime();
          break;
        case 'provider':
          comparison = a.provider.localeCompare(b.provider);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [accounts, search, filterProduct, filterProvider, filterStatus, filterSale, sortField, sortDirection, state.settings.alarmDays, selectedProductTab]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const togglePassword = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleProfiles = (id: string) => {
    setExpandedProfiles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  if (accounts.length === 0) {
    return (
      <div className="bg-[#16213e] rounded-xl p-12 text-center">
        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">No hay cuentas</h3>
        <p className="text-gray-500">
          Comienza agregando una cuenta o importando desde Excel.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#16213e] rounded-xl overflow-hidden">
      {/* Pestañas por producto - Estilo iconos con nombre */}
      <div className="p-3 border-b border-gray-700/50">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Botón Todas */}
          <button
            onClick={() => handleTabChange('all')}
            className={`group flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              selectedProductTab === 'all'
                ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30'
                : 'bg-[#0f0f1a] hover:bg-gray-800'
            }`}
            title={`Todas (${accounts.length})`}
          >
            <span className={`text-xl ${selectedProductTab === 'all' ? 'text-white' : 'text-gray-400'}`}>📋</span>
            <span className={`text-xs font-medium ${selectedProductTab === 'all' ? 'text-white' : 'text-gray-400'}`}>Todas</span>
            {/* Badge con contador */}
            <div className={`absolute -top-1 -right-1 min-w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              selectedProductTab === 'all'
                ? 'bg-white text-indigo-600'
                : 'bg-indigo-600 text-white'
            }`}>
              {accounts.length}
            </div>
          </button>

          {/* Iconos de productos con nombre */}
          {productsWithAccounts.map((product) => {
            const count = accounts.filter(acc => acc.productType === product.name).length;
            const isSelected = selectedProductTab === product.name;
            return (
              <button
                key={product.id}
                onClick={() => handleTabChange(product.name)}
                className={`group relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30'
                    : 'bg-[#0f0f1a] hover:bg-gray-800'
                }`}
                title={`${product.name} (${count} cuentas)`}
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className={`w-8 h-8 object-contain rounded-lg ${
                      isSelected ? 'brightness-0 invert' : ''
                    }`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className={`text-lg ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                    {product.name.charAt(0)}
                  </span>
                )}
                <span className={`text-xs font-medium max-w-16 truncate ${
                  isSelected ? 'text-white' : 'text-gray-400'
                }`}>
                  {product.name}
                </span>
                {/* Badge con contador */}
                <div className={`absolute -top-1 -right-1 min-w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isSelected
                    ? 'bg-white text-indigo-600'
                    : 'bg-indigo-600 text-white'
                }`}>
                  {count}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por email, cliente, proveedor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Todos los productos</option>
              {state.products.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Todos los proveedores</option>
              {providersList.map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as AccountStatus | '')}
              className="px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activa</option>
              <option value="expiring">Por Vencer</option>
              <option value="critical">Crítico</option>
              <option value="expired">Vencida</option>
            </select>

            <select
              value={filterSale}
              onChange={(e) => setFilterSale(e.target.value as SaleStatus | '')}
              className="px-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              <option value="available">Disponible</option>
              <option value="sold">Vendida</option>
            </select>
          </div>
        </div>
      )}

      {/* Barra de selección múltiple */}
      {selectedAccounts.size > 0 && (
        <div className="p-4 bg-indigo-600/20 border-b border-indigo-500/30 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-indigo-500/30 text-indigo-300 text-sm font-medium rounded-full">
              {selectedAccounts.size} seleccionada(s)
            </span>
            <button
              onClick={() => setSelectedAccounts(new Set())}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Deseleccionar todo
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleBulkMarkAsSold}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Marcar Vendidas
            </button>
            <button
              onClick={handleBulkMarkAsAvailable}
              className="flex items-center gap-2 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-black text-sm rounded-lg transition-colors"
            >
              <Clock className="w-4 h-4" />
              Marcar Disponibles
            </button>
            <button
              onClick={handleBulkMarkAsFallen}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Marcar Caídas
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0f0f1a]/50">
              <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide w-10">
                <button
                  onClick={toggleSelectAll}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Seleccionar todas"
                >
                  {selectedAccounts.size === filteredAndSortedAccounts.length && filteredAndSortedAccounts.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                Cuenta
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                Producto
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                Cliente
              </th>
              <th
                className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide cursor-pointer hover:text-white"
                onClick={() => handleSort('expiryDate')}
              >
                <div className="flex items-center gap-1">
                  Vence
                  <SortIcon field="expiryDate" />
                </div>
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                Estado
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                Proveedor
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedAccounts.map((account) => {
              const status = getAccountStatus(account.expiryDate, state.settings.alarmDays);
              const daysRemaining = getDaysRemaining(account.expiryDate);
              const StatusIcon = statusConfig[status].icon;
              const showPass = showPasswords[account.id];
              const isExpanded = expandedProfiles[account.id];
              // Verificar si es producto de 2 pantallas
              const isTwoScreenProduct = TWO_SCREEN_PRODUCTS.includes(account.productType);
              // Mostrar perfiles/clientes si hay (los productos de 2 pantallas también tienen perfiles para Cliente 1 y Cliente 2)
              const hasProfiles = account.profiles && account.profiles.length > 0;
              // Contar perfiles marcados como vendidos
              const profilesSold = account.profiles?.filter(p => p.sold === true).length || 0;
              const totalProfiles = account.profiles?.length || 0;
              const isFullySold = account.saleStatus === 'sold' || (hasProfiles && account.profiles!.every(p => p.sold === true));
              const isSelected = selectedAccounts.has(account.id);

              return (
                <Fragment key={account.id}>
                <tr
                  className={`border-t border-gray-700/30 hover:bg-white/5 transition-colors ${
                    status === 'critical' ? 'bg-red-500/5' : status === 'expiring' ? 'bg-yellow-500/5' : ''
                  } ${isFullySold ? 'bg-green-500/5' : ''} ${isSelected ? 'bg-indigo-500/10' : ''}`}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleSelectAccount(account.id)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="text-white font-medium text-sm">{account.email}</p>
                          <button
                            onClick={() => {
                              copyToClipboard(account.email);
                              setCopiedEmail(account.id);
                              setTimeout(() => setCopiedEmail(null), 2000);
                            }}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                            title="Copiar email"
                          >
                            {copiedEmail === account.id ? (
                              <Check className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-gray-500 hover:text-white" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">
                            {showPass ? account.password : '••••••••'}
                          </p>
                          <button
                            onClick={() => togglePassword(account.id)}
                            className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors"
                          >
                            {showPass ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(account.password)}
                            className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const product = state.products.find(p => p.name === account.productType);
                        return product?.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={account.productType}
                            className="w-8 h-8 object-contain rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded flex items-center justify-center"
                            style={{ backgroundColor: (product?.color || '#6366f1') + '30' }}
                          >
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: product?.color || '#6366f1' }}
                            />
                          </div>
                        );
                      })()}
                      <div>
                        <p className="text-white text-sm">{account.productType}</p>
                        <p className="text-xs text-gray-500">{account.plan}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white text-sm">{account.clientName}</p>
                      {account.clientContact && (
                        <p className="text-xs text-gray-500">{account.clientContact}</p>
                      )}
                      {/* Indicador de venta y botón de perfiles */}
                      {hasProfiles && (
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              isFullySold
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-orange-500/20 text-orange-400'
                            }`}
                          >
                            {isFullySold ? (
                              <>
                                <ShoppingCart className="w-3 h-3" />
                                Vendida
                              </>
                            ) : (
                              <>
                                <Users className="w-3 h-3" />
                                {profilesSold}/{totalProfiles}
                              </>
                            )}
                          </span>
                          <button
                            onClick={() => toggleProfiles(account.id)}
                            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            {isExpanded ? 'Ocultar' : 'Ver perfiles'}
                            <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>
                        </div>
                      )}
                      {/* Botón entregar cuenta completa (sin perfiles) */}
                      {!hasProfiles && account.clientName && (
                        <button
                          onClick={() => {
                            const message = `🎬 *CUENTA ${account.productType.toUpperCase()}*

📧 *Correo:* ${account.email}
🔐 *Contraseña:* ${account.password}

👋 *Cliente:* ${account.clientName}
📅 *Fecha de inicio:* ${formatDate(account.saleDate)}
⏰ *Duración:* ${account.duration} mes(es)
📆 *Vence:* ${formatDate(account.expiryDate)}

_Rocky Cuentas - Gracias por su compra_`;
                            navigator.clipboard.writeText(message);
                            alert('¡Mensaje copiado! Puedes pegarlo en WhatsApp, Telegram o SMS.');
                          }}
                          className="mt-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          Entregar
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      {account.plan === 'Disponible' ? (
                        <>
                          <p className="text-yellow-400 text-sm font-medium">En espera</p>
                          <p className="text-xs text-gray-500">Sin asignar</p>
                        </>
                      ) : (
                        <>
                          <p className="text-white text-sm">{formatDate(account.expiryDate)}</p>
                          <p
                            className={`text-xs font-medium ${
                              daysRemaining < 0
                                ? 'text-red-400'
                                : daysRemaining <= 7
                                ? 'text-red-400'
                                : daysRemaining <= 15
                                ? 'text-yellow-400'
                                : 'text-green-400'
                            }`}
                          >
                            {daysRemaining < 0
                              ? `Venció hace ${Math.abs(daysRemaining)} días`
                              : `${daysRemaining} días restantes`}
                          </p>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      {/* Selector de estado único */}
                      <select
                        value={account.saleStatus}
                        onChange={(e) => {
                          const newStatus = e.target.value as SaleStatus;
                          if (newStatus === 'available') {
                            // Disponible - limpiar cliente y fechas
                            updateAccount({
                              ...account,
                              saleStatus: 'available',
                              clientName: '',
                              clientContact: undefined,
                              saleDate: '',
                              expiryDate: '',
                            });
                            logActivity(
                              'account_available',
                              `Cuenta ${account.email} marcada como Disponible`,
                              `Producto: ${account.productType} | Plan: ${account.plan}`,
                              undefined,
                              account.id
                            );
                          } else if (newStatus === 'sold') {
                            // Vendida - calcular fechas si no existen
                            if (!account.saleDate) {
                              const today = new Date();
                              const todayStr = today.toISOString().split('T')[0];
                              const duration = account.duration || 1;
                              const totalDays = duration * 30;
                              const expiryDate = new Date(today);
                              expiryDate.setDate(expiryDate.getDate() + totalDays);
                              const expiryDateStr = expiryDate.toISOString().split('T')[0];

                              updateAccount({
                                ...account,
                                saleStatus: 'sold',
                                saleDate: todayStr,
                                expiryDate: expiryDateStr,
                                clientName: account.clientName || 'Cliente',
                              });
                              logActivity(
                                'account_sold',
                                `Cuenta ${account.email} marcada como Vendida`,
                                `Producto: ${account.productType} | Plan: ${account.plan} | Duración: ${duration === 1 ? '30 días' : `${duration} meses`}`,
                                undefined,
                                account.id
                              );
                            } else {
                              updateAccount({
                                ...account,
                                saleStatus: 'sold',
                              });
                              logActivity(
                                'account_sold',
                                `Cuenta ${account.email} marcada como Vendida`,
                                `Producto: ${account.productType} | Plan: ${account.plan}`,
                                undefined,
                                account.id
                              );
                            }
                          } else if (newStatus === 'fallen') {
                            // Caída
                            const today = new Date().toISOString().split('T')[0];
                            updateAccount({
                              ...account,
                              expiryDate: today,
                              saleStatus: 'available' as SaleStatus,
                              profiles: account.profiles?.map(p => ({ ...p, sold: false })),
                            });
                            logActivity(
                              'account_fallen',
                              `Cuenta ${account.email} marcada como Caída`,
                              `Producto: ${account.productType} | Plan: ${account.plan} | Cliente: ${account.clientName || 'N/A'}`,
                              undefined,
                              account.id
                            );
                          }
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold border-2 cursor-pointer transition-all ${
                          account.saleStatus === 'available'
                            ? 'bg-yellow-500 text-black border-yellow-400 hover:bg-yellow-400 shadow-lg shadow-yellow-500/30'
                            : account.saleStatus === 'sold'
                            ? 'bg-green-500 text-white border-green-400 hover:bg-green-400 shadow-lg shadow-green-500/30'
                            : 'bg-red-600 text-white border-red-400 hover:bg-red-500 shadow-lg shadow-red-500/30'
                        }`}
                        style={{ minWidth: '100px' }}
                      >
                        <option value="available">Disponible</option>
                        <option value="sold">Vendida</option>
                        <option value="fallen">Caída</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white text-sm">{account.provider}</p>
                    <p className="text-xs text-gray-500">
                      Renueva: {formatDate(account.providerRenewalDate)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onDuplicate(account)}
                        className="p-2 hover:bg-indigo-500/20 rounded-lg text-gray-400 hover:text-indigo-400 transition-colors"
                        title="Duplicar"
                      >
                        <Files className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(account)}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(account)}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Fila expandida de perfiles */}
                {isExpanded && hasProfiles && (
                  <tr className="bg-[#0f0f1a]/50">
                    <td colSpan={7} className="px-4 py-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {isTwoScreenProduct
                              ? 'Clientes de la cuenta'
                              : account.plan.includes('Pantalla')
                                ? 'Pantallas de la cuenta'
                                : 'Perfiles de la cuenta'}
                            <span className="ml-2 px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full text-xs">
                              {account.profiles!.filter(p => p.sold).length}/{account.profiles!.length} vendidos
                            </span>
                          </h4>
                          {/* Botón para vender todos */}
                          {account.profiles!.length > 0 && account.profiles!.some(p => !p.sold) && (
                            <button
                              onClick={() => handleMarkAllProfilesSold(account)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg flex items-center gap-2 transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              Vender Todos
                            </button>
                          )}
                          {/* Indicador de cuenta completamente vendida */}
                          {account.profiles!.every(p => p.sold) && (
                            <span className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-medium flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Cuenta Vendida
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                          {account.profiles!.map((profile) => {
                            const client = state.clients.find(c => c.id === profile.clientId);
                            const isProfileSold = profile.sold === true;

                            // Función para generar mensaje de entrega
                            const generateDeliveryMessage = () => {
                              const profileLabel = account.plan.includes('Pantalla') ? 'Pantalla' : 'Perfil';
                              const startDate = account.saleDate ? formatDate(account.saleDate) : 'N/A';
                              const expiryDate = account.expiryDate ? formatDate(account.expiryDate) : 'N/A';
                              const duration = account.duration ? `${account.duration} mes(es)` : 'N/A';

                              return `🎬 *CUENTA ${account.productType.toUpperCase()}*

📧 *Correo:* ${account.email}
🔐 *Contraseña:* ${account.password}

👤 *${profileLabel}:* ${profile.slot}
👋 *Cliente:* ${profile.clientName || 'N/A'}
🔢 *PIN:* ${profile.pin || 'Sin PIN'}

📅 *Fecha de inicio:* ${startDate}
⏰ *Duración:* ${duration}
📆 *Vence:* ${expiryDate}

_Rocky Cuentas - Gracias por su compra_`;
                            };

                            const handleCopyMessage = () => {
                              const message = generateDeliveryMessage();
                              navigator.clipboard.writeText(message);
                              // Mostrar confirmación visual
                              alert('¡Mensaje copiado! Puedes pegarlo en WhatsApp, Telegram o SMS.');
                            };

                            // Función para vender perfil con cliente seleccionado
                            const handleSellWithClient = (clientName: string) => {
                              if (!account.profiles) return;

                              // Verificar si el cliente ya existe
                              const existingClient = state.clients.find(c => c.name.toLowerCase() === clientName.toLowerCase());
                              let clientId = existingClient?.id;

                              // Si el cliente no existe, agregarlo automáticamente
                              if (!existingClient && clientName.trim() && clientName !== 'Cliente') {
                                addClient({ name: clientName.trim() });
                                clientId = (Date.now()).toString(36);
                              }

                              // Calcular fechas de venta
                              const today = new Date();
                              const todayStr = today.toISOString().split('T')[0];
                              // Usar duración existente o 1 mes por defecto
                              const duration = account.duration || 1;
                              // Calcular fecha de vencimiento
                              const expiryDate = new Date(today);
                              expiryDate.setMonth(expiryDate.getMonth() + duration);
                              const expiryDateStr = expiryDate.toISOString().split('T')[0];

                              const updatedProfiles = account.profiles.map(p => {
                                if (p.slot === profile.slot) {
                                  return { ...p, clientName, clientId, sold: true };
                                }
                                return p;
                              });

                              // Verificar si todos los perfiles están vendidos
                              const allSold = updatedProfiles.every(p => p.sold === true);

                              updateAccount({
                                ...account,
                                profiles: updatedProfiles,
                                saleStatus: allSold ? 'sold' as SaleStatus : 'available' as SaleStatus,
                                saleDate: account.saleDate || todayStr,
                                duration: duration,
                                expiryDate: account.expiryDate || expiryDateStr,
                                clientName: account.clientName || clientName,
                              });
                            };

                            return (
                              <div
                                key={profile.slot}
                                className={`rounded-lg p-3 border ${
                                  isProfileSold
                                    ? 'bg-green-500/5 border-green-500/30'
                                    : 'bg-[#16213e] border-gray-700/50'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                    isProfileSold
                                      ? 'bg-green-500 text-white'
                                      : 'bg-indigo-500/20 text-indigo-400'
                                  }`}>
                                    {profile.slot}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {isTwoScreenProduct
                                      ? `Cliente ${profile.slot}`
                                      : account.plan.includes('Pantalla')
                                        ? `Pantalla ${profile.slot}`
                                        : `Perfil ${profile.slot}`}
                                  </span>
                                  {profile.pin && (
                                    <span className="ml-auto px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">
                                      PIN: {profile.pin}
                                    </span>
                                  )}
                                </div>
                                <p className={`text-sm font-medium truncate ${
                                  isProfileSold ? 'text-green-400' : 'text-white'
                                }`}>
                                  {profile.clientName || 'Sin asignar'}
                                </p>
                                {client?.contact && (
                                  <p className="text-xs text-gray-500 mt-1 truncate">
                                    {client.contact}
                                  </p>
                                )}
                                {/* Indicador de vendido */}
                                {isProfileSold && (
                                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                                    <Check className="w-3 h-3" />
                                    Vendido
                                  </span>
                                )}
                                {/* Botones de acción */}
                                <div className="mt-3 space-y-2">
                                  {/* Campo para ingresar cliente y vender */}
                                  {!isProfileSold ? (
                                    <div className="space-y-2">
                                      {/* Input para nombre del cliente */}
                                      <input
                                        type="text"
                                        placeholder="Nombre del cliente"
                                        value={profile.clientName}
                                        onChange={(e) => {
                                          if (!account.profiles) return;
                                          const updatedProfiles = account.profiles.map(p => {
                                            if (p.slot === profile.slot) {
                                              return { ...p, clientName: e.target.value };
                                            }
                                            return p;
                                          });
                                          updateAccount({
                                            ...account,
                                            profiles: updatedProfiles,
                                          });
                                        }}
                                        onBlur={(e) => {
                                          if (e.target.value.trim()) {
                                            handleSellWithClient(e.target.value.trim());
                                          }
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                            handleSellWithClient(e.currentTarget.value.trim());
                                          }
                                        }}
                                        className="w-full px-3 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                      />
                                      {/* Botón vender */}
                                      <button
                                        onClick={() => {
                                          if (profile.clientName.trim()) {
                                            handleSellWithClient(profile.clientName.trim());
                                          } else {
                                            // Marcar como vendido con nombre temporal
                                            handleSellWithClient('Cliente');
                                          }
                                        }}
                                        className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                                      >
                                        <Check className="w-3 h-3" />
                                        Vender
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleToggleProfileSold(account, profile.slot)}
                                      className="w-full px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                                    >
                                      <XCircle className="w-3 h-3" />
                                      Desvender
                                    </button>
                                  )}
                                  {/* Botón de entregar cuenta */}
                                  {profile.clientName && (
                                    <button
                                      onClick={handleCopyMessage}
                                      className="w-full px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                                    >
                                      <Copy className="w-3 h-3" />
                                      Entregar
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-500">
                          Para editar los perfiles o agregar clientes, haz clic en el botón Editar
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Resumen */}
      <div className="px-4 py-3 border-t border-gray-700/50 bg-[#0f0f1a]/30">
        <p className="text-sm text-gray-400">
          Mostrando {filteredAndSortedAccounts.length} de {accounts.length} cuentas
        </p>
      </div>
    </div>
  );
}
