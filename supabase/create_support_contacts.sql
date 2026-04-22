-- =====================================================
-- SCRIPT PARA CREAR TABLA support_contacts
-- Rocky Cuentas - Ejecutar en SQL Editor de Supabase
-- =====================================================

-- 1. Crear la tabla support_contacts
CREATE TABLE IF NOT EXISTS support_contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    whatsapp TEXT,
    telegram TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE support_contacts ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS para acceso público (cualquier usuario puede leer y escribir)
DROP POLICY IF EXISTS "Allow public read" ON support_contacts;
CREATE POLICY "Allow public read" ON support_contacts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON support_contacts;
CREATE POLICY "Allow public insert" ON support_contacts
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON support_contacts;
CREATE POLICY "Allow public update" ON support_contacts
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete" ON support_contacts;
CREATE POLICY "Allow public delete" ON support_contacts
    FOR DELETE USING (true);

-- 4. Insertar contacto inicial de RIPPER FLIX
INSERT INTO support_contacts (id, name, whatsapp, website, created_at, updated_at)
VALUES (
    'ripper-flix-default',
    'RIPPER FLIX',
    '+51910162324',
    'https://luchitovip.com/inicio.php',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 5. Verificar que se creó la tabla
SELECT '=== TABLA support_contacts CREADA ===' AS status;
SELECT * FROM support_contacts;
