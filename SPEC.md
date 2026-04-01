# StreamGuard - Sistema de Gestión de Cuentas Streaming

## 1. Concepto & Visión

StreamGuard es un dashboard de gestión profesional para proveedores de cuentas streaming. La experiencia transmite eficiencia y control total: un panel de mando donde cada cuenta es un activo que necesita atención. El diseño utiliza una estética "dark mode tech" con acentos de color que codifican por estado (verde=seguro, amarillo=atención, rojo=crítico). La interfaz es densa en información pero clara, permitiendo ver de un vistazo el estado de toda la cartera de cuentas.

## 2. Design Language

### Aesthetic Direction
- **Estilo**: Dashboard técnico dark mode con toques de glassmorphism
- **Referencia**: Bloomberg Terminal meets modern SaaS dashboard

### Color Palette
```css
--bg-primary: #0f0f1a;
--bg-secondary: #1a1a2e;
--bg-card: #16213e;
--bg-elevated: #1f2937;
--text-primary: #f1f5f9;
--text-secondary: #94a3b8;
--text-muted: #64748b;
--accent-primary: #6366f1;
--accent-secondary: #8b5cf6;
--success: #22c55e;
--warning: #f59e0b;
--danger: #ef4444;
--info: #3b82f6;
```

### Color Coding por Estado
- **Verde (#22c55e)**: Cuenta segura (>15 días restantes)
- **Amarillo (#f59e0b)**: Atención (5-15 días restantes)
- **Rojo (#ef4444)**: Crítico (<5 días restantes)
- **Gris (#64748b)**: Vencida

### Typography
- **Font Principal**: Inter (system-ui fallback)
- **Headings**: Semi-bold, tracking tight
- **Body**: Regular, 14px base
- **Data/Numbers**: Tabular nums para alineación

### Spatial System
- Base unit: 4px
- Card padding: 24px
- Gap between cards: 16px
- Section margins: 32px

### Motion Philosophy
- Transiciones suaves de 200ms ease-out para hover states
- Slide-in de 300ms para modales
- Skeleton loading para estados de carga
- Contadores animados para días restantes

## 3. Layout & Structure

### Arquitectura de Páginas
1. **Dashboard Principal** - Vista general con métricas y alertas
2. **Gestión de Cuentas** - Lista filtrable con todas las cuentas
3. **Agregar Cuenta** - Formulario de ingreso manual
4. **Importación** - Carga masiva desde Excel
5. **Productos** - Gestión de tipos de cuenta
6. **Proveedores** - Gestión de proveedores
7. **Configuración** - Alarmas y preferencias

### Estructura Visual
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Logo + Navegación + Búsqueda Global + Notificaciones│
├─────────────────────────────────────────────────────────────┤
│ Sidebar          │  Main Content Area                       │
│ - Dashboard      │  ┌─────────────────────────────────────┐ │
│ - Cuentas        │  │ Stats Cards (4 columnas)            │ │
│ - Agregar        │  ├─────────────────────────────────────┤ │
│ - Importar       │  │ Content Area (Tabla/Formulario)      │ │
│ - Productos      │  │                                     │ │
│ - Proveedores    │  │                                     │ │
│ - Configuración  │  └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Responsive Strategy
- Desktop: Sidebar expandida + contenido completo
- Tablet: Sidebar colapsable + cards en 2 columnas
- Mobile: Sidebar como drawer + cards en 1 columna

## 4. Features & Interactions

### 4.1 Gestión de Cuentas

#### Campos por Cuenta
| Campo | Tipo | Requerido | Descripción |
|-------|------|----------|-------------|
| email | string | Sí | Correo de la cuenta |
| password | string | Sí | Contraseña |
| productType | enum | Sí | Netflix, Spotify, etc. |
| plan | enum | Sí | Completo, 2 pantallas, Perfiles |
| clientName | string | Sí | Nombre del cliente |
| clientContact | string | No | Teléfono/email del cliente |
| saleDate | date | Sí | Fecha de venta |
| duration | number | Sí | 1-12 meses |
| expiryDate | date | auto | Calculada automáticamente |
| provider | string | Sí | Nombre del proveedor |
| providerRenewalDate | date | Sí | Fecha de renovación al proveedor |
| cost | number | No | Costo de la cuenta |
| price | number | No | Precio de venta |
| notes | string | No | Notas adicionales |
| status | enum | auto | Activa, Por Vencer, Vencida |

#### Planes por Producto
```typescript
const PLAN_TYPES = {
  'Netflix': ['Completo 4K', '2 Pantallas', '5 Perfiles'],
  'PrimeVideo': ['Completo', 'Solo Películas', 'Solo Series'],
  'Spotify': ['Individual', 'Duo', 'Familiar (6)'],
  'Disney+': ['Estándar', 'Premium'],
  'HBO Max': ['Estándar', 'Con TNT Sports'],
  'Crunchyroll': ['Free', 'Fan', 'Mega Fan'],
  // ... más productos
};
```

### 4.2 Sistema de Alarmas

#### Configuración de Notificaciones
- **Alarma 1**: 7 días antes del vencimiento (amarillo)
- **Alarma 2**: 3 días antes del vencimiento (naranja)
- **Alarma 3**: 1 día antes del vencimiento (rojo)
- **Alarma 4**: Fecha de renovación del proveedor

#### Tipos de Notificación
- Badge en el header con contador de alertas
- Fila resaltada en la tabla de cuentas
- Tooltip con detalles al hover
- Filtro rápido: "Por Vencer" en sidebar

### 4.3 Importación Masiva (Excel)

#### Formato Esperado
```csv
email,password,productType,plan,clientName,clientContact,saleDate,duration,provider,providerRenewalDate
cuenta@email.com,password123,Netflix,Completo 4K,Juan Pérez,555-1234,2024-01-15,6,ProveedorX,2024-07-15
```

#### Validaciones
- Email válido y único
- Tipo de producto existente
- Plan válido para el producto
- Fechas en formato correcto
- Duración entre 1-12

#### Manejo de Errores
- Preview de datos antes de importar
- Resaltado de filas con errores
- Opción de importar solo válidos o corregir

### 4.4 Dashboard

#### Cards de Métricas
1. **Total Cuentas**: Número total activas
2. **Por Vencer**: Cuentas en los próximos 7 días
3. **Ingresos del Mes**: Suma de precios de ventas
4. **Próximas Renovaciones**: Proveedores a pagar esta semana

#### Vista de Alertas
- Lista de cuentas ordenadas por urgencia
- Acciones rápidas: Renovar, Notificar Cliente, Dar de Baja

## 5. Component Inventory

### Navigation
- **Sidebar**: Logo, nav items con iconos, collapse toggle
- **Header**: Search, notifications badge, user menu

### Data Display
- **AccountCard**: Muestra cuenta con estado codificado por color
- **AccountTable**: Tabla con filtros, búsqueda, ordenamiento
- **StatsCard**: Métrica con icono, valor grande, tendencia
- **AlertBadge**: Contador circular de alertas

### Forms
- **AccountForm**: Formulario completo de cuenta
- **ImportForm**: Upload de Excel + preview
- **ProductForm**: Agregar/editar tipo de producto
- **ProviderForm**: Agregar/editar proveedor

### Feedback
- **Toast**: Notificaciones temporales (éxito, error, info)
- **Modal**: Confirmaciones y formularios modales
- **Skeleton**: Loading states para tablas

### Estados de Componentes
| Componente | Default | Hover | Active | Disabled | Loading |
|------------|---------|-------|--------|----------|---------|
| Button Primary | bg-indigo-600 | bg-indigo-500 | bg-indigo-700 | opacity-50 | spinner |
| Button Danger | bg-red-600 | bg-red-500 | bg-red-700 | opacity-50 | spinner |
| Input | border-gray-600 | border-indigo-500 | ring-2 ring-indigo-500 | bg-gray-800 | - |
| Table Row | bg-transparent | bg-gray-800 | - | - | skeleton |
| Card | bg-card | shadow-lg | - | - | skeleton |

## 6. Technical Approach

### Stack
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: React Context + useReducer
- **Storage**: localStorage (pre-Supabase)
- **Excel**: xlsx library para parsear Excel

### Data Models

```typescript
interface Account {
  id: string;
  email: string;
  password: string;
  productType: string;
  plan: string;
  clientName: string;
  clientContact?: string;
  saleDate: string; // ISO date
  duration: number; // months
  expiryDate: string; // ISO date (auto-calculated)
  provider: string;
  providerRenewalDate: string;
  cost?: number;
  price?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  icon: string;
  plans: string[];
  color: string;
}

interface Provider {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  notes?: string;
}

interface Settings {
  alarmDays: number[]; // [7, 3, 1]
  currency: string;
  businessName: string;
}
```

### localStorage Keys
- `streamguard_accounts`: Array de cuentas
- `streamguard_products`: Array de productos
- `streamguard_providers`: Array de proveedores
- `streamguard_settings`: Configuraciones

### Cálculo de Fecha de Vencimiento
```typescript
const calculateExpiryDate = (saleDate: Date, duration: number): Date => {
  const expiry = new Date(saleDate);
  expiry.setMonth(expiry.getMonth() + duration);
  return expiry;
};
```

### Productos Predefinidos
1. Netflix (planes: Completo 4K, 2 Pantallas, 5 Perfiles)
2. PrimeVideo (planes: Completo, Solo Películas, Solo Series)
3. Spotify Premium (planes: Individual, Duo, Familiar)
4. Deezer Premium (planes: Free, Premium, HiFi)
5. MaxPlayer (planes: Básico, Premium)
6. Disney+ (planes: Estándar, Premium)
7. Crunchyroll (planes: Free, Fan, Mega Fan)
8. HBO Max (planes: Estándar, Con TNT Sports)
9. TNT Sports Premium (planes: Mensual, Anual)
10. YouTube Premium (planes: Individual, Familia)
11. ChatGPT Plus (planes: Mensual, Anual)
12. Gemini Pro (planes: Free, Pro)

