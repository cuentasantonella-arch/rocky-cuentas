# 🚀 Rocky Cuentas - Instalación en Windows

## Opción 1: Instalar como Programa (.exe)

### Paso 1: Descargar la aplicación
Descarga el archivo `Rocky-Cuentas-Portable-1.0.0.exe` de la carpeta `release/`

### Paso 2: Ejecutar
1. Haz doble clic en el archivo `.exe`
2. La aplicación se abrirá automáticamente
3. ¡Listo! Ya puedes usarlo

### Paso 3: Compartir en red local
Para que otros usuarios en tu casa accedan:
1. Nota la dirección IP que aparece al iniciar (ej: `http://192.168.1.100:3000`)
2. Otros usuarios en la misma red pueden abrir esa dirección en su navegador

---

## Opción 2: Crear el .exe tú mismo

### Requisitos
- Node.js 18+ instalado: https://nodejs.org/

### Pasos

1. **Abre Terminal (CMD o PowerShell)**

2. **Navega a la carpeta del proyecto**
   ```bash
   cd ruta/a/streaming-account-manager
   ```

3. **Instala dependencias**
   ```bash
   npm install
   ```

4. **Instala Electron**
   ```bash
   npm install electron electron-builder --save-dev
   ```

5. **Crea el ejecutable**
   ```bash
   npm run electron:build
   ```

6. **Encuentra el archivo**
   - Ve a la carpeta `release/`
   - Ahí estarán los archivos `.exe`

---

## Opción 3: Ejecutar sin instalar

1. **Instala Node.js** (https://nodejs.org/)

2. **Abre Terminal y ejecuta:**
   ```bash
   cd ruta/a/streaming-account-manager
   npm install
   npm run electron:dev
   ```

---

## 🌐 Compartir en Red Local

Cuando ejecutes la aplicación, verás en la terminal:
```
🚀 Rocky Cuentas ejecutándose en http://localhost:3000
📡 Otros equipos pueden acceder desde: http://192.168.1.XX:3000
```

Para saber tu IP:
- Windows: `ipconfig` → busca "Dirección IPv4"

**Desde otra PC en la misma red:**
Abre el navegador y escribe: `http://[TU-IP]:3000`

---

## 📁 Estructura de Archivos

```
streaming-account-manager/
├── dist/                    # Archivos compilados (subir estos)
│   ├── index.html
│   └── assets/
├── electron/                # Configuración de Electron
│   └── main.js
├── release/                  # Aquí aparece el .exe
│   └── Rocky-Cuentas-Portable-1.0.0.exe
└── INSTALACION-WINDOWS.md   # Este archivo
```

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo instalar en varias PC?**
R: Sí, cada instalación es independiente.

**P: ¿Los datos se comparten entre PC?**
R: No, los datos se guardan localmente en cada PC (localStorage).

**P: ¿Necesito internet?**
R: No, funciona offline en tu red local.

**P: ¿Cómo hacer backup de los datos?**
R: Ve a "Importar/Exportar" → "Descargar Backup"

---

## 🔧 Solución de Problemas

**Error: "npm no se reconoce"**
→ Instala Node.js desde https://nodejs.org/

**Error: "electron-builder no encontrado"**
```bash
npm install electron-builder --save-dev
```

**La app no abre:**
1. Verifica que tienes Node.js 18+
2. Ejecuta: `npm run build`
3. Luego: `npm run electron:dev`
