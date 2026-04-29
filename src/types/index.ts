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
  supportUrl?: string; // URL de la página de soporte del proveedor
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

// Interface para Notas importantes
export interface Note {
  id: string;
  title: string;
  content: string;
  color: string; // Color de fondo de la nota
  isPinned: boolean; // Si está fija en la parte superior
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
  notes: Note[];
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
  | 'instructive_copied'
  | 'note_created'
  | 'note_updated'
  | 'note_deleted';

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
    instructive: `🛑 LEER ANTES DE INSTALAR: AQUÍ ESTÁ TU GARANTÍA Y USO DE TU CUENTA NETFLIX 🎬🔐

¡Gracias por tu confianza! 🙌 Para asegurar la estabilidad de tu servicio, sigue estas pautas:

🔐 ACCESO Y CONFIGURACIÓN

Ingreso Seguro: 💻📱 Si usas PC o Celular, revisa cómo ingresar pinchando este link: https://postimg.cc/NyqCkQdp 👈

Hogar Netflix: 🏠 Si a los 20 días aparece el mensaje "Tu cuenta no es parte de Grupo Hogar", sigue estos pasos según tu equipo:

Smart TV: 📺 Mira cómo solucionarlo pinchando este link: https://postimg.cc/jW5XjCc5 👈

Dispositivos Móviles: 📱 Mira cómo solucionarlo pinchando este link: https://postimg.cc/Jyrs2mNW 👈
(Selecciona "Ver temporalmente" y pide tu código por mail o chat).

📌 REGLAS DE USO (EVITA BLOQUEOS)

Límite de Pantallas: 🚫 Usa la cuenta solo en la cantidad de dispositivos contratados.

Dispositivo Fijo: 📺 Si compraste 1 pantalla para tu TV, no debes abrirla en otros equipos.

Garantía: ⚠️ El mal uso o cambio de dispositivo sin previo aviso anula la garantía automáticamente.

⏳ PLANES MAYORES A UN MES

Renovación Mensual: 🔄 Recibirás una cuenta nueva cada 30 días (excepto en planes de 4 pantallas, que son de uso continuo).

Aviso de cambio: 📩 Al finalizar tu mes, escríbenos para entregarte tus nuevas credenciales y seguir disfrutando del servicio.

💬 ¿Necesitas ayuda? Estamos conectados para asistirte. 💙
Atentamente: Equipo Rocky Cuentas`,
  },
  {
    id: '14',
    name: 'Cerrar Netflix con Pines',
    icon: 'tv',
    plans: ['Mensual', '3 meses', '4 meses', '6 meses', '12 meses'],
    color: '#0066CC',
    imageUrl: '/images/netflix-extra-icon.png',
    instructive: `📺✨ INSTRUCTIVO CERRAR CUENTA CON PINES

✅ A continuación, te compartimos un video explicativo para aprender a cerrar sesión en Netflix con PIN de seguridad 🔐🙌:

🔗 https://www.youtube.com/watch?v=l5FGGCbZLbw`,
  },
  {
    id: 'netflix-extras',
    name: 'Netflix Extras',
    icon: 'tv',
    plans: ['Mensual', '3 meses', '4 meses', '6 meses', '12 meses'],
    color: '#0066CC',
    imageUrl: '/images/netflix-extra-icon.png',
    instructive: `📺✨ NETFLIX EXTRAS - PERFILES ADICIONALES

✅ Video explicativo para agregar perfiles en Netflix:

🔗 https://www.youtube.com/watch?v=l5FGGCbZLbw

📌 CARACTERÍSTICAS:
• Perfiles adicionales para tu cuenta Netflix
• Ideal para hogares con múltiples usuarios
• Plan flexible: Mensual, 3, 6 o 12 meses

💡 ¡Agrega hasta 5 perfiles adicionales a tu cuenta principal!`,
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
    id: '6a',
    name: 'Disney Standar',
    icon: 'castle',
    plans: ['Mensual', '3 meses', '6 meses', '12 meses'],
    color: '#113CCF',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Disney_plus_icon.png',
  },
  {
    id: '6b',
    name: 'Disney Premium',
    icon: 'castle',
    plans: ['Mensual', '3 meses', '6 meses', '12 meses'],
    color: '#1E90FF',
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
    id: '8a',
    name: 'HBO Max Standar',
    icon: 'tv-2',
    plans: ['Mensual', '3 meses', '6 meses', '12 meses'],
    color: '#B535F6',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/HBO_Max_%282025%29.svg/1280px-HBO_Max_%282025%29.svg.png',
  },
  {
    id: '8b',
    name: 'HBO Max Con TNT',
    icon: 'tv-2',
    plans: ['Mensual', '3 meses', '6 meses', '12 meses'],
    color: '#FF6B35',
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
    plans: ['Mensual', '3 meses', '4 meses', '6 meses', '12 meses'],
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
    instructive: `🚀✨ Instructivo de Activación – Gemini Pro ✨🚀

📩 Revisa tu correo
Dirígete a tu bandeja de entrada de Gmail con el correo que proporcionaste (o el del cliente).
👨‍👩‍👧‍👦 Acepta la invitación
Busca el correo de invitación al grupo familiar y haz clic en "Aceptar invitación" ✅
🌐 Ingresa a Gemini Pro
Accede al siguiente enlace:
👉 https://gemini.google.com
🔐 Verifica tu cuenta
Asegúrate de iniciar sesión con la MISMA cuenta de Gmail 📧 que usaste para aceptar la invitación.
⚠️ ¡Muy importante! Debe ser exactamente la misma cuenta para que funcione correctamente.
🎉 Confirma que está activado
Una vez dentro, revisa la parte superior (donde aparece tu foto o inicial de perfil 👤).
✔️ Si está bien activado, verás un indicador/círculo o distintivo de Gemini Pro ✨
🚀 ¡Listo!
Si ves ese indicador, significa que Gemini Pro ya está activo y funcionando correctamente 🎉🔥`,
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
    instructive: `✨ Instructivo para Activación de Canva Pro ✨

📩 Revisar su correo electrónico
Diríjase a la bandeja de entrada del correo que nos proporcionó. Allí recibirá una invitación de Canva Pro.

✅ Aceptar la invitación
Abra el correo y haga clic en el enlace que indica que "Rocky Cuentas la ha invitado a trabajar en su equipo de Canva". Luego seleccione Aceptar invitación.

🔐 Iniciar sesión en Canva
Al aceptar la invitación, será redirigido automáticamente a la plataforma. Inicie sesión con su cuenta si se lo solicita.

👥 Seleccionar el equipo correcto
Canva le pedirá elegir dónde desea trabajar:

Cuenta personal

Equipo Rocky Cuentas

👉 Debe seleccionar Equipo Rocky Cuentas.

🚀 Acceso a Canva Pro
Una vez dentro del equipo, ya tendrá acceso completo a todas las herramientas de Canva Pro.

🔄 Opcional: Transferir diseños desde su cuenta personal

Si desea mover diseños existentes:

Ingrese a su cuenta personal.

Abra el diseño que desea trasladar.

Haga clic en 📤 Compartir y copie el enlace.

Luego acceda al equipo Rocky Cuentas.

Pegue y abra ese enlace para trabajar el diseño dentro del equipo.

💬 Soporte
Ante cualquier duda o consulta, no dude en contactarnos. ¡Estamos para ayudarle! 😊`,
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
  {
    id: 'capcut',
    name: 'Capcut',
    icon: 'film',
    plans: ['Cuenta Europea'],
    color: '#00f2ea',
    imageUrl: '',
    instructive: `⚠️ Instructivo CapCut – Importante

La cuenta proporcionada es europea, por lo que se deben respetar ciertas políticas:

🔐 Condiciones de uso:
- Debe activarse el mismo día de la compra
- La cuenta es privada
- Solo se permite el uso en máximo 2 dispositivos al mismo tiempo
- Copie y pegue el correo y contraseña para evitar errores
- ⚠️ No hay garantía en caso de bloqueo por ingreso incorrecto de datos
- No ingresar en más de 2 dispositivos simultáneamente
- Puede cambiar la contraseña si lo desea
- No recomendamos revender o compartir la cuenta

🚫 Importante: Si se incumplen las políticas y la cuenta se bloquea, deberá esperar entre 24 horas y 3 días para su recuperación.

🙏 Gracias por tu compra 👍🏻😊`,
  },
  {
    id: 'universal-plus',
    name: 'Universal Plus',
    icon: 'tv-2',
    plans: ['Mensual', '3 meses', '6 meses', '12 meses'],
    color: '#7B2CBF',
    imageUrl: '/images/unext-logo.png',
    instructive: `🔹📺✨ UNIVERSAL PLUS

Bienvenido a Universal Plus! 🙏

📌 CARACTERÍSTICAS:
• Acceso a contenido de Universal+
• Incluye canales de televisión en vivo
• Planes flexibles: Mensual, 3, 6 o 12 meses

🎬 ¡Disfruta de películas, series y contenido exclusivo!`,
  },
  {
    id: 'instructivo-universal',
    name: 'Instructivo Universal',
    icon: 'book-open',
    plans: ['Ver Instructivo'],
    color: '#FFCC00',
    imageUrl: '/images/unext-logo.png',
    instructive: `🔹📺✨ INSTRUCTIVO UNIVERSAL

Bienvenido! 🙏

📌 CARACTERÍSTICAS:
• Acceso universal a todos los servicios
• Incluye múltiples plataformas
• Soporte 24/7

🎬 ¡Disfruta de todo tu contenido favorito sin limitaciones!`,
  },
  {
    id: 'producto-universal',
    name: 'Producto Universal',
    icon: 'gift',
    plans: ['Ver Producto'],
    color: '#FFCC00',
    imageUrl: '/images/unext-logo.png',
    instructive: `🎁✨ PRODUCTO UNIVERSAL

¡Bienvenido a tu nuevo producto! 🙏

📌 CARACTERÍSTICAS:
• Acceso completo
• Incluye todos los beneficios
• Fácil de usar

🎉 ¡Gracias por tu compra!`,
  },
];

