-- =====================================================
-- SCRIPT DE DIAGNÓSTICO COMPLETO - Rocky Cuentas
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. VERIFICAR TODAS LAS TABLAS
SELECT '=== VERIFICACIÓN DE TABLAS ===' AS step;
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. VERIFICAR SI REALTIME ESTÁ HABILITADO EN CADA TABLA
SELECT '=== VERIFICACIÓN DE REALTIME ===' AS step;
SELECT
    'accounts' as table_name,
    EXISTS(
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'accounts'
    ) as realtime_enabled
UNION ALL
SELECT
    'products' as table_name,
    EXISTS(
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'products'
    ) as realtime_enabled
UNION ALL
SELECT
    'instructives' as table_name,
    EXISTS(
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'instructives'
    ) as realtime_enabled
UNION ALL
SELECT
    'providers' as table_name,
    EXISTS(
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'providers'
    ) as realtime_enabled
UNION ALL
SELECT
    'clients' as table_name,
    EXISTS(
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'clients'
    ) as realtime_enabled
UNION ALL
SELECT
    'settings' as table_name,
    EXISTS(
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'settings'
    ) as realtime_enabled;

-- 3. VERIFICAR RLS (Row Level Security)
SELECT '=== VERIFICACIÓN DE RLS ===' AS step;
SELECT
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 4. VERIFICAR POLÍTICAS RLS CREADAS
SELECT '=== POLÍTICAS RLS ===' AS step;
SELECT
    policyname,
    tablename,
    permissive,
    cmd as command
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. CONTAR DATOS EN CADA TABLA
SELECT '=== CANTIDAD DE DATOS ===' AS step;
SELECT 'accounts' as table_name, COUNT(*) as count FROM accounts
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'instructives', COUNT(*) FROM instructives
UNION ALL SELECT 'providers', COUNT(*) FROM providers
UNION ALL SELECT 'clients', COUNT(*) FROM clients
UNION ALL SELECT 'settings', COUNT(*) FROM settings;

-- 6. MOSTRAR INSTRUCTIVOS ACTUALES
SELECT '=== INSTRUCTIVOS ACTUALES ===' AS step;
SELECT id, title, created_at FROM instructives ORDER BY created_at DESC LIMIT 10;

-- =====================================================
-- INSTRUCCIONES PARA HABILITAR REALTIME
-- =====================================================
SELECT '========================================' AS IMPORTANT;
SELECT 'PASOS PARA HABILITAR REALTIME:' AS IMPORTANT;
SELECT '1. Ve a https://supabase.com/dashboard' AS IMPORTANT;
SELECT '2. Selecciona tu proyecto' AS IMPORTANT;
SELECT '3. Ve a: Database > Tables' AS IMPORTANT;
SELECT '4. Para CADA tabla (accounts, products, instructives, providers, clients, settings):' AS IMPORTANT;
SELECT '   - Haz clic en la tabla' AS IMPORTANT;
SELECT '   - Ve a la pestaña "Replication"' AS IMPORTANT;
SELECT '   - Activa "Enable Replication"' AS IMPORTANT;
SELECT '5. Espera 1-2 minutos' AS IMPORTANT;
SELECT '6. Refresca la página de la aplicación' AS IMPORTANT;
SELECT '========================================' AS IMPORTANT;
