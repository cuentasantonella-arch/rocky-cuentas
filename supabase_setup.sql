-- =============================================
-- SCRIPT SQL PARA CONFIGURAR SUPABASE
-- Rocky Cuentas - Sistema de Gestión
-- =============================================

-- 1. Tabla de cuentas
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_id(),
    email TEXT NOT NULL,
    password TEXT,
    product_type TEXT NOT NULL,
    plan TEXT NOT NULL,
    client_name TEXT,
    client_contact TEXT,
    provider TEXT,
    provider_renewal_date TEXT,
    sale_date TEXT,
    duration INTEGER DEFAULT 1,
    expiry_date TEXT,
    sale_status TEXT DEFAULT 'available',
    profiles TEXT DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    plans TEXT[],
    color TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de proveedores
CREATE TABLE IF NOT EXISTS providers (
    id TEXT PRIMARY KEY DEFAULT gen_random_id(),
    name TEXT NOT NULL,
    product_type TEXT,
    contact TEXT,
    email TEXT,
    telegram_username TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY DEFAULT gen_random_id(),
    name TEXT NOT NULL,
    contact TEXT,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de configuración
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY DEFAULT 'app_settings',
    business_name TEXT DEFAULT 'Rocky Cuentas',
    logo_url TEXT,
    alarm_days INTEGER[] DEFAULT ARRAY[7, 3, 1],
    currency TEXT DEFAULT 'USD',
    currency_symbol TEXT DEFAULT '$',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla de actividad
CREATE TABLE IF NOT EXISTS activity_log (
    id TEXT PRIMARY KEY DEFAULT gen_random_id(),
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    details TEXT,
    user_name TEXT,
    account_id TEXT,
    account_email TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabla de instructivos
CREATE TABLE IF NOT EXISTS instructives (
    id TEXT PRIMARY KEY DEFAULT gen_random_id(),
    title TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- IMPORTANTE: HABILITAR ROW LEVEL SECURITY (RLS)
-- Para que cualquiera pueda leer y escribir datos
-- =============================================

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructives ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir acceso público (LECTURA Y ESCRITURA)
-- Accounts
DROP POLICY IF EXISTS "Allow public read" ON accounts;
DROP POLICY IF EXISTS "Allow public insert" ON accounts;
DROP POLICY IF EXISTS "Allow public update" ON accounts;
DROP POLICY IF EXISTS "Allow public delete" ON accounts;
CREATE POLICY "Allow public read" ON accounts FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON accounts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON accounts FOR DELETE USING (true);

-- Products
DROP POLICY IF EXISTS "Allow public read products" ON products;
DROP POLICY IF EXISTS "Allow public write products" ON products;
CREATE POLICY "Allow public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public write products" ON products FOR ALL USING (true);

-- Providers
DROP POLICY IF EXISTS "Allow public read providers" ON providers;
DROP POLICY IF EXISTS "Allow public write providers" ON providers;
CREATE POLICY "Allow public read providers" ON providers FOR SELECT USING (true);
CREATE POLICY "Allow public write providers" ON providers FOR ALL USING (true);

-- Clients
DROP POLICY IF EXISTS "Allow public read clients" ON clients;
DROP POLICY IF EXISTS "Allow public write clients" ON clients;
CREATE POLICY "Allow public read clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Allow public write clients" ON clients FOR ALL USING (true);

-- Settings
DROP POLICY IF EXISTS "Allow public read settings" ON settings;
DROP POLICY IF EXISTS "Allow public write settings" ON settings;
CREATE POLICY "Allow public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow public write settings" ON settings FOR ALL USING (true);

-- Activity Log
DROP POLICY IF EXISTS "Allow public read activity" ON activity_log;
DROP POLICY IF EXISTS "Allow public write activity" ON activity_log;
CREATE POLICY "Allow public read activity" ON activity_log FOR SELECT USING (true);
CREATE POLICY "Allow public write activity" ON activity_log FOR ALL USING (true);

-- Instructives
DROP POLICY IF EXISTS "Allow public read instructives" ON instructives;
DROP POLICY IF EXISTS "Allow public write instructives" ON instructives;
CREATE POLICY "Allow public read instructives" ON instructives FOR SELECT USING (true);
CREATE POLICY "Allow public write instructives" ON instructives FOR ALL USING (true);

-- =============================================
-- INSERTAR DATOS INICIALES (PRODUCTOS Y SETTINGS)
-- =============================================

-- Insertar productos por defecto
INSERT INTO products (id, name, icon, plans, color, image_url) VALUES
    ('1', 'Netflix', 'tv', ARRAY['Completo 4K', '2 Pantallas', '5 Perfiles'], '#E50914', 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Logonetflix.png'),
    ('2', 'PrimeVideo', 'play', ARRAY['Completo', '2 Pantallas'], '#00A8E1', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/3840px-Amazon_Prime_Video_logo.svg.png'),
    ('3', 'Spotify Premium', 'music', ARRAY['Individual', 'Duo', 'Familiar (6)'], '#1DB954', 'https://upload.wikimedia.org/wikipedia/commons/7/71/Spotify.png'),
    ('4', 'Deezer Premium', 'headphones', ARRAY['Free', 'Premium', 'HiFi'], '#FEAA2D', 'https://download.logo.wine/logo/Deezer/Deezer-Logo.wine.png'),
    ('5', 'MaxPlayer', 'film', ARRAY['Básico', 'Premium'], '#7B2CBF', 'https://upload.wikimedia.org/wikipedia/commons/0/0f/MX_Player_Logo.png'),
    ('6', 'Disney+', 'castle', ARRAY['Estándar', 'Premium'], '#113CCF', 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Disney_plus_icon.png'),
    ('7', 'Crunchyroll', 'gamepad-2', ARRAY['Free', 'Fan', 'Mega Fan'], '#F47521', 'https://upload.wikimedia.org/wikipedia/commons/0/08/Crunchyroll_Logo.png'),
    ('8', 'HBO Max', 'tv-2', ARRAY['Estándar', 'Con TNT Sports'], '#B535F6', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/HBO_Max_%282025%29.svg/1280px-HBO_Max_%282025%29.svg.png'),
    ('9', 'TNT Sports Premium', 'trophy', ARRAY['Mensual', 'Anual'], '#E30613', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/TNT_Sports_2020_logo.svg/3840px-TNT_Sports_2020_logo.svg.png'),
    ('10', 'YouTube Premium', 'youtube', ARRAY['Individual', 'Familia'], '#FF0000', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/YouTube_Premium_logo.svg/1280px-YouTube_Premium_logo.svg.png'),
    ('11', 'ChatGPT Plus', 'bot', ARRAY['Mensual', 'Anual'], '#10A37F', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/960px-ChatGPT_logo.svg.png'),
    ('12', 'Gemini Pro', 'gem', ARRAY['Free', 'Pro'], '#4285F4', 'https://logos-world.net/wp-content/uploads/2025/02/Google-Gemini-Logo.png'),
    ('13', 'Paramount+', 'play-circle', ARRAY['Essential', 'Premium', '2 Pantallas'], '#0064FF', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Paramount%2B_logo.svg/1024px-Paramount%2B_logo.svg.png')
ON CONFLICT (id) DO NOTHING;

-- Insertar settings por defecto
INSERT INTO settings (id, business_name, alarm_days, currency, currency_symbol)
VALUES ('app_settings', 'Rocky Cuentas', ARRAY[7, 3, 1], 'USD', '$')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- FUNCIÓN PARA GENERAR IDs ÚNICOS
-- =============================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION gen_random_id()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Habilitar trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instructives_updated_at BEFORE UPDATE ON instructives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INSTRUCTIVOS INICIALES
-- =============================================
INSERT INTO instructives (id, title, content, image_url, category) VALUES
    ('chatgpt',
     'ChatGPT',
     '📱 INSTRUCTIVO CHATGPT PLUS

1. Ingresa a: chat.openai.com
2. Haz clic en "Log In" (Iniciar sesión)
3. Ingresa el correo electrónico proporcionado
4. Ingresa la contraseña proporcionada
5. Si te pide verificar, revisa tu correo

⚠️ IMPORTANTE:
- No cambies la contraseña
- No recuperes el acceso desde otro dispositivo
- Si pierdes acceso, contactar al vendedor

¿Necesitas ayuda? Contacta a tu proveedor.',
     'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/960px-ChatGPT_logo.svg.png',
     'AI')
ON CONFLICT (id) DO NOTHING;

INSERT INTO instructives (id, title, content, image_url, category) VALUES
    ('netflix',
     'Netflix',
     '📺 INSTRUCTIVO NETFLIX

1. Descarga la app Netflix o ingresa a: netflix.com
2. Haz clic en "Iniciar sesión"
3. Ingresa el correo electrónico proporcionado
4. Ingresa la contraseña proporcionada
5. ¡Listo! Disfruta de tus series y películas

📋 PLAN: [PLAN]
👤 PERFILES: Tienes [N] perfiles disponibles

⚠️ IMPORTANTE:
- No cambies el correo ni la contraseña
- Si necesitas ayuda, contacta a tu proveedor',
     'https://upload.wikimedia.org/wikipedia/commons/7/7a/Logonetflix.png',
     'Streaming')
ON CONFLICT (id) DO NOTHING;

INSERT INTO instructives (id, title, content, image_url, category) VALUES
    ('spotify',
     'Spotify Premium',
     '🎵 INSTRUCTIVO SPOTIFY PREMIUM

1. Descarga Spotify o ingresa a: spotify.com
2. Haz clic en "Iniciar sesión"
3. Ingresa el correo electrónico proporcionado
4. Ingresa la contraseña proporcionada
5. ¡Disfruta de música sin anuncios!

✨ CARACTERÍSTICAS:
- Sin anuncios publicitarios
- Reproducción offline
- Calidad de audio alta

⚠️ IMPORTANTE:
- No modifiques la cuenta
- Contacta a tu proveedor ante cualquier problema',
     'https://upload.wikimedia.org/wikipedia/commons/7/71/Spotify.png',
     'Music')
ON CONFLICT (id) DO NOTHING;
