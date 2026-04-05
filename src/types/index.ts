// Tipos principales del sistema Rocky Cuentas

export type AccountStatus = 'active' | 'expiring' | 'critical' | 'expired';

// Estado de venta: disponible = no vendida, vendida = todos los perfiles vendidos, fallen = cuenta caída
export type SaleStatus = 'available' | 'sold' | 'fallen';

export type PlanType =
  | 'Completo 4K' | '2 Pantallas' | '5 Perfiles'
  | 'Completo' | 'Solo Películas' | 'Solo Series'
  | 'Individual' | 'Duo' | 'Familiar (6)'
  | 'Free' | 'Premium' | 'HiFi' | 'Fan' | 'Mega Fan'
  | 'Estándar' | 'Premium Tier'
  | 'Con TNT Sports' | 'Mensual' | 'Anual'
  | 'Básico' | 'Otro';

export interface Client {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export interface Profile {
  slot: number;
  clientId?: string; // Cliente asignado a este perfil
  clientName: string;
  pin?: string; // PIN de acceso del perfil (para Netflix, etc.)
  sold?: boolean; // Indica si el perfil ha sido vendido
}

export interface Account {
  id: string;
  email: string;
  password: string;
  productType: string;
  plan: string;
  clientName: string;
  clientContact?: string;
  saleDate: string;
  duration: number;
  expiryDate: string;
  provider: string;
  providerRenewalDate: string;
  saleStatus: SaleStatus; // 'available' = disponible, 'sold' = vendida
  notes?: string;
  profiles?: Profile[];
  user?: string; // Campo usuario para Bleezed Player
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  icon: string;
  plans: string[];
  color: string;
  imageUrl?: string;
  instructive?: string; // Plantilla de instructivo para este producto
}

export interface Provider {
  id: string;
  name: string;
  productType: string; // Netflix, Spotify, etc.
  contact?: string;
  email?: string;
  telegramUsername?: string; // Usuario de Telegram del proveedor
  notes?: string;
}

// Tipos de usuario y autenticación
export type UserRole = 'admin' | 'collaborator';

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  password: string;
  createdAt?: string;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
}

export const DEFAULT_ADMIN_USER: User = {
  id: 'admin',
  name: 'admin',
  email: 'admin@localhost',
  role: 'admin',
  password: 'admin123',
};

export interface Settings {
  alarmDays: number[];
  currency: string;
  currencySymbol: string;
  businessName: string;
  logoUrl?: string; // URL del logo personalizado del sistema
}

// Interface para Instructivos
export interface Instructive {
  id: string;
  title: string; // Nombre del servicio (ej: "ChatGPT")
  imageUrl?: string; // URL o base64 de la imagen/portada
  content: string; // Contenido/instructivo completo
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  accounts: Account[];
  products: Product[];
  providers: Provider[];
  clients: Client[];
  settings: Settings;
  activityLog: ActivityLogEntry[];
  instructives: Instructive[];
}

// Tipos de actividad para el historial
export type ActivityType =
  | 'account_created'
  | 'account_updated'
  | 'account_deleted'
  | 'account_sold'
  | 'account_available'
  | 'account_fallen'
  | 'profile_assigned'
  | 'client_created'
  | 'client_updated'
  | 'client_deleted'
  | 'provider_created'
  | 'provider_updated'
  | 'provider_deleted'
  | 'product_created'
  | 'product_updated'
  | 'product_deleted'
  | 'user_login'
  | 'user_logout'
  | 'settings_updated'
  | 'backup_created'
  | 'instructive_created'
  | 'instructive_updated'
  | 'instructive_deleted'
  | 'instructive_copied';

export interface ActivityLogEntry {
  id: string;
  type: ActivityType;
  description: string;
  details?: string;
  accountId?: string; // ID de la cuenta afectada (si aplica)
  accountEmail?: string; // Email de la cuenta afectada (si aplica)
  userId?: string;
  userName?: string;
  timestamp: string;
}

export interface ImportRow {
  email: string;
  password: string;
  productType: string;
  plan: string;
  clientName: string;
  clientContact?: string;
  saleDate: string;
  duration: string;
  provider: string;
  providerRenewalDate: string;
  notes?: string;
  _rowIndex?: number;
  _error?: string;
  _valid?: boolean;
}