// Productos que solo usan 2 pantallas (Cliente 1, Cliente 2) sin perfiles específicos
export const TWO_SCREEN_PRODUCTS = ['PrimeVideo', 'Crunchyroll', 'Paramount+'];

// Productos que usan 1 solo perfil con PIN (ej: Cerrar Netflix con Pines, HBO Max Standar, HBO Max Con TNT)
// NOTA: Disney Standar y Disney Premium permiten hasta 5 perfiles
export const SINGLE_PROFILE_PRODUCTS = ['Cerrar Netflix con Pines', 'HBO Max Standar', 'HBO Max Con TNT'];

export const DEFAULT_SETTINGS: Settings = {
  alarmDays: [7, 3, 1],
  currency: 'USD',
  currencySymbol: '$',
  businessName: 'Rocky Cuentas',
  logoUrl: undefined,
};

// Instructivos predeterminados - VACÍO, se agregan desde la UI
export const DEFAULT_INSTRUCTIVES: Instructive[] = [];

// Helper para obtener la fecha actual de Chile (UTC-3)
// Chile no usa horario de verano actualmente (desde 2015)
export const getChileDate = (): Date => {
  const now = new Date();
  // Obtener el offset de Chile (UTC-3 = -180 minutos)
  const chileOffset = -3 * 60; // minutos
  // Obtener el offset actual del navegador
  const localOffset = now.getTimezoneOffset();
  // Calcular la diferencia
  const diff = chileOffset - localOffset;
  // Ajustar la fecha
  const chileDate = new Date(now.getTime() + diff * 60 * 1000);
  return chileDate;
};

// Helper para obtener la fecha actual de Chile como string YYYY-MM-DD
export const getChileDateString = (): string => {
  const chileDate = getChileDate();
  const year = chileDate.getFullYear();
  const month = (chileDate.getMonth() + 1).toString().padStart(2, '0');
  const day = chileDate.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper para calcular estado de la cuenta
export const getAccountStatus = (expiryDate: string, alarmDays: number[]): AccountStatus => {
  const today = getChileDate();
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
  const today = getChileDate();
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
