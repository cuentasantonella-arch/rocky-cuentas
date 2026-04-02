-- =====================================================
-- SCRIPT PARA POBLAR TODAS LAS TABLAS VACÍAS
-- Rocky Cuentas - Ejecutar en SQL Editor de Supabase
-- =====================================================

-- 1. PRIMERO: Insertar productos si no existen
INSERT INTO products (id, name, icon, plans, color, image_url)
VALUES
    ('netflix', 'Netflix', 'tv', '["Completo 4K", "2 Pantallas", "5 Perfiles"]', '#E50914', 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Logonetflix.png'),
    ('spotify', 'Spotify', 'music', '["Individual", "Duo", "Familiar"]', '#1DB954', 'https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg'),
    ('primevideo', 'PrimeVideo', 'tv', '["Standar"]', '#00A8E1', 'https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg'),
    ('disneyplus', 'Disney+', 'film', '["Standar", "Premium"]', '#113CCF', 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg'),
    ('hbomax', 'HBO Max', 'tv', '["Standar", "Con TNT"]', '#B535F6', 'https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg'),
    ('crunchyroll', 'Crunchyroll', 'tv', '["Standar"]', '#F47521', 'https://upload.wikimedia.org/wikipedia/commons/0/08/Crunchyroll_Logo.svg'),
    ('youtube', 'YouTube Premium', 'music', '["Individual", "Familiar"]', '#FF0000', 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg'),
    ('deezer', 'Deezer', 'music', '["HiFi", "Premium"]', '#FEAA2D', 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Deezer_logo.svg'),
    ('chatgpt', 'ChatGPT Plus', 'ai', '["Plus", "Team"]', '#10A37F', 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg'),
    ('gemini', 'Gemini Pro', 'ai', '["Pro", "Advanced"]', '#4285F4', 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg'),
    ('tntsports', 'TNT Sports', 'sports', '["Premium"]', '#E30613', 'https://upload.wikimedia.org/wikipedia/commons/5/51/TNT_logo_%282016%29.svg')
ON CONFLICT (id) DO NOTHING;

-- 2. Insertar instructivos si no existen
INSERT INTO instructives (id, title, content, image_url)
VALUES
    ('netflix', 'Netflix Garantía y Uso',
     '✅ GARANTÍA Y USO DE NETFLIX 🎬🔐

1. La cuenta es de uso COMPARTIDO, es decir, varios perfiles.
2. Solo se puede ver desde 1 dispositivo a la vez.
3. Si la cuenta se cae o caduca, comunicate inmediatamente.
4. No cambiar el email ni la contraseña.
5. Si se bloquea el dispositivo, se puede liberar.
6. Disfruta de tu contenido favorito!

— Equipo Cuentas Rocky',
     'https://upload.wikimedia.org/wikipedia/commons/7/7a/Logonetflix.png'),
    ('spotify', 'Spotify - Instrucciones',
     '🎵 INSTRUCCIONES SPOTIFY

1. Descarga la app de Spotify.
2. Inicia sesión con las credenciales.
3. Disfruta de tu música sin anuncios.
4. Descarga canciones para escuchar offline.

— Equipo Cuentas Rocky',
     'https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg'),
    ('primevideo', 'PrimeVideo - Instrucciones',
     '🎬 INSTRUCCIONES PRIME VIDEO

1. Ingresa a primevideo.com o la app.
2. Usa las credenciales proporcionadas.
3. Disfruta de películas y series.

— Equipo Cuentas Rocky',
     'https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg')
ON CONFLICT (id) DO NOTHING;

-- 3. Verificar que se insertaron los datos
SELECT '=== VERIFICACIÓN DE INSERCIONES ===' AS status;
SELECT 'products' AS tabla, COUNT(*) AS cantidad FROM products
UNION ALL
SELECT 'instructives', COUNT(*) FROM instructives;

-- 4. Mostrar los datos insertados
SELECT '=== PRODUCTOS ===' AS status;
SELECT * FROM products;

SELECT '=== INSTRUCTIVOS ===' AS status;
SELECT id, title, created_at FROM instructives;
