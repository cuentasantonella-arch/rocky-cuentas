-- =====================================================
-- Rocky Cuentas - Supabase RLS Fix
-- Ejecutar este SQL en el SQL Editor de Supabase
-- =====================================================

-- 1. Deshabilitar RLS en la tabla clients (para que el login funcione)
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;

-- 2. Asegurar que la tabla clients tiene las columnas necesarias
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Crear usuario admin si no existe
INSERT INTO public.clients (name, email, role, password, created_at, updated_at)
SELECT 'admin', 'admin@localhost', 'admin', 'admin123', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.clients WHERE name = 'admin');

-- 4. Verificar los usuarios
SELECT * FROM public.clients;

-- =====================================================
-- NOTA: Si prefieres mantener RLS habilitado,
-- descomenta y usa estas políticas:
-- =====================================================

-- -- Política para permitir leer todos los clientes (para login)
-- CREATE POLICY "Allow read all clients" ON public.clients
-- FOR SELECT USING (true);
--
-- -- Política para permitir insertar clientes
-- CREATE POLICY "Allow insert clients" ON public.clients
-- FOR INSERT WITH CHECK (true);
--
-- -- Política para permitir actualizar clientes
-- CREATE POLICY "Allow update clients" ON public.clients
-- FOR UPDATE USING (true);
--
-- -- Política para permitir eliminar clientes
-- CREATE POLICY "Allow delete clients" ON public.clients
-- FOR DELETE USING (true);
