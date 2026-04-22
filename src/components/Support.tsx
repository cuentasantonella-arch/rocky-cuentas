import { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, ExternalLink, MessageCircle, Send, Phone, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateId } from '../types';

// Canal de contacto individual
interface SupportChannel {
  type: 'whatsapp' | 'telegram' | 'website';
  url: string;
}

// Contacto de soporte con múltiples canales
interface SupportContact {
  id: string;
  name: string;
  channels: SupportChannel[];
  createdAt: string;
  updatedAt: string;
}

export function Support() {
  const [supportContacts, setSupportContacts] = useState<SupportContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<SupportContact | null>(null);

  // Form data para el modal
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    telegram: '',
    website: '',
  });

  // Contactos iniciales por defecto (RIPPER FLIX)
  const DEFAULT_SUPPORT_CONTACTS: SupportContact[] = [
    {
      id: 'ripper-flix-default',
      name: 'RIPPER FLIX',
      channels: [
        { type: 'whatsapp', url: '+51910162324' },
        { type: 'website', url: 'https://luchitovip.com/inicio.php' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    loadSupportContacts();
  }, []);

  // Cargar contactos desde Supabase
  const loadSupportContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('support_contacts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error cargando contactos de soporte:', error);
        // Cargar datos por defecto si hay error
        await initializeDefaultContacts();
        return;
      }

      if (data && data.length > 0) {
        // Convertir datos de Supabase al formato local
        const contacts: SupportContact[] = data.map((row: any) => ({
          id: row.id,
          name: row.name,
          channels: [
            row.whatsapp ? { type: 'whatsapp' as const, url: row.whatsapp } : null,
            row.telegram ? { type: 'telegram' as const, url: row.telegram } : null,
            row.website ? { type: 'website' as const, url: row.website } : null,
          ].filter((c): c is SupportChannel => c !== null),
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
        setSupportContacts(contacts);
      } else {
        // Inicializar con contactos por defecto
        await initializeDefaultContacts();
      }
    } catch (error) {
      console.error('Error cargando contactos:', error);
      await initializeDefaultContacts();
    } finally {
      setLoading(false);
    }
  };

  // Inicializar contactos por defecto en Supabase
  const initializeDefaultContacts = async () => {
    try {
      for (const contact of DEFAULT_SUPPORT_CONTACTS) {
        const { error } = await supabase.from('support_contacts').insert({
          id: contact.id,
          name: contact.name,
          whatsapp: contact.channels.find(c => c.type === 'whatsapp')?.url || null,
          telegram: contact.channels.find(c => c.type === 'telegram')?.url || null,
          website: contact.channels.find(c => c.type === 'website')?.url || null,
          created_at: contact.createdAt,
          updated_at: contact.updatedAt,
        });

        if (error && error.code !== '23505') { // Ignorar errores de duplicado
          console.error('Error insertando contacto por defecto:', error);
        }
      }

      // Recargar después de insertar
      loadSupportContacts();
    } catch (error) {
      console.error('Error inicializando contactos:', error);
      setSupportContacts(DEFAULT_SUPPORT_CONTACTS);
    }
  };

  // Guardar contacto en Supabase
  const saveContact = async (contact: SupportContact) => {
    const dataToSave = {
      id: contact.id,
      name: contact.name,
      whatsapp: contact.channels.find(c => c.type === 'whatsapp')?.url || null,
      telegram: contact.channels.find(c => c.type === 'telegram')?.url || null,
      website: contact.channels.find(c => c.type === 'website')?.url || null,
      updated_at: contact.updatedAt,
    };

    const { error } = await supabase
      .from('support_contacts')
      .upsert(dataToSave);

    if (error) {
      console.error('Error guardando contacto:', error);
      throw error;
    }
  };

  // Eliminar contacto de Supabase
  const deleteContactFromSupabase = async (id: string) => {
    const { error } = await supabase
      .from('support_contacts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando contacto:', error);
      throw error;
    }
  };

  // Obtener icono según tipo
  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return <MessageCircle className="w-5 h-5" />;
      case 'telegram':
        return <Send className="w-5 h-5" />;
      case 'website':
        return <Globe className="w-5 h-5" />;
      default:
        return <ExternalLink className="w-5 h-5" />;
    }
  };

  // Obtener color según tipo
  const getChannelColor = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return '#25D366';
      case 'telegram':
        return '#0088cc';
      case 'website':
        return '#E50914';
      default:
        return '#6366f1';
    }
  };

  // Abrir enlace de contacto
  const openChannel = (channel: SupportChannel) => {
    let url = channel.url;

    if (channel.type === 'whatsapp') {
      const phone = channel.url.replace(/\D/g, '');
      url = `https://wa.me/${phone}`;
    } else if (channel.type === 'telegram') {
      let username = channel.url.replace('@', '');
      if (!username.startsWith('https://t.me/') && !username.startsWith('t.me/')) {
        url = `https://t.me/${username}`;
      }
    } else if (channel.type === 'website') {
      if (!channel.url.startsWith('http://') && !channel.url.startsWith('https://')) {
        url = `https://${channel.url}`;
      }
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Abrir modal para crear/editar
  const handleOpenModal = (contact?: SupportContact) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        name: contact.name,
        whatsapp: contact.channels.find(c => c.type === 'whatsapp')?.url || '',
        telegram: contact.channels.find(c => c.type === 'telegram')?.url || '',
        website: contact.channels.find(c => c.type === 'website')?.url || '',
      });
    } else {
      setEditingContact(null);
      setFormData({
        name: '',
        whatsapp: '',
        telegram: '',
        website: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
  };

  // Guardar contacto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Por favor ingresa el nombre del contacto');
      return;
    }

    const hasAtLeastOneChannel = formData.whatsapp.trim() || formData.telegram.trim() || formData.website.trim();
    if (!hasAtLeastOneChannel) {
      alert('Por favor ingresa al menos un canal de contacto (WhatsApp, Telegram o Web)');
      return;
    }

    const now = new Date().toISOString();
    const channels: SupportChannel[] = [];

    if (formData.whatsapp.trim()) {
      channels.push({ type: 'whatsapp', url: formData.whatsapp.trim() });
    }
    if (formData.telegram.trim()) {
      channels.push({ type: 'telegram', url: formData.telegram.trim() });
    }
    if (formData.website.trim()) {
      channels.push({ type: 'website', url: formData.website.trim() });
    }

    try {
      if (editingContact) {
        // Actualizar contacto existente
        const updatedContact: SupportContact = {
          ...editingContact,
          name: formData.name.trim(),
          channels,
          updatedAt: now,
        };

        await saveContact(updatedContact);

        setSupportContacts(prev =>
          prev.map(c => c.id === editingContact.id ? updatedContact : c)
        );
      } else {
        // Crear nuevo contacto
        const newContact: SupportContact = {
          id: generateId(),
          name: formData.name.trim(),
          channels,
          createdAt: now,
          updatedAt: now,
        };

        await saveContact(newContact);

        setSupportContacts(prev => [...prev, newContact]);
      }

      handleCloseModal();
    } catch (error) {
      alert('Error al guardar el contacto. Intenta de nuevo.');
    }
  };

  // Eliminar contacto
  const handleDelete = async (contact: SupportContact) => {
    if (confirm(`¿Eliminar "${contact.name}" de Soporte?`)) {
      try {
        await deleteContactFromSupabase(contact.id);
        setSupportContacts(prev => prev.filter(c => c.id !== contact.id));
      } catch (error) {
        alert('Error al eliminar el contacto. Intenta de nuevo.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Soporte
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Acceso rápido a WhatsApp, Telegram y páginas web de tus proveedores
        </p>
      </div>

      {/* Add Button */}
      <button
        onClick={() => handleOpenModal()}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium mb-6 transition-all hover:scale-105"
        style={{ backgroundColor: '#E50914' }}
      >
        <Plus className="w-5 h-5" />
        Agregar Contacto de Soporte
      </button>

      {/* Support Contacts Grid */}
      {supportContacts.length === 0 ? (
        <div
          className="rounded-xl p-8 text-center"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <div className="text-4xl mb-4">📞</div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            No hay contactos de soporte
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Agrega contactos de soporte haciendo clic en el botón de arriba.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {supportContacts.map((contact) => (
            <div
              key={contact.id}
              className="rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)'
              }}
            >
              {/* Header */}
              <div
                className="p-4 flex items-center justify-between"
                style={{ backgroundColor: '#E50914' }}
              >
                <h3 className="font-bold text-lg text-white">
                  {contact.name}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(contact)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact)}
                    className="p-1.5 hover:bg-red-500/50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Content - Botones de contacto */}
              <div className="p-4">
                <div className="flex flex-wrap gap-3 justify-center">
                  {contact.channels.map((channel, idx) => (
                    <button
                      key={idx}
                      onClick={() => openChannel(channel)}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-white font-medium transition-all hover:scale-105"
                      style={{ backgroundColor: getChannelColor(channel.type) }}
                    >
                      {getChannelIcon(channel.type)}
                      <span>
                        {channel.type === 'whatsapp' && 'WhatsApp'}
                        {channel.type === 'telegram' && 'Telegram'}
                        {channel.type === 'website' && 'Web'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            style={{ backgroundColor: 'var(--bg-card)' }}
          >
            <div
              className="px-6 py-4 flex items-center justify-between border-b"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                {editingContact ? 'Editar Contacto' : 'Nuevo Contacto de Soporte'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Nombre del Proveedor *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Ej: Ripper Flix, Proveedor Netflix"
                  required
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  <MessageCircle className="w-4 h-4" style={{ color: '#25D366' }} />
                  WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="+51 910 162 324"
                />
              </div>

              {/* Telegram */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  <Send className="w-4 h-4" style={{ color: '#0088cc' }} />
                  Telegram
                </label>
                <input
                  type="text"
                  value={formData.telegram}
                  onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="nombre_usuario"
                />
              </div>

              {/* Website */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  <Globe className="w-4 h-4" style={{ color: '#E50914' }} />
                  Página Web
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="https://luchitovip.com/inicio.php"
                />
              </div>

              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                💡 Ingresa al menos un canal de contacto. Puedes agregar WhatsApp, Telegram y/o Web.
              </p>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 rounded-lg border transition-colors"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-lg text-white font-medium transition-colors"
                  style={{ backgroundColor: '#E50914' }}
                >
                  {editingContact ? 'Guardar' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
