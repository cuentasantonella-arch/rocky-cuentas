import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  AppState,
  Account,
  Product,
  Provider,
  Client,
  Settings,
  ActivityLogEntry,
  ActivityType,
  Instructive,
  DEFAULT_PRODUCTS,
  DEFAULT_SETTINGS,
  DEFAULT_INSTRUCTIVES,
  calculateExpiryDate,
  generateId,
} from '../types';
import { supabase } from '../lib/supabase';

const STORAGE_KEYS = {
  accounts: 'rocky_accounts',
  products: 'rocky_products',
  providers: 'rocky_providers',
  clients: 'rocky_clients',
  settings: 'rocky_settings',
  activityLog: 'rocky_activity_log',
  instructives: 'rocky_instructives',
};

// Estado inicial
const initialState: AppState = {
  accounts: [],
  products: DEFAULT_PRODUCTS,
  providers: [],
  clients: [],
  settings: DEFAULT_SETTINGS,
  activityLog: [],
  instructives: DEFAULT_INSTRUCTIVES,
};

// Tipos de acciones
type Action =
  | { type: 'SET_STATE'; payload: Partial<AppState> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'UPDATE_ACCOUNT'; payload: Account }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_PROVIDER'; payload: Provider }
  | { type: 'UPDATE_PROVIDER'; payload: Provider }
  | { type: 'DELETE_PROVIDER'; payload: string }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: Client }
  | { type: 'DELETE_CLIENT'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'IMPORT_ACCOUNTS'; payload: Account[] }
  | { type: 'ADD_ACTIVITY'; payload: ActivityLogEntry }
  | { type: 'CLEAR_ACTIVITY_LOG' }
  | { type: 'ADD_INSTRUCTIVE'; payload: Instructive }
  | { type: 'UPDATE_INSTRUCTIVE'; payload: Instructive }
  | { type: 'DELETE_INSTRUCTIVE'; payload: string };

// Reducer
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'SET_LOADING':
      return state;
    case 'SET_ONLINE':
      return state;
    case 'ADD_ACCOUNT':
      return { ...state, accounts: [action.payload, ...state.accounts] };
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map((acc) =>
          acc.id === action.payload.id ? action.payload : acc
        ),
      };
    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter((acc) => acc.id !== action.payload),
      };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
      };
    case 'ADD_PROVIDER':
      return { ...state, providers: [...state.providers, action.payload] };
    case 'UPDATE_PROVIDER':
      return {
        ...state,
        providers: state.providers.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'DELETE_PROVIDER':
      return {
        ...state,
        providers: state.providers.filter((p) => p.id !== action.payload),
      };
    case 'ADD_CLIENT':
      return { ...state, clients: [...state.clients, action.payload] };
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter((c) => c.id !== action.payload),
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    case 'IMPORT_ACCOUNTS':
      return { ...state, accounts: [...action.payload, ...state.accounts] };
    case 'ADD_ACTIVITY':
      return { ...state, activityLog: [action.payload, ...state.activityLog].slice(0, 500) };
    case 'CLEAR_ACTIVITY_LOG':
      return { ...state, activityLog: [] };
    case 'ADD_INSTRUCTIVE':
      return { ...state, instructives: [...state.instructives, action.payload] };
    case 'UPDATE_INSTRUCTIVE':
      return {
        ...state,
        instructives: state.instructives.map((i) =>
          i.id === action.payload.id ? action.payload : i
        ),
      };
    case 'DELETE_INSTRUCTIVE':
      return {
        ...state,
        instructives: state.instructives.filter((i) => i.id !== action.payload),
      };
    default:
      return state;
  }
}

