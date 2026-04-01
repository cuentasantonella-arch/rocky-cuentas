import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase - Rocky Cuentas
const supabaseUrl = 'https://lxfkigylpvughjlskocw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4ZmtpZ3lscHZ1Z2hqbHNrb2N3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTAwMjg5NiwiZXhwIjoyMDkwNTc4ODk2fQ.vpBhK82NSABGyZL02_7y3Lk5bcOzOSqhcoDvTs8J_CE';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Verificar conexión con Supabase
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('accounts').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Error de conexión a Supabase:', error.message);
      return false;
    }
    console.log('✅ Conexión a Supabase exitosa');
    return true;
  } catch (error) {
    console.error('Error al verificar conexión:', error);
    return false;
  }
}
