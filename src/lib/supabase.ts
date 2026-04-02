import { createClient, RealtimeChannel } from '@supabase/supabase-js';

// Configuración de Supabase - Rocky Cuentas
const supabaseUrl = 'https://lxfkigylpvughjlskocw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4ZmtpZ3lscHZ1Z2hqbHNrb2N3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTAwMjg5NiwiZXhwIjoyMDkwNTc4ODk2fQ.vpBhK82NSABGyZL02_7y3Lk5bcOzOSqhcoDvTs8J_CE';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Función para habilitar Realtime en una tabla
// NOTA: La habilitación de Realtime se hace desde el Dashboard de Supabase
// Database > Tables > Seleccionar tabla > Replication > Enable Replication
export async function enableRealtimeForTable(tableName: string): Promise<boolean> {
  try {
    // Intentar habilitar mediante RPC (puede que no exista en todos los proyectos)
    const { error } = await supabase.rpc('enable_realtime_for_table', { table_name: tableName });
    if (error) {
      // Si falla, asumimos que ya está habilitado o se hará desde el Dashboard
      console.log(`ℹ️ Realtime para ${tableName}: configuración manual requerida en Dashboard`);
      return false;
    }
    console.log(`✅ Realtime habilitado para ${tableName}`);
    return true;
  } catch (e) {
    console.log(`ℹ️ Realtime para ${tableName}: se configurará desde el Dashboard`);
    return false;
  }
}

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

// Función para verificar si el Realtime está funcionando
export async function checkRealtimeStatus(): Promise<boolean> {
  try {
    const channel = supabase.channel('test-realtime');
    const status = channel.subscribe((status) => {
      console.log('Realtime status:', status);
      return status === 'SUBSCRIBED';
    });

    // Timeout de 3 segundos
    return new Promise((resolve) => {
      setTimeout(() => {
        supabase.removeChannel(channel);
        resolve(false);
      }, 3000);
    });
  } catch (error) {
    console.error('Error verificando Realtime:', error);
    return false;
  }
}
