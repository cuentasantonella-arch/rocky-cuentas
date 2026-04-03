import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Send,
  Users,
  MessageCircle,
  X,
  Search,
  Circle,
  ChevronLeft,
  MoreVertical,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  type: 'group' | 'direct';
  recipient_id?: string;
  recipient_name?: string;
  created_at: string;
  read: boolean;
}

interface ChatUser {
  id: string;
  name: string;
  role: string;
}

export function Chat() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'group' | 'direct'>('group');
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [systemUsers, setSystemUsers] = useState<ChatUser[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuarios del sistema
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Intentar cargar desde tabla de usuarios del sistema
        const { data, error } = await supabase
          .from('users')
          .select('id, name, role')
          .order('name');

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading users:', error);
        }

        // Si no hay tabla de usuarios, usar los perfiles de auth
        if (!data || data.length === 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, name, role')
            .order('name');

          if (profilesData) {
            setSystemUsers(profilesData.map(p => ({
              id: p.id,
              name: p.name || 'Usuario',
              role: p.role || 'collaborator'
            })));
          }
        } else {
          setSystemUsers(data.map(u => ({
            id: u.id,
            name: u.name,
            role: u.role || 'collaborator'
          })));
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    loadUsers();
  }, []);

  // Cargar mensajes
  useEffect(() => {
    loadMessages();

    // Suscribirse a nuevos mensajes
    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Verificar si el mensaje es para el usuario actual (directos)
          if (
            newMsg.type === 'group' ||
            newMsg.recipient_id === currentUser?.id ||
            newMsg.sender_id === currentUser?.id
          ) {
            setMessages(prev => [...prev, newMsg]);

            // Incrementar contador de no leídos para mensajes directos no leídos
            if (newMsg.type === 'direct' && newMsg.recipient_id === currentUser?.id && !newMsg.read) {
              setUnreadCounts(prev => ({
                ...prev,
                [newMsg.sender_id]: (prev[newMsg.sender_id] || 0) + 1
              }));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);

  // Desplazarse al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab, selectedUser]);

  // Marcar mensajes como leídos
  useEffect(() => {
    if (selectedUser && activeTab === 'direct') {
      markMessagesAsRead(selectedUser.id);
      setUnreadCounts(prev => ({ ...prev, [selectedUser.id]: 0 }));
    }
  }, [selectedUser, activeTab, messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`type.eq.group,recipient_id.eq.${currentUser?.id},sender_id.eq.${currentUser?.id}`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Contar mensajes no leídos
      const unread: Record<string, number> = {};
      data?.forEach(msg => {
        if (msg.type === 'direct' && msg.recipient_id === currentUser?.id && !msg.read) {
          unread[msg.sender_id] = (unread[msg.sender_id] || 0) + 1;
        }
      });
      setUnreadCounts(unread);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (senderId: string) => {
    try {
      await supabase
        .from('chat_messages')
        .update({ read: true })
        .eq('sender_id', senderId)
        .eq('recipient_id', currentUser?.id)
        .eq('read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      const messageData: Partial<Message> = {
        sender_id: currentUser.id,
        sender_name: currentUser.name,
        content: newMessage.trim(),
        type: activeTab,
        created_at: new Date().toISOString(),
        read: false,
      };

      if (activeTab === 'direct' && selectedUser) {
        messageData.recipient_id = selectedUser.id;
        messageData.recipient_name = selectedUser.name;
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert([messageData]);

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar el mensaje');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Filtrar mensajes según la pestaña activa
  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      if (activeTab === 'group') {
        return msg.type === 'group';
      } else {
        return (
          msg.type === 'direct' &&
          ((msg.sender_id === currentUser?.id && msg.recipient_id === selectedUser?.id) ||
           (msg.sender_id === selectedUser?.id && msg.recipient_id === currentUser?.id))
        );
      }
    });
  }, [messages, activeTab, selectedUser, currentUser?.id]);

  // Filtrar usuarios para mensaje directo
  const filteredUsers = useMemo(() => {
    return systemUsers.filter(
      user =>
        user.id !== currentUser?.id &&
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [systemUsers, searchQuery, currentUser?.id]);

  // Obtener último mensaje de cada conversación directa
  const lastMessages = useMemo(() => {
    const lastMsgMap: Record<string, Message> = {};
    messages
      .filter(msg => msg.type === 'direct')
      .forEach(msg => {
        const otherUserId = msg.sender_id === currentUser?.id ? msg.recipient_id : msg.sender_id;
        if (!lastMsgMap[otherUserId!] || new Date(msg.created_at) > new Date(lastMsgMap[otherUserId!].created_at)) {
          lastMsgMap[otherUserId!] = msg;
        }
      });
    return lastMsgMap;
  }, [messages, currentUser?.id]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
  };

  const getTotalUnread = () => {
    return Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg-card)' }}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-indigo-500" />
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Chat</h1>
          {getTotalUnread() > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
              {getTotalUnread()}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--border-color)' }}>
        <button
          onClick={() => { setActiveTab('group'); setSelectedUser(null); }}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'group'
              ? 'border-b-2 border-indigo-500 text-indigo-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            Grupo
          </div>
        </button>
        <button
          onClick={() => { setActiveTab('direct'); }}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'direct'
              ? 'border-b-2 border-indigo-500 text-indigo-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Directo
            {getTotalUnread() > 0 && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                {getTotalUnread()}
              </span>
            )}
          </div>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* User list for direct messages */}
        {activeTab === 'direct' && !selectedUser && (
          <div className="w-80 border-r flex flex-col" style={{ borderColor: 'var(--border-color)' }}>
            {/* Search */}
            <div className="p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)',
                  }}
                />
              </div>
            </div>

            {/* User list */}
            <div className="flex-1 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No hay usuarios disponibles
                </div>
              ) : (
                filteredUsers.map(user => {
                  const lastMsg = lastMessages[user.id];
                  const unread = unreadCounts[user.id] || 0;

                  return (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-indigo-500/20">
                          <span className="text-lg font-bold text-indigo-400">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <Circle className="absolute -bottom-0.5 -right-0.5 w-4 h-4 text-green-500 fill-green-500" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {user.name}
                          </p>
                          {lastMsg && (
                            <span className="text-xs text-gray-500">
                              {formatDate(lastMsg.created_at)}
                            </span>
                          )}
                        </div>
                        {lastMsg && (
                          <p className="text-sm text-gray-500 truncate">
                            {lastMsg.sender_id === currentUser?.id ? 'Tú: ' : ''}
                            {lastMsg.content}
                          </p>
                        )}
                      </div>
                      {unread > 0 && (
                        <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs font-bold rounded-full">
                          {unread}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Direct chat header */}
          {activeTab === 'direct' && selectedUser && (
            <div
              className="p-4 border-b flex items-center gap-3"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-elevated)' }}
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              </button>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-500/20">
                <span className="text-lg font-bold text-indigo-400">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {selectedUser.name}
                </p>
                <p className="text-xs text-green-500">En línea</p>
              </div>
            </div>
          )}

          {/* Group chat header */}
          {activeTab === 'group' && (
            <div
              className="p-4 border-b flex items-center gap-3"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-elevated)' }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-500/20">
                <Users className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Chat Grupal
                </p>
                <p className="text-xs text-gray-500">
                  {systemUsers.length} participantes
                </p>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle className="w-12 h-12 mb-4 opacity-50" />
                <p>No hay mensajes todavía</p>
                <p className="text-sm">¡Sé el primero en enviar un mensaje!</p>
              </div>
            ) : (
              filteredMessages.map((msg, index) => {
                const isOwnMessage = msg.sender_id === currentUser?.id;
                const showAvatar = index === 0 || filteredMessages[index - 1]?.sender_id !== msg.sender_id;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} gap-2 max-w-[70%]`}>
                      {showAvatar && !isOwnMessage ? (
                        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-indigo-500/20">
                          <span className="text-sm font-bold text-indigo-400">
                            {msg.sender_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      ) : (
                        <div className="w-8" />
                      )}
                      <div>
                        {showAvatar && (
                          <p className={`text-xs mb-1 ${isOwnMessage ? 'text-right' : ''}`} style={{ color: 'var(--text-muted)' }}>
                            {msg.sender_name} • {formatTime(msg.created_at)}
                          </p>
                        )}
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isOwnMessage
                              ? 'bg-indigo-600 text-white rounded-br-md'
                              : 'rounded-bl-md'
                          }`}
                          style={!isOwnMessage ? { backgroundColor: 'var(--bg-elevated)' } : {}}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            {activeTab === 'direct' && !selectedUser ? (
              <div className="text-center text-gray-500 py-2">
                Selecciona un usuario para enviar un mensaje directo
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Enviar imagen (próximamente)"
                  disabled
                >
                  <ImageIcon className="w-5 h-5 text-gray-500" />
                </button>
                <input
                  type="text"
                  placeholder={
                    activeTab === 'group'
                      ? 'Escribe un mensaje al grupo...'
                      : `Mensaje para ${selectedUser?.name}...`
                  }
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)',
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
