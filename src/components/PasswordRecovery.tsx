import { useState } from 'react';
import { Mail, Lock, ArrowLeft, Check, X, Loader2, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sendPasswordResetEmail } from '../lib/email';

interface PasswordRecoveryProps {
  onBack: () => void;
  onComplete: () => void;
}

export function PasswordRecovery({ onBack, onComplete }: PasswordRecoveryProps) {
  const [step, setStep] = useState<'username' | 'code' | 'newPassword'>('username');
  const [username, setUsername] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Generar código de 6 dígitos
  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Guardar código en Supabase
  const saveRecoveryCode = async (user: string, recoveryCode: string) => {
    try {
      const { error } = await supabase.from('settings').upsert({
        key: `recovery_${user}`,
        value: JSON.stringify({
          code: recoveryCode,
          expires: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos
          used: false,
        }),
        updated_at: new Date().toISOString(),
      });
      return !error;
    } catch (err) {
      console.error('Error guardando código:', err);
      return false;
    }
  };

  // Verificar código
  const verifyCode = async (user: string, enteredCode: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', `recovery_${user}`)
        .single();

      if (error || !data) return false;

      const recoveryData = JSON.parse(data.value);

      if (recoveryData.code !== enteredCode) return false;
      if (new Date() > new Date(recoveryData.expires)) return false;
      if (recoveryData.used) return false;

      return true;
    } catch (err) {
      console.error('Error verificando código:', err);
      return false;
    }
  };

  // Marcar código como usado
  const markCodeAsUsed = async (user: string) => {
    try {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', `recovery_${user}`)
        .single();

      if (data) {
        const recoveryData = JSON.parse(data.value);
        recoveryData.used = true;
        await supabase.from('settings').update({ value: JSON.stringify(recoveryData) }).eq('key', `recovery_${user}`);
      }
    } catch (err) {
      console.error('Error marcando código:', err);
    }
  };

  // Actualizar contraseña
  const updatePassword = async (user: string, newPass: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ password: newPass, updated_at: new Date().toISOString() })
        .eq('name', user);

      return !error;
    } catch (err) {
      console.error('Error actualizando contraseña:', err);
      return false;
    }
  };

  // Buscar usuario por username y obtener email
  const findUserByUsername = async (user: string) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('name, email')
        .eq('name', user)
        .single();

      if (error || !data) return null;
      return data;
    } catch (err) {
      console.error('Error buscando usuario:', err);
      return null;
    }
  };

  // Paso 1: Buscar usuario
  const handleFindUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const userData = await findUserByUsername(username);

    if (!userData) {
      setError('No existe un usuario con ese nombre');
      setLoading(false);
      return;
    }

    setUserEmail(userData.email || 'admin@localhost');

    // Generar y guardar código
    const recoveryCode = generateCode();
    const saved = await saveRecoveryCode(username, recoveryCode);

    if (!saved) {
      setError('Error al procesar la solicitud');
      setLoading(false);
      return;
    }

    // Enviar email si tiene email registrado, si no mostrar código en consola
    if (userData.email) {
      const emailResult = await sendPasswordResetEmail(userData.email, recoveryCode);
      if (emailResult.success) {
        setSuccess('Código enviado a tu email. Revisa tu bandeja de entrada.');
      } else {
        console.log('Código de recuperación:', recoveryCode);
        setSuccess('Código generado. (Revisa la consola del navegador si no recibiste el email)');
      }
    } else {
      console.log('Código de recuperación:', recoveryCode);
      setSuccess('Código generado. (El usuario no tiene email - revisa la consola del navegador)');
    }

    setStep('code');
    setLoading(false);
  };

  // Paso 2: Verificar código
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const isValid = await verifyCode(username, code);

    if (!isValid) {
      setError('Código inválido o expirado');
      setLoading(false);
      return;
    }

    setSuccess('Código verificado correctamente');
    setStep('newPassword');
    setLoading(false);
  };

  // Paso 3: Nueva contraseña
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (newPassword.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    const updated = await updatePassword(username, newPassword);

    if (!updated) {
      setError('Error al actualizar la contraseña');
      setLoading(false);
      return;
    }

    await markCodeAsUsed(username);
    setSuccess('¡Contraseña actualizada exitosamente!');

    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
      {/* Fondo con imagen */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/background-login.jpg')" }}
      />
      {/* Overlay oscuro para legibilidad */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-md">
        <div className="bg-[#16213e]/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-center relative">
            <button
              onClick={onBack}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white">Recuperar Contraseña</h2>
            <p className="text-orange-200 text-sm mt-1">
              {step === 'username' && 'Ingresa tu usuario'}
              {step === 'code' && 'Ingresa el código'}
              {step === 'newPassword' && 'Nueva contraseña'}
            </p>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <X className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                <Check className="w-4 h-4 flex-shrink-0" />
                {success}
              </div>
            )}

            {/* Paso 1: Username */}
            {step === 'username' && (
              <form onSubmit={handleFindUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre de usuario
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#0f0f1a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Tu nombre de usuario"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Ingresa el usuario con el que inicias sesión
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    'Buscar Usuario'
                  )}
                </button>
              </form>
            )}

            {/* Paso 2: Código */}
            {step === 'code' && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Código de verificación
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 bg-[#0f0f1a] border border-gray-700 rounded-xl text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Revisa tu bandeja de entrada o spam{userEmail !== 'admin@localhost' ? '' : ' (o la consola del navegador)'}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    'Verificar Código'
                  )}
                </button>
              </form>
            )}

            {/* Paso 3: Nueva contraseña */}
            {step === 'newPassword' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#0f0f1a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Mínimo 4 caracteres"
                      minLength={4}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#0f0f1a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Repite la contraseña"
                      minLength={4}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-500 hover:to-emerald-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Nueva Contraseña'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
