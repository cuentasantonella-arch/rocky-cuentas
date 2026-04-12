import { useState, useCallback, useMemo } from 'react';
import { Upload, FileSpreadsheet, X, Check, AlertCircle, Download, Calendar, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';

interface ImportExcelProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportExcel({ onClose, onSuccess }: ImportExcelProps) {
  const { state, importAccounts } = useApp();
  const [data, setData] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Campos seleccionados en la app
  const [selectedProduct, setSelectedProduct] = useState('');
  const [providerName, setProviderName] = useState('');
  const [renewalDate, setRenewalDate] = useState('');

  // Obtener el producto seleccionado
  const selectedProductName = useMemo(() => {
    const product = state.products.find((p) => p.id === selectedProduct);
    return product?.name || '';
  }, [selectedProduct, state.products]);

  // Detectar duplicados en las cuentas existentes
  const duplicateEmails = useMemo(() => {
    if (!selectedProductName) return [];
    const existingEmails = state.accounts
      .filter((acc) => acc.productType === selectedProductName)
      .map((acc) => acc.email.toLowerCase());
    return data
      .filter((row) => row._valid && existingEmails.includes(row.email?.toLowerCase()))
      .map((row) => row.email);
  }, [data, selectedProductName, state.accounts]);

  // Detectar duplicados dentro del mismo archivo
  const duplicatesInFile = useMemo(() => {
    const emails = data.map((row) => row.email?.toLowerCase());
    const seen = new Set<string>();
    const duplicates: string[] = [];
    emails.forEach((email) => {
      if (email && seen.has(email)) {
        if (!duplicates.includes(email)) {
          duplicates.push(email);
        }
      }
      seen.add(email);
    });
    return duplicates;
  }, [data]);

  // Validar solo email y password
  // Validación simple: solo verificar que tenga @
  // Para MaxPlayer y Blessed Player, permitir usuario sin @
  const validateRow = (row: any, index: number, productType: string): string | null => {
    const email = row.email?.toString().trim();

    // Productos que usan "Usuario" en vez de "Correo"
    const usesUsername = ['MaxPlayer', 'Blessed Player'].includes(productType);

    // Para MaxPlayer/Blessed Player, solo verificar que el campo usuario no esté vacío
    if (usesUsername) {
      if (!email) return 'Usuario requerido';
    } else {
      // Para otros productos, requerir email
      if (!email) return 'Email requerido';
      // Verificar formato de email (@)
      if (!email.includes('@')) return 'Email inválido';
    }

    // Verificar que la contraseña no esté vacía
    if (!row.password?.toString().trim()) return 'Contraseña requerida';
    return null;
  };

  const processFile = useCallback(
    (file: File) => {
      setFileName(file.name);
      setIsProcessing(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

          // Normalizar headers
          const normalized = jsonData.map((row: any) => {
            const normalizedRow: any = {};
            Object.keys(row).forEach((key) => {
              const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '');
              normalizedRow[normalizedKey] = row[key];
            });
            return normalizedRow;
          });

          // Validar cada fila
          // Si no hay producto seleccionado, no validar formato de email (@)
          const validated = normalized.map((row, index) => {
            const productTypeForValidation = selectedProductName || '';
            const error = validateRow(row, index, productTypeForValidation);
            return {
              ...row,
              _rowIndex: index + 1,
              _error: error,
              _valid: !error,
            };
          });

          setData(validated);
        } catch (error) {
          console.error('Error processing file:', error);
        } finally {
          setIsProcessing(false);
        }
      };

      reader.readAsBinaryString(file);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'application/vnd.ms-excel' ||
          file.name.endsWith('.csv'))) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleImport = () => {
    const validRows = data.filter((row) => row._valid);

    if (validRows.length === 0 || !selectedProduct || !providerName.trim() || !renewalDate) {
      return;
    }

    const product = state.products.find((p) => p.id === selectedProduct);
    if (!product) return;

    // Filtrar solo las cuentas NO duplicadas
    const validEmailsLower = uniqueDuplicates.map(d => d.toLowerCase());
    const nonDuplicateRows = validRows.filter((row) =>
      !validEmailsLower.includes(row.email?.toLowerCase())
    );

    if (nonDuplicateRows.length === 0) {
      return; // No hay nada que importar
    }

    const accountsToImport = nonDuplicateRows.map((row) => {
      const saleDate = new Date().toISOString().split('T')[0];
      const duration = 1;

      // Usar el email tal como viene en Excel, solo limpiar espacios al inicio/final
      const emailValue = row.email?.toString().trim() || '';
      const passwordValue = row.password?.toString().trim() || '';

      return {
        email: emailValue,
        password: passwordValue,
        productType: product.name,
        plan: 'Disponible',
        clientName: '',
        clientContact: undefined,
        saleDate,
        duration,
        provider: providerName.trim(),
        providerRenewalDate: renewalDate,
        notes: undefined,
        saleStatus: 'available' as const,
        profiles: [],
      };
    });

    importAccounts(accountsToImport);
    onSuccess();
  };

  const downloadTemplate = () => {
    const template = [
      { email: 'correo@ejemplo.com', password: 'contraseña123' },
    ];

    const ws = XLSX.utils.json_to_sheet(template);

    ws['!cols'] = [
      { wch: 40 },
      { wch: 25 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cuentas');
    XLSX.writeFile(wb, 'plantilla_cuentas.xlsx');
  };

  const validCount = data.filter((d) => d._valid).length;
  const invalidCount = data.length - validCount;
  const uniqueDuplicates = [...new Set([...duplicateEmails, ...duplicatesInFile.map(e => e.toLowerCase())])];
  const toImportCount = validCount - uniqueDuplicates.filter(d => data.some(row => row.email?.toLowerCase() === d.toLowerCase() && row._valid)).length;

  const canImport = validCount > 0 && selectedProduct && providerName.trim() && renewalDate;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#16213e] px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">Importar Cuentas</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">

          {/* Alerta de duplicados */}
          {uniqueDuplicates.length > 0 && (
            <div className="mb-6 bg-red-900/30 border border-red-500/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-400 font-medium mb-2">
                    ⚠️ Cuentas duplicadas detectadas ({uniqueDuplicates.length})
                  </h4>
                  <p className="text-sm text-gray-300 mb-2">
                    Los siguientes correos ya existen o están repetidos en el archivo:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {uniqueDuplicates.map((email, i) => (
                      <span key={i} className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded">
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Configuración */}
          <div className="bg-[#0f0f1a] rounded-lg p-4 mb-6">
            <h3 className="text-white font-medium mb-4">Configuración para todas las cuentas:</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Producto */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tipo de cuenta *</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full bg-[#1a1a2e] border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Seleccionar...</option>
                  {state.products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Proveedor */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Proveedor *</label>
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="Nombre del proveedor"
                  className="w-full bg-[#1a1a2e] border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Fecha Renovación */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Fecha renovación *</label>
                <div className="relative">
                  <input
                    type="date"
                    value={renewalDate}
                    onChange={(e) => setRenewalDate(e.target.value)}
                    className="w-full bg-[#1a1a2e] border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                  />
                  <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {!canImport && data.length > 0 && (
              <p className="mt-3 text-sm text-yellow-400">
                ⚠️ Completa todos los campos (*) para importar
              </p>
            )}
          </div>

          {/* Upload Area */}
          {data.length === 0 && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-white mb-2">
                Arrastra tu archivo Excel aquí
              </h3>
              <p className="text-gray-400 text-sm">
                o haz clic para seleccionar
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Formatos: .xlsx, .xls, .csv
              </p>
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          )}

          {/* Template Download */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Descarga la plantilla con solo 2 columnas:
            </p>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Descargar plantilla
            </button>
          </div>

          {/* Preview */}
          {data.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-white">{fileName}</h3>
                  {validCount > 0 && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      <Check className="w-3 h-3" />
                      {validCount} válidas
                    </span>
                  )}
                  {invalidCount > 0 && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      {invalidCount} errores
                    </span>
                  )}
                  {uniqueDuplicates.length > 0 && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      {uniqueDuplicates.length} duplicados
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setData([])}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cambiar archivo
                </button>
              </div>

              {/* Preview Table */}
              <div className="bg-[#0f0f1a] rounded-lg overflow-hidden">
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-800/50 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 text-gray-400 font-medium">#</th>
                        <th className="text-left px-3 py-2 text-gray-400 font-medium">Email</th>
                        <th className="text-left px-3 py-2 text-gray-400 font-medium">Contraseña</th>
                        <th className="text-left px-3 py-2 text-gray-400 font-medium">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, index) => {
                        const isDuplicate = uniqueDuplicates.some(d => d.toLowerCase() === row.email?.toLowerCase());
                        return (
                          <tr
                            key={index}
                            className={`border-t border-gray-700/30 ${!row._valid ? 'bg-red-500/10' : isDuplicate ? 'bg-yellow-500/10' : ''}`}
                          >
                            <td className="px-3 py-2 text-gray-500">{row._rowIndex}</td>
                            <td className={`px-3 py-2 ${isDuplicate ? 'text-yellow-400' : 'text-white'}`}>
                              {row.email}
                              {isDuplicate && <span className="ml-2 text-xs">(duplicado)</span>}
                            </td>
                            <td className="px-3 py-2 text-gray-400">{row.password}</td>
                            <td className="px-3 py-2">
                              {row._valid ? (
                                isDuplicate ? (
                                  <span className="flex items-center gap-1 text-yellow-400">
                                    <AlertTriangle className="w-3 h-3" />
                                    Duplicado
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-green-400">
                                    <Check className="w-3 h-3" />
                                    OK
                                  </span>
                                )
                              ) : (
                                <span className="flex items-center gap-1 text-red-400">
                                  <AlertCircle className="w-3 h-3" />
                                  {row._error}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-700 bg-[#0f0f1a]/50">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={!canImport}
            className={`flex-1 px-6 py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
              uniqueDuplicates.length > 0
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {!selectedProduct || !providerName || !renewalDate
              ? 'Completa los campos'
              : uniqueDuplicates.length > 0
                ? `Importar ${toImportCount} (saltar ${uniqueDuplicates.length} duplicados)`
                : `Importar ${validCount} cuentas`}
          </button>
        </div>
      </div>
    </div>
  );
}
