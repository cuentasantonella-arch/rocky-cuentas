import { useMemo } from 'react';
import {
  CreditCard,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getAccountStatus, getDaysRemaining } from '../types';

interface StatsCardsProps {
  accounts: any[];
}

export function StatsCards({ accounts }: StatsCardsProps) {
  const { state } = useApp();

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const active = accounts.filter(
      (acc) => getAccountStatus(acc.expiryDate, state.settings.alarmDays) === 'active'
    ).length;

    const expiring = accounts.filter(
      (acc) => {
        const status = getAccountStatus(acc.expiryDate, state.settings.alarmDays);
        return status === 'expiring' || status === 'critical';
      }
    ).length;

    const expired = accounts.filter(
      (acc) => getAccountStatus(acc.expiryDate, state.settings.alarmDays) === 'expired'
    ).length;

    // Próximas renovaciones de proveedor (próximos 7 días)
    const upcomingRenewals = accounts.filter((acc) => {
      const renewalDate = new Date(acc.providerRenewalDate);
      renewalDate.setHours(0, 0, 0, 0);
      const diff = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 7;
    }).length;

    return {
      total: accounts.length,
      active,
      expiring,
      expired,
      upcomingRenewals,
    };
  }, [accounts, state.settings.alarmDays, state.providers]);

  const cards = [
    {
      title: 'Total Cuentas',
      value: stats.total,
      icon: CreditCard,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
    },
    {
      title: 'Por Vencer',
      value: stats.expiring,
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Renov. Proveedor',
      value: stats.upcomingRenewals,
      icon: RefreshCw,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Cuentas Activas',
      value: stats.active,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-[#16213e] rounded-xl p-5 border border-gray-700/50 hover:border-gray-600 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-400">{card.title}</span>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

interface AlertListProps {
  accounts: any[];
}

export function AlertList({ accounts }: AlertListProps) {
  const { state } = useApp();

  const alerts = useMemo(() => {
    return accounts
      .filter((acc) => {
        const status = getAccountStatus(acc.expiryDate, state.settings.alarmDays);
        return status === 'expiring' || status === 'critical' || status === 'expired';
      })
      .map((acc) => ({
        ...acc,
        daysRemaining: getDaysRemaining(acc.expiryDate),
        status: getAccountStatus(acc.expiryDate, state.settings.alarmDays),
      }))
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 10);
  }, [accounts, state.settings.alarmDays]);

  if (alerts.length === 0) {
    return (
      <div className="bg-[#16213e] rounded-xl p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-white mb-1">¡Todo bajo control!</h3>
        <p className="text-gray-400 text-sm">No hay alertas pendientes.</p>
      </div>
    );
  }

  const statusConfig = {
    critical: { color: 'border-l-red-500', bg: 'bg-red-500/10', text: 'text-red-400' },
    expiring: { color: 'border-l-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
    expired: { color: 'border-l-gray-500', bg: 'bg-gray-500/10', text: 'text-gray-400' },
  };

  return (
    <div className="bg-[#16213e] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-700/50 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-yellow-400" />
        <h3 className="font-medium text-white">Alertas Recientes</h3>
        <span className="ml-auto px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">
          {alerts.length}
        </span>
      </div>

      <div className="divide-y divide-gray-700/30">
        {alerts.map((alert) => {
          const config = statusConfig[alert.status as keyof typeof statusConfig];
          return (
            <div
              key={alert.id}
              className={`p-4 border-l-4 ${config.color} ${config.bg} hover:bg-opacity-20 transition-colors`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-white">{alert.clientName}</p>
                  <p className="text-sm text-gray-400">
                    {alert.productType} - {alert.plan}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Vence: {new Date(alert.expiryDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${config.text}`}>
                    {alert.daysRemaining < 0 ? Math.abs(alert.daysRemaining) : alert.daysRemaining}
                  </p>
                  <p className="text-xs text-gray-500">
                    {alert.daysRemaining < 0 ? 'días vencida' : 'días'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
