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

// Productos predefinidos con logos
export const DEFAULT_PRODUCTS: Product[] = [
  { id: '1', name: 'Netflix', icon: 'tv', plans: ['Completo 4K', '2 Pantallas', '5 Perfiles'], color: '#E50914', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Logonetflix.png' },
  { id: '2', name: 'PrimeVideo', icon: 'play', plans: ['Completo', '2 Pantallas'], color: '#00A8E1', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/3840px-Amazon_Prime_Video_logo.svg.png' },
  { id: '3', name: 'Spotify Premium', icon: 'music', plans: ['Individual', 'Duo', 'Familiar (6)'], color: '#1DB954', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Spotify.png' },
  { id: '4', name: 'Deezer Premium', icon: 'headphones', plans: ['Free', 'Premium', 'HiFi'], color: '#FEAA2D', imageUrl: 'https://download.logo.wine/logo/Deezer/Deezer-Logo.wine.png' },
  { id: '5', name: 'MaxPlayer', icon: 'film', plans: ['Básico', 'Premium'], color: '#7B2CBF', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/MX_Player_Logo.png' },
  { id: '6', name: 'Disney+', icon: 'castle', plans: ['Estándar', 'Premium'], color: '#113CCF', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Disney_plus_icon.png' },
  { id: '7', name: 'Crunchyroll', icon: 'gamepad-2', plans: ['Free', 'Fan', 'Mega Fan'], color: '#F47521', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Crunchyroll_Logo.png' },
  { id: '8', name: 'HBO Max', icon: 'tv-2', plans: ['Estándar', 'Con TNT Sports'], color: '#B535F6', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/HBO_Max_%282025%29.svg/1280px-HBO_Max_%282025%29.svg.png' },
  { id: '9', name: 'TNT Sports Premium', icon: 'trophy', plans: ['Mensual', 'Anual'], color: '#E30613', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/TNT_Sports_2020_logo.svg/3840px-TNT_Sports_2020_logo.svg.png' },
  { id: '10', name: 'YouTube Premium', icon: 'youtube', plans: ['Individual', 'Familia'], color: '#FF0000', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/YouTube_Premium_logo.svg/1280px-YouTube_Premium_logo.svg.png' },
  { id: '11', name: 'ChatGPT Plus', icon: 'bot', plans: ['Mensual', 'Anual'], color: '#10A37F', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/960px-ChatGPT_logo.svg.png' },
  { id: '12', name: 'Gemini Pro', icon: 'gem', plans: ['Free', 'Pro'], color: '#4285F4', imageUrl: 'https://logos-world.net/wp-content/uploads/2025/02/Google-Gemini-Logo.png' },
  { id: '13', name: 'Paramount+', icon: 'play-circle', plans: ['Essential', 'Premium', '2 Pantallas'], color: '#0064FF', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Paramount%2B_logo.svg/1024px-Paramount%2B_logo.svg.png' },
];

// Productos que solo usan 2 pantallas (Cliente 1, Cliente 2) sin perfiles específicos
export const TWO_SCREEN_PRODUCTS = ['PrimeVideo', 'Crunchyroll', 'Paramount+'];

export const DEFAULT_SETTINGS: Settings = {
  alarmDays: [7, 3, 1],
  currency: 'USD',
  currencySymbol: '$',
  businessName: 'Rocky Cuentas',
  logoUrl: undefined,
};

// Instructivos predeterminados
export const DEFAULT_INSTRUCTIVES: Instructive[] = [
  {
    id: 'netflix',
    title: 'Netflix Garantía y Uso',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Logonetflix.png',
    content: `✅ GARANTÍA Y USO DE NETFLIX 🎬🔐

¡Gracias por tu compra! 🙌 A continuación, te explicamos todo lo que necesitas saber sobre el uso y garantía de tu cuenta:

─────────────────────────────────────────

👁️ OJO CON LA NUEVA FORMA PARA INGRESAR CON CONTRASEÑA DESDE PC Y CELULAR:

👉 Instrucciones aquí:
🔗 https://postimg.cc/NyqCkQdp

─────────────────────────────────────────

📌 USO CORRECTO DE LA CUENTA

La cuenta debe utilizarse solo en la cantidad de pantallas o dispositivos incluidos en el plan que compraste.

➡️ Ejemplo: Si adquiriste un plan de 1 pantalla y lo usás en tu TV, no podés instalarlo en otro dispositivo, aunque no estés usando el primero.

⚠️ IMPORTANTE:

Cambiar de dispositivo sin autorización puede provocar el bloqueo de la cuenta.

En caso de mal uso, la garantía se anula automáticamente y no hay derecho a reclamo.

👉 Si necesitas usar Netflix en más dispositivos, te recomendamos contratar un plan que se ajuste a tus necesidades.

─────────────────────────────────────────

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

─────────────────────────────────────────

⏳ SI CONTRATASTE UN PLAN MAYOR A 1 MES:

La primera cuenta tiene una duración de 30 días.

Al finalizar, nos avisas y te enviaremos una nueva cuenta para seguir usando el servicio.

🔁 Este proceso se repite mes a mes hasta completar el tiempo total contratado.

✅ Solo los planes de 4 pantallas permiten uso continuo sin cambio de cuenta.

─────────────────────────────────────────

💬 ¿Dudas o consultas?
Estamos siempre disponibles para ayudarte 💙

🔒 ¡Gracias por confiar en nosotros!
— Equipo Cuentas Rocky`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'chatgpt',
    title: 'ChatGPT Plus',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/960px-ChatGPT_logo.svg.png',
    content: `🤖 INSTRUCTIVO CHATGPT PLUS

1. Ingresa a: chat.openai.com
2. Haz clic en "Log In" (Iniciar sesión)
3. Ingresa el correo electrónico proporcionado
4. Ingresa la contraseña (o usa el correo del cliente)
5. ¡Accede a GPT-4 y funciones avanzadas!

✨ CARACTERÍSTICAS:
- Acceso a GPT-4 (más inteligente)
- DALL-E para generar imágenes
- Análisis de datos y archivos
- Plugins y GPTs personalizados
- Respuestas más rápidas

⚠️ IMPORTANTE:
- No cambies la contraseña
- No recuperes el acceso desde otro dispositivo
- Si pierdes acceso, contactar al vendedor
- Para activar, usa el correo del cliente`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gemini',
    title: 'Gemini Pro',
    imageUrl: 'https://logos-world.net/wp-content/uploads/2025/02/Google-Gemini-Logo.png',
    content: `💎 INSTRUCTIVO GEMINI PRO

1. Ingresa a: gemini.google.com
2. Inicia sesión con la cuenta proporcionada
3. Usa el correo electrónico indicado
4. ¡Accede a Gemini Advanced!

✨ CARACTERÍSTICAS:
- Acceso a Gemini Ultra 1.0
- IA más avanzada de Google
- Integración con Google apps
- 2TB de almacenamiento en Google One
- Gemini en WhatsApp

⚠️ IMPORTANTE:
- No cambies los datos de la cuenta
- No recuperes la cuenta desde otro dispositivo
- Si tienes problemas, contacta a tu proveedor`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'maxplayer',
    title: 'MaxPlayer',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/MX_Player_Logo.png',
    content: `🎬 INSTRUCTIVO MAXPLAYER

1. Descarga MaxPlayer o ingresa a la app
2. Inicia sesión con tu cuenta
3. Usa el correo proporcionado
4. Usa la contraseña proporcionada
5. ¡Disfruta de películas y series!

✨ CARACTERÍSTICAS:
- Contenido variado de películas
- Series populares
- Descarga para ver offline

⚠️ IMPORTANTE:
- No cambies los datos de la cuenta
- Si tienes problemas, contacta a tu proveedor`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
// 1 mes = 30 días (de 1 de abril a 30 de abril)
export const calculateExpiryDate = (saleDate: string, duration: number): string => {
  const date = new Date(saleDate);
  // duration viene en meses pero cada mes = 30 días
  const totalDays = duration * 30;
  date.setDate(date.getDate() + totalDays);
  return date.toISOString().split('T')[0];
};

// Helper para convertir meses a texto
export const getDurationText = (months: number): string => {
  if (months === 1) return '30 días';
  return `${months} meses`;
};

// Helper para formatear fecha
export const formatDate = (dateString: string): string => {
  if (!dateString || dateString.trim() === '') return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Helper para generar ID único
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
