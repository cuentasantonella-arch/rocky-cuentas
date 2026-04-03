-- ============================================
-- CHAT REAL TIME - Rocky Cuentas
-- ============================================
-- Ejecuta este SQL en tu Supabase SQL Editor
-- https://supabase.com/dashboard/project/lxfkigylpvughjlskocw/sql

-- 1. Crear tabla de mensajes (si no existe)
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Deshabilitar RLS para simplificar el chat (temporalmente)
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas existentes si hay conflicto
DROP POLICY IF EXISTS "Allow read" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow insert" ON public.chat_messages;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.chat_messages;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.chat_messages;

-- 4. Crear políticas permisivas
CREATE POLICY "Enable read access for all users"
ON public.chat_messages FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users"
ON public.chat_messages FOR INSERT WITH CHECK (true);

-- 5. Habilitar RLS de vuelta
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 6. Habilitar Realtime para la tabla (desde el Dashboard)
-- Ve a: Database > Tables > chat_messages > Replication > Enable Replication
-- O ejecuta esto:
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- 7. Habilitar Realtime en la tabla
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- ============================================
-- NOTA IMPORTANTE:
-- ============================================
-- Después de ejecutar este SQL, también necesitas:
-- 1. Ir al Dashboard de Supabase
-- 2. Database > Tables > chat_messages
-- 3. Click en "Replication"
-- 4. Enable Replication
-- ============================================

SELECT '✅ Tabla chat_messages creada y configurada' AS status;
