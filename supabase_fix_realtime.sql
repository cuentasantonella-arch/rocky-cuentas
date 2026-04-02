-- =====================================================
-- Rocky Cuentas - Script de Configuración SQL
-- EJECUTAR ESTE SCRIPT EN: Supabase Dashboard > SQL Editor
-- =====================================================

-- =============================================
-- 1. HABILITAR ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructives ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. CREAR POLÍTICAS RLS PARA CADA TABLA
-- =============================================

-- Tabla: accounts
DROP POLICY IF EXISTS "Allow all operations on accounts" ON accounts;
CREATE POLICY "Allow all operations on accounts"
ON accounts
FOR ALL
USING (true)
WITH CHECK (true);

-- Tabla: products
DROP POLICY IF EXISTS "Allow all operations on products" ON products;
CREATE POLICY "Allow all operations on products"
ON products
FOR ALL
USING (true)
WITH CHECK (true);

-- Tabla: instructives
DROP POLICY IF EXISTS "Allow all operations on instructives" ON instructives;
CREATE POLICY "Allow all operations on instructives"
ON instructives
FOR ALL
USING (true)
WITH CHECK (true);

-- Tabla: providers
DROP POLICY IF EXISTS "Allow all operations on providers" ON providers;
CREATE POLICY "Allow all operations on providers"
ON providers
FOR ALL
USING (true)
WITH CHECK (true);

-- Tabla: clients
DROP POLICY IF EXISTS "Allow all operations on clients" ON clients;
CREATE POLICY "Allow all operations on clients"
ON clients
FOR ALL
USING (true)
WITH CHECK (true);

-- Tabla: settings
DROP POLICY IF EXISTS "Allow all operations on settings" ON settings;
CREATE POLICY "Allow all operations on settings"
ON settings
FOR ALL
USING (true)
WITH CHECK (true);

-- Tabla: activity_log
DROP POLICY IF EXISTS "Allow all operations on activity_log" ON activity_log;
CREATE POLICY "Allow all operations on activity_log"
ON activity_log
FOR ALL
USING (true)
WITH CHECK (true);

-- =============================================
-- 3. FUNCIONES PARA HABILITAR REALTIME
-- =============================================

-- Habilitar Realtime para tablas específicas
-- IMPORTANTE: Ejecutar DESDE EL DASHBOARD DE SUPABASE:
-- 1. Ir a Database > Tables
-- 2. Seleccionar cada tabla
-- 3. Ir a "Replication" y habilitar "Enable Replication"

-- Para habilitar mediante SQL (requiere permisos de superadmin):
DO $$
DECLARE
    tables TEXT[] := ARRAY['accounts', 'products', 'instructives', 'providers', 'clients', 'settings', 'activity_log'];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        BEGIN
            -- Habilitar replicación en la tabla
            EXECUTE format('ALTER TABLE %I REPLICA IDENTITY FULL', t);
            -- Nota: La habilitación real de Realtime se hace desde el Dashboard
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'No se pudo modificar %: %', t, SQLERRM;
        END;
    END LOOP;
END $$;

-- =============================================
-- 4. VERIFICAR CONFIGURACIÓN
-- =============================================

-- Verificar si RLS está habilitado
SELECT
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar políticas creadas
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================
-- 5. MENSAJE DE CONFIRMACIÓN
-- =============================================

SELECT '========================================' AS status;
SELECT 'Script completado exitosamente!' AS message;
SELECT 'Ahora ve a Supabase Dashboard > Database > Tables' AS step1;
SELECT 'Selecciona cada tabla y habilita "Enable Replication" en la pestaña Replication' AS step2;
SELECT 'Esto es necesario para que el Realtime funcione correctamente' AS step3;
SELECT '========================================' AS status;