// Productos predefinidos con logos e instructivos
export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'catalogo',
    name: 'Catalogo',
    icon: 'book-open',
    plans: ['Ver Catalogo'],
    color: '#6363F1',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Visual_Studio_Code_1.35_icon.svg/1200px-Visual_Studio_Code_1.35_icon.svg.png',
    instructive: `Hola 👋 ¡Bienvenido/a!
Gracias por contactarnos.
Te compartimos nuestro catálogo para que puedas revisar nuestros servicios y valores:
👉 https://rockycuentas.rdi.store

Quedamos atentos para ayudarte y resolver cualquier consulta. 😊`,
  },
  {
    id: '1',
    name: 'Netflix',
    icon: 'tv',
    plans: ['Completo 4K', '2 Pantallas', '5 Perfiles', '4 meses'],
    color: '#E50914',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Logonetflix.png',
    instructive: `✅ GARANTÍA Y USO DE NETFLIX 🎬🔐

¡Gracias por tu compra! 🙌 A continuación, te explicamos todo lo que necesitas saber sobre el uso y garantía de tu cuenta:

OJO CON LA NUEVA FORMA PARA INGRESAR CON CONTRASEÑA DESDE PC Y CELULAR:
👉 Instrucciones aquí:
🔗 https://postimg.cc/NyqCkQdp

📌 USO CORRECTO DE LA CUENTA
La cuenta debe utilizarse solo en la cantidad de pantallas o dispositivos incluidos en el plan que compraste.

➡️ Ejemplo: Si adquiriste un plan de 1 pantalla y lo usás en tu TV, no podés instalarlo en otro dispositivo, aunque no estés usando el primero.

⚠️ IMPORTANTE:
Cambiar de dispositivo sin autorización puede provocar el bloqueo de la cuenta.
En caso de mal uso, la garantía se anula automáticamente y no hay derecho a reclamo.

👉 Si necesitas usar Netflix en más dispositivos, te recomendamos contratar un plan que se ajuste a tus necesidades.

📣 MENSAJE QUE PUEDE APARECER A LOS 20 DÍAS
A partir del día 20 de uso, puede aparecer el siguiente mensaje:

🛑 "Tu cuenta no es parte de Grupo Hogar"

🔄 ¡No te preocupes! Es completamente normal.
Dependiendo del dispositivo que estés usando, seguí las siguientes instrucciones:

📺 EN SMART TV:
👉 Instrucciones aquí:
🔗 https://postimg.cc/jW5XjCc5

📱 EN DISPOSITIVOS MÓVILES:
👉 Instrucciones aquí:
🔗 https://postimg.cc/Jyrs2mNW
Presioná "Ver temporalmente", luego enviá un mail solicitando el código.

📩 Una vez que completes los pasos, escríbenos para enviarte el código de hogar.

⏳ SI CONTRATASTE UN PLAN MAYOR A 1 MES:
La primera cuenta tiene una duración de 30 días.
Al finalizar, nos avisas y te enviaremos una nueva cuenta para seguir usando el servicio.

🔁 Este proceso se repite mes a mes hasta completar el tiempo total contratado.

✅ Solo los planes de 4 pantallas permiten uso continuo sin cambio de cuenta.

💬 ¿Dudas o consultas?
Estamos siempre disponibles para ayudarte 💙

🔒 ¡Gracias por confiar en nosotros!
— Equipo Cuentas Rocky`,
  },
  {
    id: '2',
    name: 'PrimeVideo',
    icon: 'play',
    plans: ['Mensual', '3 meses', '6 meses', '12 meses'],
    color: '#00A8E1',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/3840px-Amazon_Prime_Video_logo.svg.png',
  },
  {
    id: '3',
    name: 'Spotify Premium',
    icon: 'music',
    plans: ['Mensual', '3 meses', '6 meses', '12 meses'],
    color: '#1DB954',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Spotify.png',
  },
  {
    id: '4',
    name: 'Deezer Premium',
    icon: 'headphones',
    plans: ['Mensual', '3 meses', '6 meses', '12 meses'],
    color: '#FEAA2D',
    imageUrl: 'https://download.logo.wine/logo/Deezer/Deezer-Logo.wine.png',
  },
  {
    id: '5',
    name: 'MaxPlayer',
    icon: 'film',
    plans: ['Mensual', '3 meses', '6 meses', '12 meses'],
    color: '#7B2CBF',
    imageUrl: '/images/maxplayer-logo.png',
    instructive: `📺 INSTRUCTIVO DE USO – MAX PLAYER 🎬

¡Hola! 😃 Te dejamos los pasos para ingresar correctamente y disfrutar tu servicio de televisión con Max Player 👇

1️⃣ Ingreso a la cuenta:

👉 Abre la aplicación Max Player.

👉 Ingresa tu usuario y contraseña exactamente tal como fueron entregados, respetando mayúsculas, minúsculas y números.

2️⃣ Configuración inicial:

🌎 Al ingresar por primera vez, te pedirá elegir el idioma → selecciona Español.

👤 Luego te pedirá crear un perfil → puedes poner el nombre que desees.

⚠️ Importante: Cada dispositivo debe tener su propio perfil. No se puede usar el mismo perfil en otro dispositivo.

3️⃣ Navegación dentro de la app:

📂 Una vez dentro del perfil, verás una franja amarilla al costado izquierdo, ese es el menú principal.

Ahí encontrarás las secciones:

📺 Canales de TV
🎞️ Películas
🍿 Series

4️⃣ Cómo cambiar de categoría:

🎮 Al entrar en el menú de Canales, mantén presionado el botón OK o Enter en tu control remoto por algunos segundos, hasta que aparezca el menú circular.

🔘 En ese menú verás las categorías disponibles.

Elige la categoría que quieras ver (por ejemplo 🇨🇱 Chile) y selecciona el canal que desees disfrutar.

✨ El mismo procedimiento sirve para navegar en Películas y Series.

5️⃣ Soporte:

💬 Si tienes cualquier duda o problema, envíanos un mensaje. ¡Con gusto te ayudaremos!`,
  },
  {
    id: '6',
    name: 'Disney+',
    icon: 'castle',
    plans: ['Mensual', '3 meses', '6 meses', '12 meses'],
    color: '#113CCF',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Disney_plus_icon.png',
  },
  {
    id: '7',
    name: 'Crunchyroll',
    icon: 'gamepad-2',
    plans: ['Mensual', '3 meses', '6 meses', '12 meses'],
    color: '#F47521',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Crunchyroll_Logo.png',
  },
  {
    id: '8',
    name: 'HBO Max',
    icon: 'tv-2',
    plans: ['Mensual', '3 meses', '6 meses', '12 meses'],
    color: '#B535F6',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/HBO_Max_%282025%29.svg/1280px-HBO_Max_%282025%29.svg.png',
  },
  {
    id: '9',
    name: 'TNT Sports Premium',
    icon: 'trophy',
    plans: ['Mensual', '3 meses', '6 meses', '12 meses'],
    color: '#E30613',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/TNT_Sports_2020_logo.svg/3840px-TNT_Sports_2020_logo.svg.png',
  },
  {
    id: '10',
    name: 'YouTube Premium',
    icon: 'youtube',
    plans: ['Mensual', '3 meses', '6 meses', '12 meses'],
    color: '#FF0000',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/YouTube_Premium_logo.svg/1280px-YouTube_Premium_logo.svg.png',
  },
  {
    id: '11',
    name: 'ChatGPT Plus',
    icon: 'bot',
    plans: ['Mensual', '3 meses', '6 meses', '12 meses'],
    color: '#10A37F',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/960px-ChatGPT_logo.svg.png',
  },
  {
    id: '12',
    name: 'Gemini Pro',
    icon: 'gem',
    plans: ['Mensual', '3 meses', '6 meses', '12 meses'],
    color: '#4285F4',
    imageUrl: 'https://logos-world.net/wp-content/uploads/2025/02/Google-Gemini-Logo.png',
  },
  {
    id: '13',
    name: 'Paramount+',
    icon: 'play-circle',
    plans: ['Mensual', '3 meses', '6 meses', '12 meses'],
    color: '#0064FF',
    imageUrl: '/images/paramount-logo.png',
  },
  {
    id: '14',
    name: 'Netflix Extra',
    icon: 'tv',
    plans: ['Mensual', '3 meses', '4 meses', '6 meses', '12 meses'],
    color: '#E50914',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Logonetflix.png',
    instructive: `🔹📺✨ NETFLIX EXTRA - 1 PIN

✅ A continuación, te compartimos un video explicativo para aprender a cerrar sesión en Netflix con PIN de seguridad 🔐🙌:

🔗 https://www.youtube.com/watch?v=l5FGGCbZLbw

📌 CARACTERÍSTICAS:
• 1 solo perfil con PIN de seguridad
• Ideal para uso individual
• Plan flexible: Mensual, 3, 6 o 12 meses

💡 ¡Una guía práctica para gestionar tu cuenta de forma rápida y segura!`,
  },
  {
    id: '15',
    name: 'Disney Enlazar TV',
    icon: 'castle',
    plans: ['Enlazar TV'],
    color: '#113CCF',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Disney_plus_icon.png',
    instructive: `🔹📺✨ ENLAZAR TV A DISNEY+

✅ A continuación, te compartimos un video explicativo súper útil para aprender cómo vincular tu TV a tu cuenta de Disney+ de forma rápida y sencilla 📱:

🔗 https://www.youtube.com/watch?v=87Ilv5vjBl8

🚀 ¡Sigue el paso a paso y disfruta tu contenido favorito sin complicaciones!`,
  },
  {
    id: '16',
    name: 'PrimeVideo Enlazar TV',
    icon: 'play',
    plans: ['Enlazar TV'],
    color: '#00A8E1',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/3840px-Amazon_Prime_Video_logo.svg.png',
    instructive: `🔹📺✨ ENLAZAR TV A PRIME VIDEO

✅ A continuación, te compartimos un video explicativo súper útil para aprender cómo vincular tu TV a tu cuenta de Prime Video de forma rápida y sencilla 📱:

🔗 https://www.youtube.com/watch?v=f-0cZHZ0KIk

🚀 ¡Sigue el paso a paso y comienza a disfrutar tus series y películas favoritas sin complicaciones!`,
  },
  {
    id: '17',
    name: 'ChatGPT Cuenta Equipo',
    icon: 'bot',
    plans: ['Cuenta de Equipo'],
    color: '#10A37F',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/960px-ChatGPT_logo.svg.png',
    instructive: `📘 INSTRUCTIVO PARA ACTIVAR CHATGPT (CUENTA DE EQUIPO)

1️⃣ Inicie sesión en ChatGPT

Abra su cuenta de ChatGPT, ya sea desde la aplicación o desde la página web.

2️⃣ Revise su correo electrónico 📧

Busque el correo de invitación para unirse al equipo de trabajo.

3️⃣ Acepte la invitación ✅

Haga clic en "Aceptar invitación" para unirse al equipo.

4️⃣ Redirección automática 🔄

Después de aceptar la invitación, será redirigido automáticamente a ChatGPT.

5️⃣ Seleccione la cuenta 👤

El sistema le pedirá elegir con qué cuenta desea trabajar:

Cuenta personal
Cuenta del equipo de trabajo

➡️ Seleccione la cuenta del equipo de trabajo.

6️⃣ Activación completada 🎉

Una vez seleccionada la cuenta de trabajo, su ChatGPT Plus quedará activado.

⚠️ Importante:

Si adquiere un plan por más de 3 meses, las cuentas pueden cambiar mes a mes.

Por ello, se recomienda respaldar o guardar sus proyectos regularmente 💾 para evitar pérdida de información.

✔️ ¡Listo! Su cuenta ya estará configurada y lista para usar.`,
  },
  {
    id: '18',
    name: 'HBO Max Enlazar TV',
    icon: 'tv-2',
    plans: ['Enlazar TV'],
    color: '#B535F6',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/HBO_Max_%282025%29.svg/1280px-HBO_Max_%282025%29.svg.png',
    instructive: `🔹📺✨ ENLAZAR TV A HBO MAX

✅ A continuación, te compartimos un video explicativo súper útil para aprender cómo vincular tu TV a tu cuenta de HBO Max de forma rápida y sencilla 🔗📱:

🔗 https://www.youtube.com/watch?v=b9jFlvDaULQ

🚀 ¡Sigue el paso a paso y disfruta de todo tu contenido favorito sin complicaciones!`,
  },
  {
    id: '19',
    name: 'Paramount+ Enlazar TV',
    icon: 'play-circle',
    plans: ['Enlazar TV'],
    color: '#0064FF',
    imageUrl: '/images/paramount-logo.png',
    instructive: `🔹📺✨ ENLAZAR TV A PARAMOUNT+

✅ A continuación, te compartimos una guía práctica para aprender cómo vincular tu TV a tu cuenta de Paramount+ de forma rápida y sencilla 🔗📱:

🔗 https://rocky-cuentas.vercel.app

🚀 ¡Sigue el paso a paso y comienza a disfrutar tu contenido favorito sin complicaciones!`,
  },
  {
    id: '20',
    name: 'Canva Pro',
    icon: 'palette',
    plans: ['Mensual', '3 meses', '6 meses', '12 meses'],
    color: '#7D2AE8',
    imageUrl: '/images/canva-pro-logo.jpeg',
  },
  {
    id: '21',
    name: 'Blessed Player',
    icon: 'film',
    plans: ['Mensual', '3 meses', '6 meses', '12 meses'],
    color: '#FF6B35',
    imageUrl: '/images/blessed-player-logo.png',
  },
  {
    id: '22',
    name: 'VtrPlay',
    icon: 'tv',
    plans: ['Mensual', '3 meses', '6 meses', '12 meses'],
    color: '#E30613',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/TNT_Sports_2020_logo.svg/3840px-TNT_Sports_2020_logo.svg.png',
  },
  {
    id: '23',
    name: 'Vix Premium',
    icon: 'play-circle',
    plans: ['Mensual', '3 meses', '6 meses', '12 meses'],
    color: '#E50914',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/ViX_Logo.svg/1280px-ViX_Logo.svg.png',
  },
];

