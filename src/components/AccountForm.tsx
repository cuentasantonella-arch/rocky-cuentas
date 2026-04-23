import { useState, useEffect } from 'react';
import { X, User, Users, Lock, Calendar, Check, X as XIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Account, Profile, SaleStatus, calculateExpiryDate, getSlotLabel, areAllProfilesSold, TWO_SCREEN_PRODUCTS, SINGLE_PROFILE_PRODUCTS, getProfilesCount, formatDateForInput, getChileDateString } from '../types';

interface AccountFormProps {
  account?: Account;
  onClose: () => void;
}

export function AccountForm({ account, onClose }: AccountFormProps) {
  const { state, addAccount, updateAccount, addClient } = useApp();
  // Solo es edición si existe la cuenta Y tiene un ID real (no vacío)
  const isEditing = !!account && !!account.id;

  // Inicializar perfiles desde la cuenta o vacío
  const initialProfiles = account?.profiles || [];

  const [formData, setFormData] = useState({
    email: account?.email || '',
    password: account?.password || '',
    productType: account?.productType || state.products[0]?.name || '',
    plan: account?.plan || '',
    clientName: account?.clientName || '',
    clientContact: account?.clientContact || '',
    saleDate: account?.saleDate || '',
    duration: account?.duration || 1,
    provider: account?.provider || '',
    providerRenewalDate: account?.providerRenewalDate || '',
    notes: account?.notes || '',
    saleStatus: account?.saleStatus || 'available' as SaleStatus,
    user: account?.user || '',
  });

  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [customClientMode, setCustomClientMode] = useState(true);
  // Estado para fecha de vencimiento manual (override)
  const [manualExpiryDate, setManualExpiryDate] = useState<string>('');
  const [isManualExpiry, setIsManualExpiry] = useState(false);
  const [tempManualExpiryDate, setTempManualExpiryDate] = useState<string>('');

  const selectedProduct = state.products.find((p) => p.name === formData.productType);
  const plans = selectedProduct?.plans || [];
  // Cantidad actual de perfiles
  const profilesCount = profiles.length;
  const allProfilesSold = areAllProfilesSold(profiles);

  // Verificar si el producto usa "Clientes" en vez de "Perfiles" (productos de 2 pantallas)
  const usesClients = TWO_SCREEN_PRODUCTS.includes(formData.productType);
  // Verificar si es producto de 1 solo perfil (ej: Netflix Extra)
  const usesSingleProfile = SINGLE_PROFILE_PRODUCTS.includes(formData.productType);
  // Máximo de perfiles permitidos
  const maxProfiles = usesSingleProfile ? 1 : 5;

  // Sincronizar formData cuando cambia la cuenta que se está editando
  useEffect(() => {
    if (account) {
      setFormData({
        email: account.email || '',
        password: account.password || '',
        productType: account.productType || state.products[0]?.name || '',
        plan: account.plan || '',
        clientName: account.clientName || '',
        clientContact: account.clientContact || '',
        saleDate: account.saleDate || '',
        duration: account.duration || 1,
        provider: account.provider || '',
        providerRenewalDate: account.providerRenewalDate || '',
        notes: account.notes || '',
        saleStatus: account.saleStatus || 'available' as SaleStatus,
        user: account.user || '',
      });

      // Sincronizar perfiles SOLO al inicio
      setProfiles(account.profiles || []);

      // Verificar si la fecha de vencimiento es manual (difiere de la calculada)
      if (account.expiryDate) {
        const calculated = account.saleDate && account.duration
          ? calculateExpiryDate(account.saleDate, Number(account.duration))
          : '';
        if (account.expiryDate !== calculated) {
          setManualExpiryDate(account.expiryDate);
          setIsManualExpiry(true);
        } else {
          setManualExpiryDate('');
          setIsManualExpiry(false);
        }
      } else {
        setManualExpiryDate('');
        setIsManualExpiry(false);
      }
      setTempManualExpiryDate('');
    }
  }, [account?.id]);

  // Agregar un perfil
  const addProfile = () => {
    if (profiles.length < maxProfiles) {
      const newSlot = profiles.length + 1;
      setProfiles([...profiles, { slot: newSlot, clientName: '' }]);
    }
  };

  // Quitar el último perfil
  const removeProfile = () => {
    // Para productos de 1 solo perfil, no permitir eliminar
    if (profiles.length > 0 && !usesSingleProfile) {
      setProfiles(profiles.slice(0, -1));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Manejar el cambio de tipo de producto de forma especial
    if (name === 'productType') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        plan: '', // Limpiar el plan cuando cambia el producto
      }));
      // Si el nuevo producto es de 2 pantallas, limpiar perfiles
      if (TWO_SCREEN_PRODUCTS.includes(value)) {
        setProfiles([]);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Función para extraer la duración en meses del nombre del plan
  const getDurationFromPlan = (plan: string): number => {
    const planLower = plan.toLowerCase();
    if (planLower.includes('mensual') || planLower === '1 mes' || planLower === '1mes') {
      return 1;
    }
    if (planLower.includes('3 mes')) {
      return 3;
    }
    if (planLower.includes('4 mes')) {
      return 4;
    }
    if (planLower.includes('6 mes')) {
      return 6;
    }
    if (planLower.includes('12 mes') || planLower.includes('1 año') || planLower.includes('1ano')) {
      return 12;
    }
    // Si no coincide con ningún patrón, devolver 1 por defecto
    return 1;
  };

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPlan = e.target.value;

    // Extraer la duración del plan seleccionado
    const durationFromPlan = getDurationFromPlan(newPlan);

    setFormData((prev) => ({ ...prev, plan: newPlan, duration: durationFromPlan }));

    // Los perfiles se crean manualmente con los botones +/-, no automáticamente
  };

  const handleProfileChange = (slot: number, clientName: string, clientId?: string) => {
    // Si es un cliente nuevo (modo manual), guardarlo en la lista
    if (clientName.trim() && !state.clients.some(c => c.name.toLowerCase() === clientName.trim().toLowerCase())) {
      addClient({ name: clientName.trim() });
    }
    setProfiles((prev) =>
      prev.map((p) => (p.slot === slot ? { ...p, clientName, clientId } : p))
    );
  };

  const handleClientSelectFromList = (clientName: string) => {
    setFormData((prev) => ({ ...prev, clientName }));
  };

  const handleCustomClientToggle = (useCustom: boolean) => {
    setCustomClientMode(useCustom);
    if (useCustom) {
      setFormData((prev) => ({ ...prev, clientName: '' }));
    }
  };

  const handlePinChange = (slot: number, pin: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.slot === slot ? { ...p, pin } : p))
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Para MaxPlayer y Blessed Player, usar "Usuario" en vez de "Correo"
    const usesUsername = ['MaxPlayer', 'Blessed Player'].includes(formData.productType);

    // Para Bleezed Player, requerir al menos Código o Usuario
    const isBleezed = formData.productType === 'Blessed Player';
    if (isBleezed) {
      if (!formData.email.trim() && !formData.user.trim()) {
        newErrors.email = 'Código o Usuario es requerido';
      }
    } else {
      if (!formData.email.trim()) newErrors.email = usesUsername ? 'El usuario es requerido' : 'El campo es requerido';
    }

    // Validar que no exista otra cuenta con el mismo email y producto
    // Solo verificar duplicados para productos que usan email (no MaxPlayer ni Bleezed)
    if (formData.productType !== 'Blessed Player' && formData.productType !== 'MaxPlayer') {
      const emailNormalized = formData.email.trim().toLowerCase();
      const existingAccount = state.accounts.find(
        acc =>
          acc.email.toLowerCase() === emailNormalized &&
          acc.productType === formData.productType &&
          acc.id !== account?.id
      );
      if (existingAccount) {
        newErrors.email = `Ya existe una cuenta con este email en ${formData.productType}`;
      }
      // Validar formato de email solo si no es MaxPlayer ni Bleezed
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Correo inválido';
      }
    }

    // Para ChatGPT, MaxPlayer y Bleezed Player, la contraseña es opcional
    const isChatGPT = formData.productType === 'ChatGPT Plus';
    if (!isChatGPT && !isBleezed && !usesUsername && !formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    }
    if (!formData.productType) newErrors.productType = 'Selecciona un producto';
    if (!formData.plan) newErrors.plan = 'Selecciona un plan';

    // Si el plan es "Disponible", no requiere cliente
    // Si hay perfiles, no requiere cliente principal (se usa el primero perfil como referencia)
    if (formData.plan !== 'Disponible' && profilesCount === 0 && !formData.clientName.trim()) {
      newErrors.clientName = 'El nombre del cliente es requerido';
    }

    // Si el plan es "Disponible", no requiere fecha de venta
    if (formData.plan !== 'Disponible' && !formData.saleDate) newErrors.saleDate = 'La fecha de venta es requerida';

    // Si el plan es "Disponible", no requiere duración específica
    if (formData.plan !== 'Disponible') {
      if (!formData.duration || formData.duration < 1 || formData.duration > 12) {
        newErrors.duration = 'Duración entre 1 y 12 meses';
      }
    }

    if (!formData.provider.trim()) newErrors.provider = 'El proveedor es requerido';

    // Validar que si hay perfiles y NO es "Disponible", al menos uno esté asignado
    // PERO para productos de 2 pantallas, permitir perfiles vacíos (para poder vender uno a la vez)
    if (formData.plan !== 'Disponible' && profilesCount > 0 && !usesClients) {
      const assignedCount = profiles.filter(p => p.clientName.trim()).length;
      if (assignedCount === 0) {
        newErrors.profiles = 'Debes asignar al menos un perfil antes de vender.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // Si el plan es "Disponible", la cuenta queda en espera
    const isDisponible = formData.plan === 'Disponible';

    // IMPORTANTE: Calcular usesClients en el momento del submit para evitar problemas de stale closures
    // Usar TWO_SCREEN_PRODUCTS directamente para asegurar que se usa el valor actual
    const isTwoScreenProduct = TWO_SCREEN_PRODUCTS.includes(formData.productType);

    // Si hay perfiles y al menos uno está asignado, guardar ese cliente
    const assignedProfiles = profiles.filter(p => p.clientName.trim());
    const primaryClientName = assignedProfiles.length > 0
      ? assignedProfiles[0].clientName
      : formData.clientName.trim();

    // Si se ingresa un cliente manualmente y es nuevo, guardarlo en la lista de clientes
    if (!isDisponible && primaryClientName) {
      const clientExists = state.clients.some(
        c => c.name.toLowerCase() === primaryClientName.toLowerCase()
      );
      if (!clientExists) {
        addClient({ name: primaryClientName });
      }
    }

    // GUARDAR AUTOMÁTICAMENTE TODOS LOS CLIENTES DE LOS PERFILES
    // Recopilar todos los nombres de clientes únicos de los perfiles
    const allProfileClients = profiles
      .map(p => p.clientName.trim())
      .filter(name => name !== '');

    // Agregar cada cliente de perfil si no existe
    allProfileClients.forEach(clientName => {
      const clientExists = state.clients.some(
        c => c.name.toLowerCase() === clientName.toLowerCase()
      );
      if (!clientExists) {
        addClient({ name: clientName });
      }
    });

    // Determinar el estado de venta
    const hasAssignedProfiles = assignedProfiles.length > 0;
    const saleStatus: SaleStatus = isDisponible
      ? 'available'
      : (hasAssignedProfiles || profilesCount === 0
        ? (primaryClientName ? 'sold' : 'available')
        : 'available');

    // Preparar los datos de la cuenta
    // Calcular la fecha de vencimiento: usar manual si está configurada, si no calcular automáticamente
    const finalManualExpiry = tempManualExpiryDate || manualExpiryDate;
    const calculatedExpiry = isDisponible
      ? ''
      : (finalManualExpiry
        ? finalManualExpiry
        : calculateExpiryDate(formData.saleDate, Number(formData.duration)));

    // Determinar qué perfiles guardar
    // Para productos de 2 pantallas (PrimeVideo, Crunchyroll, Paramount+), guardar TODOS los perfiles
    // Para productos "Disponible", guardar todos los perfiles
    // Para otros productos, guardar solo los perfiles asignados
    let profilesToSave: Profile[];
    if (isDisponible) {
      profilesToSave = profiles;
    } else if (isTwoScreenProduct) {
      // Para productos de 2 pantallas, mantener todos los perfiles siempre
      profilesToSave = profiles;
    } else {
      // Para otros productos, guardar solo perfiles con nombre de cliente
      profilesToSave = profiles.filter((p) => p.clientName.trim() !== '');
    }

    console.log('💾 Guardando cuenta con perfiles:', {
      totalProfiles: profiles.length,
      savedProfiles: profilesToSave.length,
      isDisponible,
      isTwoScreenProduct,
      productType: formData.productType
    });

    const accountData = {
      email: formData.email.trim(),
      // Para ChatGPT, guardar contraseña solo si se proporcionó
      password: (formData.productType === 'ChatGPT Plus' && !formData.password.trim())
        ? 'N/A'
        : formData.password.trim(),
      productType: formData.productType,
      plan: formData.plan,
      // Usar el nombre del cliente principal solo si no hay perfiles, o el primer perfil asignado
      clientName: isDisponible ? '' : primaryClientName,
      clientContact: isDisponible ? undefined : (formData.clientContact.trim() || undefined),
      saleDate: isDisponible ? '' : formData.saleDate,
      duration: isDisponible ? 0 : Number(formData.duration),
      expiryDate: calculatedExpiry,
      provider: formData.provider.trim(),
      providerRenewalDate: formData.providerRenewalDate,
      saleStatus,
      notes: formData.notes.trim() || undefined,
      profiles: profilesToSave,
      // Campo usuario para Bleezed Player
      user: formData.productType === 'Blessed Player' ? formData.user.trim() : undefined,
    };

    if (isEditing && account) {
      updateAccount({
        ...account,
        ...accountData,
      });
    } else {
      addAccount(accountData);
    }

    // Limpiar estados de fecha manual
    setTempManualExpiryDate('');
    setManualExpiryDate('');
    setIsManualExpiry(false);

    onClose();
  };

  // Calcular fecha de vencimiento - usar manual si existe, si no calcular
  const calculatedExpiryDate = formData.saleDate && formData.duration
    ? calculateExpiryDate(formData.saleDate, Number(formData.duration))
    : '';
  // Si estamos editando la fecha (tempManualExpiryDate tiene valor), mostrarla
  const expiryDatePreview = tempManualExpiryDate || (isManualExpiry ? manualExpiryDate : calculatedExpiryDate);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--bg-card)' }}>
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {isEditing ? 'Editar Cuenta' : 'Nueva Cuenta'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Credenciales */}
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
                Credenciales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* MaxPlayer y Blessed Player usan Usuario en vez de Correo */}
                {['MaxPlayer', 'Blessed Player'].includes(formData.productType) ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        {formData.productType === 'Blessed Player' ? 'Código *' : 'Usuario *'}
                      </label>
                      <input
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          errors.email ? 'border-red-500' : ''
                        }`}
                        style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                        placeholder={formData.productType === 'Blessed Player' ? 'Código del dispositivo' : 'Usuario'}
                      />
                    </div>
                    {formData.productType === 'Blessed Player' && (
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                          Usuario *
                        </label>
                        <input
                          type="text"
                          name="user"
                          value={formData.user}
                          onChange={handleChange}
                          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.email ? 'border-red-500' : ''
                          }`}
                          style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                          placeholder="Usuario del dispositivo"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Correo *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : ''
                      }`}
                      style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                      placeholder="cuenta@ejemplo.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                )}

                {formData.productType !== 'Blessed Player' && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Contraseña {formData.productType !== 'ChatGPT Plus' && '*'}
                    {formData.productType === 'ChatGPT Plus' && (
                      <span className="text-xs font-normal ml-1" style={{ color: 'var(--text-muted)' }}>(Opcional)</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.password ? 'border-red-500' : ''
                      }`}
                      style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                      placeholder={formData.productType === 'ChatGPT Plus' ? 'Se usa email del cliente' : 'Contraseña'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {showPassword ? 'Ocultar' : 'Ver'}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  {formData.productType === 'ChatGPT Plus' && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Para ChatGPT se usa el email del cliente para activar la cuenta
                    </p>
                  )}
                </div>
                )}
              </div>
            </div>

            {/* Producto y Plan */}
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
                Producto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Plataforma *
                  </label>
                  {/* Buscador de productos */}
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={formData.productType}
                    onChange={(e) => {
                      // Buscar coincidencia exacta o parcial
                      const searchValue = e.target.value.toLowerCase();
                      const matchingProduct = state.products.find(p =>
                        p.name.toLowerCase().includes(searchValue)
                      );
                      if (matchingProduct) {
                        setFormData(prev => ({ ...prev, productType: matchingProduct.name, plan: '' }));
                      } else {
                        setFormData(prev => ({ ...prev, productType: e.target.value }));
                      }
                    }}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-2"
                    style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  />
                  {/* Selector de productos */}
                  <select
                    name="productType"
                    value={formData.productType}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.productType ? 'border-red-500' : ''
                    }`}
                    style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  >
                    <option value="">Seleccionar...</option>
                    {state.products.map((product) => (
                      <option key={product.id} value={product.name}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  {errors.productType && <p className="text-red-500 text-xs mt-1">{errors.productType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Plan *
                  </label>
                  <select
                    name="plan"
                    value={formData.plan}
                    onChange={handlePlanChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.plan ? 'border-red-500' : ''
                    }`}
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      color: formData.plan === 'Disponible' ? 'var(--warning)' : 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                    disabled={!formData.productType}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Disponible">Disponible (En espera de venta)</option>
                    {plans.map((plan) => (
                      <option key={plan} value={plan}>
                        {plan}
                      </option>
                    ))}
                  </select>
                  {formData.plan === 'Disponible' && (
                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--warning)' }}>
                      La cuenta ficarÃ¡ disponible para venta posterior
                    </p>
                  )}
                  {errors.plan && <p className="text-red-500 text-xs mt-1">{errors.plan}</p>}
                </div>

                {/* Selector de perfiles - Siempre visible */}
                <div className="mt-4 p-5 rounded-xl border-2" style={{
                  backgroundColor: '#ffffff',
                  borderColor: '#6366f1',
                }}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-lg font-bold" style={{ color: '#1e293b' }}>
                      Perfiles/Clientes ({profilesCount}/{maxProfiles})
                      {usesSingleProfile && (
                        <span className="ml-2 text-xs font-normal" style={{ color: '#6366f1' }}>
                          (1 persona)
                        </span>
                      )}
                    </p>
                    {!usesSingleProfile && (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={removeProfile}
                          className="w-12 h-12 rounded-full font-bold text-white text-xl flex items-center justify-center transition-transform hover:scale-110 shadow-lg"
                          style={{
                            backgroundColor: '#dc2626',
                            opacity: profilesCount === 0 ? 0.4 : 1,
                            cursor: profilesCount === 0 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          -
                        </button>
                        <span className="font-bold text-3xl min-w-[60px] text-center" style={{ color: '#1e293b' }}>
                          {profilesCount}
                        </span>
                        <button
                          type="button"
                          onClick={addProfile}
                          className="w-12 h-12 rounded-full font-bold text-white text-xl flex items-center justify-center transition-transform hover:scale-110 shadow-lg"
                          style={{
                            backgroundColor: '#16a34a',
                            opacity: profilesCount >= maxProfiles ? 0.4 : 1,
                            cursor: profilesCount >= maxProfiles ? 'not-allowed' : 'pointer'
                          }}
                        >
                          +
                        </button>
                      </div>
                    )}
                    {usesSingleProfile && (
                      <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: '#6366f1', color: '#ffffff' }}>
                        Fijo
                      </span>
                    )}
                  </div>
                  {!usesSingleProfile ? (
                    <p className="text-base font-medium" style={{ color: '#64748b' }}>
                      Presiona <span className="font-bold" style={{color: '#16a34a'}}>+</span> para agregar perfiles o <span className="font-bold" style={{color: '#dc2626'}}>-</span> para quitar
                    </p>
                  ) : (
                    <p className="text-base font-medium" style={{ color: '#64748b' }}>
                      Este producto permite solo 1 perfil con PIN
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Perfiles/Clientes (siempre visible si hay perfiles) */}
            {profilesCount > 0 && (
              <div className="rounded-xl p-5 border-2" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                <div className="flex items-center gap-3 mb-5">
                  <Users className="w-6 h-6" style={{ color: '#6366f1' }} />
                  <h3 className="text-lg font-bold" style={{ color: '#1e293b' }}>
                    Datos de los Perfiles
                  </h3>
                  <span className="ml-auto px-3 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: '#6366f1', color: '#ffffff' }}>
                    {profiles.filter(p => p.clientName.trim()).length}/{profilesCount} asignados
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {profiles.map((profile) => (
                    <div key={profile.slot} className="rounded-xl p-5 border-2 shadow-md" style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg" style={{ backgroundColor: '#6366f1' }}>
                          {profile.slot}
                        </div>
                        <label className="block text-lg font-bold" style={{ color: '#1e293b' }}>
                          Perfil {profile.slot}
                        </label>
                      </div>

                      {/* Nombre del cliente - SIEMPRE editable */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#475569' }}>
                          Nombre del Cliente
                        </label>
                        <input
                          type="text"
                          value={profile.clientName}
                          onChange={(e) => handleProfileChange(profile.slot, e.target.value)}
                          className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 text-base font-medium"
                          style={{ backgroundColor: '#ffffff', color: '#1e293b', borderColor: '#94a3b8' }}
                          placeholder="Escribe el nombre"
                        />
                        {/* Lista de clientes */}
                        {state.clients.length > 0 && (
                          <select
                            value={profile.clientName}
                            onChange={(e) => handleProfileChange(profile.slot, e.target.value)}
                            className="w-full mt-2 px-3 py-2 text-sm rounded-lg border-2 font-medium"
                            style={{ backgroundColor: '#ffffff', color: '#475569', borderColor: '#94a3b8' }}
                          >
                            <option value="">Seleccionar cliente...</option>
                            {state.clients.map((client) => (
                              <option key={client.id} value={client.name}>
                                {client.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* PIN del perfil */}
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#475569' }}>
                          PIN de Acceso
                        </label>
                        <input
                          type="text"
                          value={profile.pin || ''}
                          onChange={(e) => handlePinChange(profile.slot, e.target.value)}
                          maxLength={4}
                          className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xl text-center font-bold font-mono"
                          style={{ backgroundColor: '#ffffff', color: '#1e293b', borderColor: '#94a3b8' }}
                          placeholder="1234"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {errors.profiles && (
                  <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#fef2f2', border: '2px solid #ef4444' }}>
                    <p className="text-sm flex items-center gap-2 font-bold" style={{ color: '#dc2626' }}>
                      <span className="text-lg">⚠️</span>
                      {errors.profiles}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Cliente Principal - Solo si no es "Disponible" Y NO hay perfiles */}
            {formData.plan !== 'Disponible' && profilesCount === 0 && (
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
                  Cliente Principal
                </h3>

                {/* Selector de modo */}
                {state.clients.length > 0 && (
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="clientMode"
                        checked={!customClientMode}
                        onChange={() => handleCustomClientToggle(false)}
                        className="w-4 h-4"
                        style={{ color: 'var(--accent-primary)' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Seleccionar de lista</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="clientMode"
                        checked={customClientMode}
                        onChange={() => handleCustomClientToggle(true)}
                        className="w-4 h-4"
                        style={{ color: 'var(--accent-primary)' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Ingresar manualmente</span>
                    </label>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Nombre del Cliente {customClientMode && '*'}
                    </label>
                    {customClientMode ? (
                      <input
                        type="text"
                        name="clientName"
                        value={formData.clientName}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                          errors.clientName ? 'border-red-500' : ''
                        }`}
                        style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                        placeholder="Nombre completo"
                      />
                    ) : (
                      <select
                        name="clientName"
                        value={formData.clientName}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, clientName: e.target.value }));
                          if (errors.clientName) {
                            setErrors((prev) => ({ ...prev, clientName: '' }));
                          }
                        }}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                          errors.clientName ? 'border-red-500' : ''
                        }`}
                        style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                      >
                        <option value="">Seleccionar cliente...</option>
                        {state.clients.map((client) => (
                          <option key={client.id} value={client.name}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Contacto
                    </label>
                    <input
                      type="text"
                      name="clientContact"
                      value={formData.clientContact}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                      placeholder="Teléfono o email"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Venta y Duración - Solo si no es "Disponible" */}
            {formData.plan !== 'Disponible' && (
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
                  Venta
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Fecha de Venta *
                    </label>
                    <input
                      type="date"
                      name="saleDate"
                      value={formatDateForInput(formData.saleDate)}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                        errors.saleDate ? 'border-red-500' : ''
                      }`}
                      style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                    />
                    {errors.saleDate && <p className="text-red-500 text-xs mt-1">{errors.saleDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Duración *
                    </label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                        errors.duration ? 'border-red-500' : ''
                      }`}
                      style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                        <option key={m} value={m}>
                          {m === 1 ? '30 días' : `${m} meses`}
                        </option>
                      ))}
                    </select>
                    {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Vence el {isManualExpiry && <span className="text-xs text-yellow-400">(Manual)</span>}
                    </label>
                    {tempManualExpiryDate ? (
                      // Modo edición
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="date"
                            value={formatDateForInput(tempManualExpiryDate)}
                            onChange={(e) => setTempManualExpiryDate(e.target.value)}
                            className="w-full px-4 py-2.5 border rounded-lg font-medium"
                            style={{ backgroundColor: 'var(--bg-input)', color: 'var(--accent-primary)', borderColor: '#6366f1' }}
                            autoFocus
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (tempManualExpiryDate) {
                              // Guardar en formato con hora para evitar problemas de timezone
                              const formattedDate = formatDateForInput(tempManualExpiryDate);
                              setManualExpiryDate(formattedDate ? formattedDate + 'T12:00:00' : '');
                              setIsManualExpiry(true);
                            }
                            setTempManualExpiryDate('');
                          }}
                          className="px-3 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors flex items-center justify-center"
                          title="Confirmar fecha manual"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTempManualExpiryDate('');
                            setIsManualExpiry(false);
                            setManualExpiryDate('');
                          }}
                          className="px-3 py-2.5 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors flex items-center justify-center"
                          title="Cancelar - usar fecha automática"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      // Modo visualización
                      <div className="flex items-center gap-2">
                        <div className="flex-1 px-4 py-2.5 border rounded-lg font-medium" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--accent-primary)', borderColor: isManualExpiry ? '#f59e0b' : 'var(--border-color)' }}>
                          {expiryDatePreview ? (() => {
                            // Agregar hora del mediodía para evitar problemas de timezone
                            const dateStr = expiryDatePreview.includes('T') ? expiryDatePreview : expiryDatePreview + 'T12:00:00';
                            return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                          })() : '-'}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            // Iniciar con la fecha actual (calculada o manual)
                            // Extraer solo la parte de fecha para el input
                            const dateToUse = formatDateForInput(manualExpiryDate) || formatDateForInput(calculatedExpiryDate) || getChileDateString();
                            setTempManualExpiryDate(dateToUse);
                          }}
                          className="px-3 py-2.5 border-2 border-indigo-500 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors flex items-center justify-center"
                          title="Modificar fecha manualmente"
                          style={{ borderColor: '#6366f1' }}
                        >
                          <Calendar className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    {isManualExpiry && (
                      <p className="text-xs mt-1 text-amber-400">
                        Fecha manual activada - La fecha no cambiará aunque modifiques la duración
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Proveedor */}
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
                Proveedor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Nombre del Proveedor *
                  </label>
                  <input
                    type="text"
                    name="provider"
                    value={formData.provider}
                    onChange={handleChange}
                    list="providers-list"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                      errors.provider ? 'border-red-500' : ''
                    }`}
                    style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                    placeholder="Nombre del proveedor"
                  />
                  <datalist id="providers-list">
                    {state.providers.map((p) => (
                      <option key={p.id} value={p.name} />
                    ))}
                  </datalist>
                  {errors.provider && <p className="text-red-500 text-xs mt-1">{errors.provider}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Fecha de Renovación Proveedor
                  </label>
                  <input
                    type="date"
                    name="providerRenewalDate"
                    value={formatDateForInput(formData.providerRenewalDate)}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  />
                </div>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Notas
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                placeholder="Notas adicionales..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg transition-colors"
              style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-lg transition-colors font-medium"
              style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
            >
              {isEditing ? 'Guardar Cambios' : 'Agregar Cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
