import * as XLSX from 'xlsx';
import { Account, formatDate } from '../types';

/**
 * Exporta cuentas en formato Excel para backup (solo datos esenciales)
 * Incluye: email, contraseña, fecha de vencimiento
 */
export function exportBackupExcel(accounts: Account[]): void {
  const data = accounts.map((acc) => ({
    Email: acc.email,
    Contraseña: acc.password,
    'Fecha Vencimiento': formatDate(acc.expiryDate),
    'Días Restantes': calculateDaysRemaining(acc.expiryDate),
    Producto: acc.productType,
    Plan: acc.plan,
    Proveedor: acc.provider,
    Cliente: acc.clientName,
    'Fecha Venta': formatDate(acc.saleDate),
    Estado: acc.saleStatus === 'sold' ? 'Vendida' : 'Disponible',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Backup Cuentas');

  // Ajustar anchos de columna
  ws['!cols'] = [
    { wch: 40 }, // Email
    { wch: 20 }, // Contraseña
    { wch: 15 }, // Fecha Vencimiento
    { wch: 12 }, // Días Restantes
    { wch: 20 }, // Producto
    { wch: 15 }, // Plan
    { wch: 20 }, // Proveedor
    { wch: 20 }, // Cliente
    { wch: 15 }, // Fecha Venta
    { wch: 10 }, // Estado
  ];

  const fileName = `backup_cuentas_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Descarga la plantilla de Excel para importar cuentas
 */
export function downloadImportTemplate(): void {
  const template = [
    {
      email: 'ejemplo@correo.com',
      password: 'contraseña123',
      productType: 'Netflix',
      plan: 'Completo 4K',
      clientName: 'Nombre del Cliente',
      clientContact: '3001234567',
      saleDate: '2024-01-15',
      duration: '1',
      provider: 'Nombre del Proveedor',
      providerRenewalDate: '2024-02-15',
      notes: 'Notas opcionales',
    },
    {
      email: 'otro@correo.com',
      password: 'otra_contraseña',
      productType: 'Spotify Premium',
      plan: 'Familiar (6)',
      clientName: 'Otro Cliente',
      clientContact: '3009876543',
      saleDate: '2024-01-20',
      duration: '3',
      provider: 'Otro Proveedor',
      providerRenewalDate: '2024-04-20',
      notes: '',
    },
  ];

  const headers = [
    'email',
    'password',
    'productType',
    'plan',
    'clientName',
    'clientContact',
    'saleDate',
    'duration',
    'provider',
    'providerRenewalDate',
    'notes',
  ];

  // Crear hoja con headers
  const ws = XLSX.utils.aoa_to_sheet([headers, ...template.map(row => headers.map(h => row[h as keyof typeof row]))]);

  // Agregar validación de datos
  ws['!cols'] = [
    { wch: 35 }, // email
    { wch: 20 }, // password
    { wch: 20 }, // productType
    { wch: 15 }, // plan
    { wch: 25 }, // clientName
    { wch: 15 }, // clientContact
    { wch: 12 }, // saleDate
    { wch: 10 }, // duration
    { wch: 25 }, // provider
    { wch: 18 }, // providerRenewalDate
    { wch: 30 }, // notes
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Importar Cuentas');

  const fileName = `plantilla_importacion_cuentas.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Calcula los días restantes hasta el vencimiento
 */
function calculateDaysRemaining(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