// Productos que solo usan 2 pantallas (Cliente 1, Cliente 2) sin perfiles específicos
export const TWO_SCREEN_PRODUCTS = ['PrimeVideo', 'Crunchyroll', 'Paramount+'];

// Productos que usan 1 solo perfil con PIN (ej: Netflix Extra)
export const SINGLE_PROFILE_PRODUCTS = ['Netflix Extra'];

export const DEFAULT_SETTINGS: Settings = {
  alarmDays: [7, 3, 1],
  currency: 'USD',
  currencySymbol: '$',
  businessName: 'Rocky Cuentas',
  logoUrl: undefined,
};

// Instructivos predeterminados - VACÍO, se agregan desde la UI
export const DEFAULT_INSTRUCTIVES: Instructive[] = [];

// Helper para calcular estado de la cuenta
export const getAccountStatus = (expiryDate: string, alarmDays: number[]): AccountStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= Math.min(...alarmDays)) return 'critical';
  if (diffDays <= 15) return 'expiring';
  return 'active';
};

// Helper para obtener la cantidad de perfiles de un plan
export const getProfilesCount = (plan: string): number => {
  // Detectar número en el nombre del plan (ej: "5 Perfiles", "Familiar (6)", "2 Pantallas")
  const match = plan.match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 0;
};

