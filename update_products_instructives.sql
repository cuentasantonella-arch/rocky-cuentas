-- =====================================================
-- ACTUALIZAR TABLA PRODUCTS CON CAMPO INSTRUCTIVE
-- Rocky Cuentas - Ejecutar en SQL Editor de Supabase
-- =====================================================

-- 1. Agregar columna instructive si no existe
ALTER TABLE products ADD COLUMN IF NOT EXISTS instructive TEXT;

-- 2. Actualizar productos existentes con instructivos por defecto
UPDATE products SET instructive = CASE id
    WHEN 'netflix' THEN '🎬 INSTRUCCIONES NETFLIX

1. La cuenta es COMPARTIDA (varios perfiles).
2. Solo se puede ver desde 1 dispositivo a la vez.
3. Si la cuenta se cae, comunicate de inmediato.
4. No cambiar el email ni contraseña.
5. Si se bloquea el dispositivo, se puede liberar.
6. Disfruta tu contenido favorito!

— Equipo Cuentas Rocky'
    
    WHEN 'spotify' THEN '🎵 INSTRUCCIONES SPOTIFY

1. Descarga la app de Spotify.
2. Inicia sesión con las credenciales.
3. Disfruta música sin anuncios.
4. Descarga canciones offline.

— Equipo Cuentas Rocky'
    
    WHEN 'primevideo' THEN '🎬 INSTRUCCIONES PRIME VIDEO

1. Ingresa a primevideo.com o app.
2. Usa las credenciales proporcionadas.
3. Disfruta películas y series.

— Equipo Cuentas Rocky'
    
    WHEN 'disneyplus' THEN '🏰 INSTRUCCIONES DISNEY+

1. Descarga app Disney+ o ingresa a web.
2. Inicia sesión con credenciales.
3. Disfruta Disney, Marvel, Star Wars.

— Equipo Cuentas Rocky'
    
    WHEN 'hbomax' THEN '📺 INSTRUCCIONES HBO MAX

1. Descarga app HBO Max o ingresa a web.
2. Inicia sesión con tus credenciales.
3. Disfruta contenido HBO, Warner.

— Equipo Cuentas Rocky'
    
    WHEN 'crunchyroll' THEN '🥟 INSTRUCCIONES CRUNCHYROLL

1. Descarga app Crunchyroll o ingresa web.
2. Inicia sesión con tus credenciales.
3. Disfruta anime subtitulado y doblado.

— Equipo Cuentas Rocky'
    
    WHEN 'youtube' THEN '▶️ INSTRUCCIONES YOUTUBE PREMIUM

1. Descarga app YouTube o ingresa web.
2. Inicia sesión con tus credenciales.
3. Disfruta sin anuncios y YouTube Music.

— Equipo Cuentas Rocky'
    
    WHEN 'deezer' THEN '🎧 INSTRUCCIONES DEEZER

1. Descarga app Deezer o ingresa web.
2. Inicia sesión con tus credenciales.
3. Disfruta música HiFi sin límites.

— Equipo Cuentas Rocky'
    
    WHEN 'chatgpt' THEN '🤖 INSTRUCCIONES CHATGPT PLUS

1. Ingresa a chat.openai.com
2. Inicia sesión con tus credenciales.
3. Disfruta GPT-4, plugins y más.

— Equipo Cuentas Rocky'
    
    WHEN 'gemini' THEN '✨ INSTRUCCIONES GEMINI PRO

1. Ingresa a gemini.google.com
2. Inicia sesión con tus credenciales.
3. Disfruta IA avanzada de Google.

— Equipo Cuentas Rocky'
    
    WHEN 'tntsports' THEN '⚽ INSTRUCCIONES TNT SPORTS

1. Descarga app TNT Sports o ingresa web.
2. Inicia sesión con tus credenciales.
3. Disfruta sports en vivo.

— Equipo Cuentas Rocky'
    
    ELSE instructive
END;

-- 3. Verificar productos con instructivos
SELECT id, name, LENGTH(instructive) as instructive_length FROM products;

-- 4. Mostrar instructivos completos
SELECT id, name, instructive FROM products WHERE instructive IS NOT NULL;