// Contexto
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  isLoading: boolean;
  isOnline: boolean;
  addAccount: (account: Omit<Account, 'id' | 'expiryDate' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAccount: (account: Account, reason?: string) => Promise<void>;
  deleteAccount: (account: Account) => Promise<void>;
  importAccounts: (accounts: Omit<Account, 'id' | 'expiryDate' | 'createdAt' | 'updatedAt'>[]) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (product: Product) => Promise<void>;
  addProvider: (provider: Omit<Provider, 'id'>) => Promise<void>;
  updateProvider: (provider: Provider) => Promise<void>;
  deleteProvider: (provider: Provider) => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  updateClient: (client: Client) => Promise<void>;
  deleteClient: (client: Client) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  logActivity: (type: ActivityType, description: string, details?: string, userName?: string, accountId?: string) => Promise<void>;
  clearActivityLog: () => Promise<void>;
  addInstructive: (instructive: Omit<Instructive, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateInstructive: (instructive: Instructive) => Promise<void>;
  deleteInstructive: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Proveedor
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isOnline, setIsOnline] = React.useState(false);

  // Cargar datos desde Supabase
  const loadFromSupabase = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Cargando datos desde Supabase...');

      // Cargar cuentas
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (accountsError) {
        console.error('❌ Error cargando cuentas:', accountsError);
      }

      // Cargar productos
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) {
        console.error('❌ Error cargando productos:', productsError);
      }

      // Cargar proveedores
      const { data: providers, error: providersError } = await supabase
        .from('providers')
        .select('*');

      if (providersError) {
        console.error('❌ Error cargando proveedores:', providersError);
      }

      // Cargar clientes
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*');

      if (clientsError) {
        console.error('❌ Error cargando clientes:', clientsError);
      }

      // Cargar historial
      const { data: activityLog, error: activityError } = await supabase
        .from('activity_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(500);

      if (activityError) {
        console.error('❌ Error cargando actividad:', activityError);
      }

      // Preparar payload
      const payload: Partial<AppState> = {};

      if (accounts && accounts.length > 0) {
        payload.accounts = accounts.map(acc => ({
          id: acc.id,
          email: acc.email,
          password: acc.password || '',
          productType: acc.product_type,
          plan: acc.plan,
          clientName: acc.client_name || '',
          clientContact: acc.client_contact || '',
          provider: acc.provider || '',
          providerRenewalDate: acc.provider_renewal_date || '',
          saleDate: acc.sale_date || '',
          duration: acc.duration || 1,
          expiryDate: acc.expiry_date || '',
          saleStatus: acc.sale_status || 'available',
          profiles: acc.profiles ? JSON.parse(acc.profiles) : [],
          notes: acc.notes || '',
          createdAt: acc.created_at,
          updatedAt: acc.updated_at,
        }));
        console.log('✅ Cuentas cargadas:', payload.accounts.length);
      }

      if (products && products.length > 0) {
        payload.products = products.map(p => ({
          id: p.id,
          name: p.name,
          icon: p.icon || 'tv',
          plans: p.plans || [],
          color: p.color || '#6366f1',
          imageUrl: p.image_url || '',
        }));
      } else {
        payload.products = DEFAULT_PRODUCTS;
      }

      if (providers && providers.length > 0) {
        payload.providers = providers.map(p => ({
          id: p.id,
          name: p.name,
          productType: p.product_type || '',
          notes: p.notes || '',
        }));
      }

      if (clients && clients.length > 0) {
        payload.clients = clients.map(c => ({
          id: c.id,
          name: c.name,
          contact: c.contact || c.email || '',
          email: c.email || '',
          notes: c.notes || '',
          createdAt: c.created_at,
        }));
      }

      if (activityLog && activityLog.length > 0) {
        payload.activityLog = activityLog.map(a => ({
          id: a.id,
          type: a.type as ActivityType,
          description: a.description,
          details: a.details || '',
          userName: a.user_name || '',
          accountId: a.account_id || '',
          accountEmail: a.account_email || '',
          timestamp: a.timestamp,
        }));
      }

      // Cargar instructivos desde Supabase
      const { data: instructives, error: instructivesError } = await supabase
        .from('instructives')
        .select('*');

      if (instructivesError) {
        console.error('❌ Error cargando instructivos:', instructivesError);
      }

      if (instructives && instructives.length > 0) {
        // Mapear instructivos de Supabase
        payload.instructives = instructives.map(i => ({
          id: i.id,
          title: i.title,
          content: i.content,
          imageUrl: i.image_url || '',
          createdAt: i.created_at,
          updatedAt: i.updated_at,
        }));
        console.log('✅ Instructivos cargados desde Supabase:', payload.instructives.length);
      } else {
        // Si no hay instructivos en Supabase, usar los defaults
        payload.instructives = DEFAULT_INSTRUCTIVES;
        console.log('📝 No hay instructivos en Supabase, usando defaults:', DEFAULT_INSTRUCTIVES.length);
        // Guardar instructivos por defecto en Supabase para que estén disponibles
        for (const instructive of DEFAULT_INSTRUCTIVES) {
          await supabase.from('instructives').upsert({
            id: instructive.id,
            title: instructive.title,
            content: instructive.content,
            image_url: instructive.imageUrl || '',
            created_at: instructive.createdAt,
            updated_at: instructive.updatedAt,
          }, { onConflict: 'id' });
        }
      }

      dispatch({ type: 'SET_STATE', payload });
      setIsOnline(true);
      console.log('✅ Datos cargados desde Supabase');

    } catch (error) {
      console.error('❌ Error general al cargar:', error);
      // Cargar desde localStorage como respaldo
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cargar desde localStorage (respaldo)
  const loadFromLocalStorage = () => {
    try {
      const accounts = localStorage.getItem(STORAGE_KEYS.accounts);
      const products = localStorage.getItem(STORAGE_KEYS.products);
      const providers = localStorage.getItem(STORAGE_KEYS.providers);
      const clients = localStorage.getItem(STORAGE_KEYS.clients);
      const settings = localStorage.getItem(STORAGE_KEYS.settings);
      const activityLog = localStorage.getItem(STORAGE_KEYS.activityLog);
      const instructives = localStorage.getItem(STORAGE_KEYS.instructives);

      const payload: Partial<AppState> = {};
      if (accounts) payload.accounts = JSON.parse(accounts);
      if (products) payload.products = JSON.parse(products);
      if (providers) payload.providers = JSON.parse(providers);
      if (clients) payload.clients = JSON.parse(clients);
      if (settings) payload.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(settings) };
      if (activityLog) payload.activityLog = JSON.parse(activityLog);
      if (instructives) payload.instructives = JSON.parse(instructives);
      else payload.instructives = DEFAULT_INSTRUCTIVES;

      if (Object.keys(payload).length > 0) {
        dispatch({ type: 'SET_STATE', payload });
        console.log('📦 Datos cargados desde localStorage (modo offline)');
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  };

  // Guardar en localStorage (respaldo offline)
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(state.accounts));
        localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(state.products));
        localStorage.setItem(STORAGE_KEYS.providers, JSON.stringify(state.providers));
        localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(state.clients));
        localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
        localStorage.setItem(STORAGE_KEYS.activityLog, JSON.stringify(state.activityLog));
        localStorage.setItem(STORAGE_KEYS.instructives, JSON.stringify(state.instructives));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [state, isLoading]);

  // Cargar datos al iniciar
  useEffect(() => {
    loadFromSupabase();
  }, []);

  // Suscripciones en tiempo real para productos e instructivos
  useEffect(() => {
    if (!isOnline) return;

    console.log('🔔 Configurando suscripciones en tiempo real...');

    // Suscripción para productos
    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          console.log('📦 Cambio en productos:', payload);
          if (payload.eventType === 'INSERT') {
            const newProduct = {
              id: payload.new.id,
              name: payload.new.name,
              icon: payload.new.icon || 'tv',
              plans: payload.new.plans || [],
              color: payload.new.color || '#6366f1',
              imageUrl: payload.new.image_url || '',
            };
            dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
          } else if (payload.eventType === 'UPDATE') {
            const updatedProduct = {
              id: payload.new.id,
              name: payload.new.name,
              icon: payload.new.icon || 'tv',
              plans: payload.new.plans || [],
              color: payload.new.color || '#6366f1',
              imageUrl: payload.new.image_url || '',
            };
            dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
          } else if (payload.eventType === 'DELETE') {
            dispatch({ type: 'DELETE_PRODUCT', payload: payload.old.id });
          }
        }
      )
      .subscribe();

    // Suscripción para instructivos
    const instructivesChannel = supabase
      .channel('instructives-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'instructives',
        },
        (payload) => {
          console.log('📝 Cambio en instructivos:', payload);
          if (payload.eventType === 'INSERT') {
            const newInstructive = {
              id: payload.new.id,
              title: payload.new.title,
              content: payload.new.content,
              imageUrl: payload.new.image_url || '',
              createdAt: payload.new.created_at,
              updatedAt: payload.new.updated_at,
            };
            dispatch({ type: 'ADD_INSTRUCTIVE', payload: newInstructive });
          } else if (payload.eventType === 'UPDATE') {
            const updatedInstructive = {
              id: payload.new.id,
              title: payload.new.title,
              content: payload.new.content,
              imageUrl: payload.new.image_url || '',
              createdAt: payload.new.created_at,
              updatedAt: payload.new.updated_at,
            };
            dispatch({ type: 'UPDATE_INSTRUCTIVE', payload: updatedInstructive });
          } else if (payload.eventType === 'DELETE') {
            dispatch({ type: 'DELETE_INSTRUCTIVE', payload: payload.old.id });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(instructivesChannel);
    };
  }, [isOnline]);

  // Función para refrescar datos
  const refreshData = async () => {
    await loadFromSupabase();
  };

  // ========== FUNCIONES DE CUENTAS ==========
  const addAccount = async (accountData: Omit<Account, 'id' | 'expiryDate' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const expiryDate = accountData.plan === 'Disponible' || !accountData.saleDate
      ? ''
      : calculateExpiryDate(accountData.saleDate, accountData.duration);

    const newAccount: Account = {
      ...accountData,
      id: generateId(),
      expiryDate,
      createdAt: now,
      updatedAt: now,
    };

    // Guardar directamente en Supabase
    try {
      const { error } = await supabase
        .from('accounts')
        .insert({
          id: newAccount.id,
          email: newAccount.email,
          password: newAccount.password || null,
          product_type: newAccount.productType,
          plan: newAccount.plan,
          client_name: newAccount.clientName || null,
          client_contact: newAccount.clientContact || null,
          provider: newAccount.provider || null,
          provider_renewal_date: newAccount.providerRenewalDate || null,
          sale_date: newAccount.saleDate || null,
          duration: newAccount.duration || 1,
          expiry_date: newAccount.expiryDate || null,
          sale_status: newAccount.saleStatus || 'available',
          profiles: JSON.stringify(newAccount.profiles || []),
          notes: newAccount.notes || null,
          created_at: newAccount.createdAt,
          updated_at: newAccount.updatedAt,
        });

      if (error) {
        console.error('❌ Error guardando cuenta en Supabase:', error);
      } else {
        console.log('✅ Cuenta guardada en Supabase:', newAccount.email);
      }
    } catch (err) {
      console.error('❌ Error al guardar cuenta:', err);
    }

    // Actualizar estado local
    dispatch({ type: 'ADD_ACCOUNT', payload: newAccount });

    // Agregar proveedor si no existe
    if (accountData.provider && !state.providers.find(p => p.name.toLowerCase() === accountData.provider.toLowerCase())) {
      await addProvider({ name: accountData.provider, productType: accountData.productType });
    }

    // Registrar actividad
    const desc = accountData.plan === 'Disponible'
      ? `Cuenta ${accountData.email} creada (Disponible)`
      : `Cuenta ${accountData.productType} creada`;
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: generateId(),
        type: 'account_created',
        description: desc,
        details: `Producto: ${accountData.productType} | Plan: ${accountData.plan}`,
        timestamp: now,
      },
    });
  };

  const updateAccount = async (account: Account, reason?: string) => {
    const now = new Date().toISOString();
    const updatedAccount = {
      ...account,
      expiryDate: account.plan === 'Disponible' || !account.saleDate
        ? ''
        : calculateExpiryDate(account.saleDate, account.duration),
      updatedAt: now,
    };

    // Guardar directamente en Supabase
    try {
      const { error } = await supabase
        .from('accounts')
        .upsert({
          id: updatedAccount.id,
          email: updatedAccount.email,
          password: updatedAccount.password || null,
          product_type: updatedAccount.productType,
          plan: updatedAccount.plan,
          client_name: updatedAccount.clientName || null,
          client_contact: updatedAccount.clientContact || null,
          provider: updatedAccount.provider || null,
          provider_renewal_date: updatedAccount.providerRenewalDate || null,
          sale_date: updatedAccount.saleDate || null,
          duration: updatedAccount.duration || 1,
          expiry_date: updatedAccount.expiryDate || null,
          sale_status: updatedAccount.saleStatus || 'available',
          profiles: JSON.stringify(updatedAccount.profiles || []),
          notes: updatedAccount.notes || null,
          created_at: updatedAccount.createdAt,
          updated_at: updatedAccount.updatedAt,
        });

      if (error) {
        console.error('❌ Error actualizando cuenta:', error);
      } else {
        console.log('✅ Cuenta actualizada en Supabase:', updatedAccount.email);
      }
    } catch (err) {
      console.error('❌ Error al actualizar cuenta:', err);
    }

    dispatch({ type: 'UPDATE_ACCOUNT', payload: updatedAccount });
  };

  const deleteAccount = async (account: Account) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', account.id);

      if (error) {
        console.error('❌ Error eliminando cuenta:', error);
      } else {
        console.log('✅ Cuenta eliminada de Supabase:', account.email);
      }
    } catch (err) {
      console.error('❌ Error al eliminar cuenta:', err);
    }

    dispatch({ type: 'DELETE_ACCOUNT', payload: account.id });
  };

  const importAccounts = async (accountsData: Omit<Account, 'id' | 'expiryDate' | 'createdAt' | 'updatedAt'>[]) => {
    const now = new Date().toISOString();
    const newAccounts: Account[] = accountsData.map(acc => ({
      ...acc,
      id: generateId(),
      expiryDate: acc.plan === 'Disponible' || !acc.saleDate
        ? ''
        : calculateExpiryDate(acc.saleDate, acc.duration),
      createdAt: now,
      updatedAt: now,
    }));

    // Guardar en Supabase
    try {
      const { error } = await supabase
        .from('accounts')
        .insert(newAccounts.map(acc => ({
          id: acc.id,
          email: acc.email,
          password: acc.password || null,
          product_type: acc.productType,
          plan: acc.plan,
          client_name: acc.clientName || null,
          client_contact: acc.clientContact || null,
          provider: acc.provider || null,
          provider_renewal_date: acc.providerRenewalDate || null,
          sale_date: acc.saleDate || null,
          duration: acc.duration || 1,
          expiry_date: acc.expiryDate || null,
          sale_status: acc.saleStatus || 'available',
          profiles: JSON.stringify(acc.profiles || []),
          notes: acc.notes || null,
          created_at: acc.createdAt,
          updated_at: acc.updatedAt,
        })));

      if (error) {
        console.error('❌ Error importando cuentas:', error);
      } else {
        console.log('✅ Cuentas importadas en Supabase:', newAccounts.length);
      }
    } catch (err) {
      console.error('❌ Error al importar cuentas:', err);
    }

    dispatch({ type: 'IMPORT_ACCOUNTS', payload: newAccounts });

    // Agregar proveedores únicos
    const uniqueProviders = [...new Set(accountsData.map(a => a.provider).filter(Boolean))];
    for (const providerName of uniqueProviders) {
      if (providerName && !state.providers.find(p => p.name.toLowerCase() === providerName.toLowerCase())) {
        await addProvider({ name: providerName, productType: '' });
      }
    }
  };

  // ========== FUNCIONES DE PRODUCTOS ==========
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...productData, id: generateId() };
    try {
      await supabase.from('products').upsert({
        id: newProduct.id,
        name: newProduct.name,
        icon: newProduct.icon || null,
        plans: newProduct.plans || null,
        color: newProduct.color || null,
        image_url: newProduct.imageUrl || null,
      });
    } catch (err) {
      console.error('Error guardando producto:', err);
    }
    dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
  };

  const updateProduct = async (product: Product) => {
    try {
      await supabase.from('products').upsert({
        id: product.id,
        name: product.name,
        icon: product.icon || null,
        plans: product.plans || null,
        color: product.color || null,
        image_url: product.imageUrl || null,
      });
    } catch (err) {
      console.error('Error actualizando producto:', err);
    }
    dispatch({ type: 'UPDATE_PRODUCT', payload: product });
  };

  const deleteProduct = async (product: Product) => {
    try {
      await supabase.from('products').delete().eq('id', product.id);
    } catch (err) {
      console.error('Error eliminando producto:', err);
    }
    dispatch({ type: 'DELETE_PRODUCT', payload: product.id });
  };

  // ========== FUNCIONES DE PROVEEDORES ==========
  const addProvider = async (providerData: Omit<Provider, 'id'>) => {
    const newProvider: Provider = { ...providerData, id: generateId() };
    try {
      await supabase.from('providers').upsert({
        id: newProvider.id,
        name: newProvider.name,
        product_type: newProvider.productType || null,
        notes: newProvider.notes || null,
      });
    } catch (err) {
      console.error('Error guardando proveedor:', err);
    }
    dispatch({ type: 'ADD_PROVIDER', payload: newProvider });
  };

  const updateProvider = async (provider: Provider) => {
    try {
      await supabase.from('providers').upsert({
        id: provider.id,
        name: provider.name,
        product_type: provider.productType || null,
        notes: provider.notes || null,
      });
    } catch (err) {
      console.error('Error actualizando proveedor:', err);
    }
    dispatch({ type: 'UPDATE_PROVIDER', payload: provider });
  };

  const deleteProvider = async (provider: Provider) => {
    try {
      await supabase.from('providers').delete().eq('id', provider.id);
    } catch (err) {
      console.error('Error eliminando proveedor:', err);
    }
    dispatch({ type: 'DELETE_PROVIDER', payload: provider.id });
  };

  // ========== FUNCIONES DE CLIENTES ==========
  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString();
    const newClient: Client = {
      ...clientData,
      id: generateId(),
      createdAt: now,
    };
    try {
      await supabase.from('clients').upsert({
        id: newClient.id,
        name: newClient.name,
        contact: newClient.contact || null,
        email: newClient.email || null,
        notes: newClient.notes || null,
        created_at: newClient.createdAt,
      });
    } catch (err) {
      console.error('Error guardando cliente:', err);
    }
    dispatch({ type: 'ADD_CLIENT', payload: newClient });
  };

  const updateClient = async (client: Client) => {
    try {
      await supabase.from('clients').upsert({
        id: client.id,
        name: client.name,
        contact: client.contact || null,
        email: client.email || null,
        notes: client.notes || null,
        created_at: client.createdAt,
      });
    } catch (err) {
      console.error('Error actualizando cliente:', err);
    }
    dispatch({ type: 'UPDATE_CLIENT', payload: client });
  };

  const deleteClient = async (client: Client) => {
    try {
      await supabase.from('clients').delete().eq('id', client.id);
    } catch (err) {
      console.error('Error eliminando cliente:', err);
    }
    dispatch({ type: 'DELETE_CLIENT', payload: client.id });
  };

  // ========== FUNCIONES DE CONFIGURACIÓN ==========
  const updateSettings = async (settingsData: Partial<Settings>) => {
    const updatedSettings = { ...state.settings, ...settingsData };
    try {
      await supabase.from('settings').upsert({
        id: 'app_settings',
        business_name: updatedSettings.businessName,
        logo_url: updatedSettings.logoUrl || null,
        alarm_days: updatedSettings.alarmDays,
        currency: updatedSettings.currency,
        currency_symbol: updatedSettings.currencySymbol,
      });
    } catch (err) {
      console.error('Error guardando configuración:', err);
    }
    dispatch({ type: 'UPDATE_SETTINGS', payload: settingsData });
  };

  // ========== FUNCIONES DE ACTIVIDAD ==========
  const logActivity = async (type: ActivityType, description: string, details?: string, userName?: string, accountId?: string) => {
    const now = new Date().toISOString();
    const entry: ActivityLogEntry = {
      id: generateId(),
      type,
      description,
      details: details || '',
      userName: userName || '',
      accountId: accountId || '',
      timestamp: now,
    };
    try {
      await supabase.from('activity_log').insert({
        id: entry.id,
        type: entry.type,
        description: entry.description,
        details: entry.details || null,
        user_name: entry.userName || null,
        account_id: entry.accountId || null,
        timestamp: entry.timestamp,
      });
    } catch (err) {
      console.error('Error guardando actividad:', err);
    }
    dispatch({ type: 'ADD_ACTIVITY', payload: entry });
  };

  const clearActivityLog = async () => {
    try {
      await supabase.from('activity_log').delete().neq('id', '');
    } catch (err) {
      console.error('Error limpiando actividad:', err);
    }
    dispatch({ type: 'CLEAR_ACTIVITY_LOG' });
  };

  // ========== FUNCIONES DE INSTRUCTIVOS ==========
  const addInstructive = async (instructiveData: Omit<Instructive, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newInstructive: Instructive = {
      ...instructiveData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    console.log('💾 Guardando instructivo en Supabase:', newInstructive.title);
    try {
      const { error } = await supabase.from('instructives').upsert({
        id: newInstructive.id,
        title: newInstructive.title,
        content: newInstructive.content || null,
        image_url: newInstructive.imageUrl || null,
        created_at: newInstructive.createdAt,
        updated_at: newInstructive.updatedAt,
      });
      if (error) {
        console.error('❌ Error al guardar instructivo en Supabase:', error);
      } else {
        console.log('✅ Instructivo guardado en Supabase:', newInstructive.title);
      }
    } catch (err) {
      console.error('❌ Error guardando instructivo:', err);
    }
    dispatch({ type: 'ADD_INSTRUCTIVE', payload: newInstructive });
  };

  const updateInstructive = async (instructive: Instructive) => {
    const updated = { ...instructive, updatedAt: new Date().toISOString() };
    try {
      await supabase.from('instructives').upsert({
        id: updated.id,
        title: updated.title,
        content: updated.content || null,
        image_url: updated.imageUrl || null,
        created_at: updated.createdAt,
        updated_at: updated.updatedAt,
      });
    } catch (err) {
      console.error('Error actualizando instructivo:', err);
    }
    dispatch({ type: 'UPDATE_INSTRUCTIVE', payload: updated });
  };

  const deleteInstructive = async (id: string) => {
    console.log('🗑️ Eliminando instructivo:', id);
    try {
      const { error } = await supabase.from('instructives').delete().eq('id', id);
      if (error) {
        console.error('❌ Error eliminando instructivo de Supabase:', error);
      } else {
        console.log('✅ Instructivo eliminado de Supabase:', id);
      }
    } catch (err) {
      console.error('❌ Error general eliminando instructivo:', err);
    }
    dispatch({ type: 'DELETE_INSTRUCTIVE', payload: id });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        isLoading,
        isOnline,
        addAccount,
        updateAccount,
        deleteAccount,
        importAccounts,
        addProduct,
        updateProduct,
        deleteProduct,
        addProvider,
        updateProvider,
        deleteProvider,
        addClient,
        updateClient,
        deleteClient,
        updateSettings,
        logActivity,
        clearActivityLog,
        addInstructive,
        updateInstructive,
        deleteInstructive,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