// Helper para calcular días restantes
export const getDaysRemaining = (expiryDate: string): number => {
  if (!expiryDate || expiryDate.trim() === '') return -999; // Valor especial para fechas no definidas
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  if (isNaN(expiry.getTime())) return -999;
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Helper para calcular fecha de vencimiento
// Mantiene el mismo día del mes (4 de febrero + 1 año = 4 de febrero del próximo año)
// Si el día no existe en el mes destino (ej: 31 enero → febrero), ajusta al último día válido
export const calculateExpiryDate = (saleDate: string, duration: number): string => {
  if (!saleDate || saleDate.trim() === '') return '';
  // Extraer solo la parte de fecha si tiene formato completo
  const dateStr = saleDate.includes('T') ? saleDate.split('T')[0] : saleDate;
  const date = new Date(dateStr + 'T12:00:00');
  if (isNaN(date.getTime())) return '';
  const originalDay = date.getDate();

  // Sumar meses
  let newMonth = date.getMonth() + duration;
  let newYear = date.getFullYear() + Math.floor(newMonth / 12);
  newMonth = newMonth % 12;

  // Crear la nueva fecha con el día original
  const newDate = new Date(newYear, newMonth, originalDay);

  // Si el día se ajustó automáticamente (ej: 31 enero → 28 feb), mantener consistencia
  // Verificar que no se haya pasado al siguiente mes
  if (newDate.getMonth() !== newMonth) {
    // Ajustar al último día del mes destino
    newDate.setDate(0);
  }

  return newDate.toISOString().split('T')[0];
};

// Helper para convertir meses a texto
export const getDurationText = (months: number): string => {
  if (months === 1) return '1 mes';
  return `${months} meses`;
};

// Helper para formatear fecha - evita problemas de timezone
// Formato: 01-Jul-2026
export const formatDate = (dateString: string): string => {
  if (!dateString || dateString.trim() === '') return 'N/A';

  // Intentar extraer solo la parte de fecha (YYYY-MM-DD)
  let datePart = dateString;
  if (dateString.includes('T')) {
    datePart = dateString.split('T')[0];
  }

  // Verificar que la parte de fecha sea válida
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return 'N/A';

  // Agregar hora del mediodía para evitar problemas de timezone (UTC offset)
  const dateStr = datePart + 'T12:00:00';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';

  // Formato: 01 Jul 2026
  const day = date.getDate().toString().padStart(2, '0');
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

// Helper para generar ID único
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Helper para formatear fecha para inputs tipo date (YYYY-MM-DD)
// Extrae la parte de fecha de un string que puede tener formato YYYY-MM-DD o YYYY-MM-DDTHH:MM:SS
export const formatDateForInput = (dateString: string): string => {
  if (!dateString || dateString.trim() === '') return '';
  // Si ya tiene el formato YYYY-MM-DD, devolverlo directamente
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
  // Si tiene formato completo, extraer solo la parte de fecha
  if (dateString.includes('T')) {
    return dateString.split('T')[0];
  }
  // Si no coincide con ningún patrón, intentar parsear
  const date = new Date(dateString + 'T12:00:00');
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

// Helper para verificar si un producto usa "Clientes" en vez de "Perfiles"
export const usesClientsInsteadOfProfiles = (productName: string): boolean => {
  return TWO_SCREEN_PRODUCTS.includes(productName);
};

// Helper para obtener las etiquetas de los slots
export const getSlotLabel = (plan: string, slot: number, productName?: string): string => {
  const planLower = plan.toLowerCase();
  // Si es un producto de 2 pantallas (PrimeVideo, Crunchyroll, Paramount+), usar "Cliente"
  if (productName && TWO_SCREEN_PRODUCTS.includes(productName)) {
    return `Cliente ${slot}`;
  }
  if (planLower.includes('pantalla')) {
    return `Pantalla ${slot}`;
  }
  if (planLower.includes('perfil')) {
    return `Perfil ${slot}`;
  }
  return `Slot ${slot}`;
};

// Helper para verificar si todos los perfiles están vendidos
export const areAllProfilesSold = (profiles?: Profile[]): boolean => {
  if (!profiles || profiles.length === 0) return false;
  return profiles.every(p => p.clientName.trim() !== '');
};

// Helper para verificar si todos los perfiles están vendidos (campo sold)
export const areAllProfilesMarkedSold = (profiles?: Profile[]): boolean => {
  if (!profiles || profiles.length === 0) return false;
  return profiles.every(p => p.sold === true);
};

// Helper para contar perfiles vendidos (usando campo sold)
export const countSoldProfiles = (profiles?: Profile[]): number => {
  if (!profiles) return 0;
  return profiles.filter(p => p.sold === true).length;
};
