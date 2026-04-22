import { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, ExternalLink, MessageCircle, Send } from 'lucide-react';

interface SupportContact {
  id: string;
  name: string;
  type: 'whatsapp' | 'telegram' | 'website' | 'other';
  url: string;
  icon?: string;
  description?: string;
  createdAt: string;
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export function Support() {
  const [supportContacts, setSupportContacts] = useState<SupportContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<SupportContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'website' as 'whatsapp' | 'telegram' | 'website' | 'other',
    url: '',
    description: '',
  });

  useEffect(() => {
    loadSupportContacts();
  }, []);

  const loadSupportContacts = async () => {
    try {
      // Load from localStorage for simplicity
      const saved = localStorage.getItem('support_contacts');
      if (saved) {
        setSupportContacts(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading support contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSupportContacts = (contacts: SupportContact[]) => {
    localStorage.setItem('support_contacts', JSON.stringify(contacts));
    setSupportContacts(contacts);
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return <MessageCircle className="w-6 h-6" />;
      case 'telegram':
        return <Send className="w-6 h-6" />;
      case 'website':
        return <ExternalLink className="w-6 h-6" />;
      default:
        return <ExternalLink className="w-6 h-6" />;
    }
  };

  const getContactColor = (type: string) => {
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

  const getContactLabel = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return 'WhatsApp';
      case 'telegram':
        return 'Telegram';
      case 'website':
        return 'Sitio Web';
      default:
        return 'Otro';
    }
  };

  const openContact = (contact: SupportContact) => {
    let url = contact.url;

    // Format URL based on type
    if (contact.type === 'whatsapp') {
      // Convert to wa.me format if it's a phone number
      const phone = contact.url.replace(/\D/g, '');
      if (phone.startsWith('56')) {
        url = `https://wa.me/${phone}`;
      } else if (phone.startsWith('569')) {
        url = `https://wa.me/${phone}`;
      } else {
        url = `https://wa.me/${phone}`;
      }
    } else if (contact.type === 'telegram') {
      // Add @ if not present and format as t.me link
      let username = contact.url.replace('@', '');
      if (!username.startsWith('https://t.me/') && !username.startsWith('t.me/')) {
        url = `https://t.me/${username}`;
      }
    } else if (contact.type === 'website') {
      // Add https if not present
      if (!contact.url.startsWith('http://') && !contact.url.startsWith('https://')) {
        url = `https://${contact.url}`;
      }
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenModal = (contact?: SupportContact) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        name: contact.name,
        type: contact.type,
        url: contact.url,
        description: contact.description || '',
      });
    } else {
      setEditingContact(null);
      setFormData({
        name: '',
        type: 'website',
        url: '',
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.url.trim()) {
      alert('Por favor completa el nombre y la URL/enlace');
      return;
    }

    const now = new Date().toISOString();

    if (editingContact) {
      const updated = supportContacts.map(c =>
        c.id === editingContact.id
          ? { ...c, name: formData.name.trim(), type: formData.type, url: formData.url.trim(), description: formData.description.trim() || undefined }
          : c
      );
      saveSupportContacts(updated);
    } else {
      const newContact: SupportContact = {
        id: generateId(),
        name: formData.name.trim(),
        type: formData.type,
        url: formData.url.trim(),
        description: formData.description.trim() || undefined,
        createdAt: now,
      };
      saveSupportContacts([...supportContacts, newContact]);
    }

    handleCloseModal();
  };

  const handleDelete = (contact: SupportContact) => {
    if (confirm(`¿Eliminar "${contact.name}" de Soporte?`)) {
      const filtered = supportContacts.filter(c => c.id !== contact.id);
      saveSupportContacts(filtered);
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
          Acceso rápido a WhatsApp, Telegram y páginas de soporte de tus proveedores
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

      {/* Support Links Grid */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {supportContacts.map((contact) => (
            <div
              key={contact.id}
              className="rounded-xl overflow-hidden transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)'
              }}
            >
              {/* Header with icon */}
              <div
                className="p-6 flex items-center justify-center"
                style={{ backgroundColor: getContactColor(contact.type) }}
              >
                <div className="text-white">
                  {getContactIcon(contact.type)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-xs px-2 py-1 rounded-full text-white font-medium"
                    style={{ backgroundColor: getContactColor(contact.type) }}
                  >
                    {getContactLabel(contact.type)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(contact)}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    </button>
                    <button
                      onClick={() => handleDelete(contact)}
                      className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                <h3
                  className="font-semibold text-lg mb-1 text-center"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {contact.name}
                </h3>

                {contact.description && (
                  <p
                    className="text-xs text-center mb-3"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {contact.description}
                  </p>
                )}

                {/* Open Button */}
                <button
                  onClick={() => openContact(contact)}
                  className="w-full py-2.5 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all hover:scale-105"
                  style={{ backgroundColor: getContactColor(contact.type) }}
                >
                  {getContactIcon(contact.type)}
                  <span>Abrir</span>
                </button>
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
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Nombre *
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

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Tipo de Contacto *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['whatsapp', 'telegram', 'website'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className="py-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1"
                      style={{
                        backgroundColor: formData.type === type ? getContactColor(type) : 'transparent',
                        borderColor: formData.type === type ? getContactColor(type) : 'var(--border-color)',
                        color: formData.type === type ? 'white' : 'var(--text-secondary)'
                      }}
                    >
                      {getContactIcon(type)}
                      <span className="text-xs font-medium">{getContactLabel(type)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {formData.type === 'whatsapp' ? 'Número de WhatsApp *' :
                   formData.type === 'telegram' ? 'Usuario de Telegram *' :
                   'URL del Sitio Web *'}
                </label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder={
                    formData.type === 'whatsapp' ? '56912345678' :
                    formData.type === 'telegram' ? 'nombre_usuario' :
                    'https://ejemplo.com/soporte'
                  }
                  required
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {formData.type === 'whatsapp' && 'Solo números, incluye código de país (ej: 56912345678)'}
                  {formData.type === 'telegram' && 'Sin @ (ej: proveedor123 o https://t.me/proveedor123)'}
                  {formData.type === 'website' && 'URL completa (ej: https://luchitovip.com/inicio.php)'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Descripción (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border resize-none"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Descripción adicional..."
                />
              </div>

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