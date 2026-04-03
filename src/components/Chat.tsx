import { useState, useEffect, useRef } from 'react';
import { Send, Users, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
}

export function Chat() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [participantCount, setParticipantCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar mensajes
  useEffect(() => {
    loadMessages();

    // Suscribirse a nuevos mensajes
    const channel = supabase
      .channel('chat_group')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Solo mostrar mensajes grupales
          if (newMsg.sender_id) {
            setMessages(prev => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Desplazarse al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Verificar si la tabla existe
  const ensureChatTable = async (): Promise<boolean> => {
    try {
      const { error: selectError } = await supabase
        .from('chat_messages')
        .select('id')
        .limit(1);

      if (selectError) {
        console.error('Cannot access chat_messages table:', selectError);
        setChatEnabled(false);
        setErrorMessage('La tabla de chat no está configurada. Contacta al administrador.');
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error checking chat table:', e);
      setChatEnabled(false);
      return false;
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const tableExists = await ensureChatTable();
      if (!tableExists) {
        setMessages([]);
        setLoading(false);
        return;
      }

      // Cargar mensajes grupales (los que no tienen recipient_id o los de tipo 'group')
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or('type.eq.group,recipient_id.is.null')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        setChatEnabled(false);
        setErrorMessage('Error al cargar mensajes: ' + error.message);
        setMessages([]);
        setLoading(false);
        return;
      }

      setChatEnabled(true);
      setMessages(data || []);

      // Contar participantes únicos
      const uniqueSenders = new Set(data?.map(m => m.sender_id));
      setParticipantCount(uniqueSenders.size || 0);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    if (!chatEnabled) {
      setErrorMessage('El chat no está disponible. La tabla de mensajes no está configurada.');
      return;
    }

    try {
      const messageData = {
        sender_id: currentUser.id,
        sender_name: currentUser.name,
        content: newMessage.trim(),
        type: 'group',
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('chat_messages')
        .insert([messageData]);

      if (error) {
        console.error('Error sending message:', error);
        setErrorMessage('Error al enviar: ' + error.message);
        return;
      }
      setNewMessage('');
      setErrorMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      setErrorMessage('Error al enviar el mensaje: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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

  // Agrupar mensajes por fecha
  const groupedMessages = messages.reduce((groups: Record<string, Message[]>, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg-card)' }}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-indigo-500" />
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Chat Grupal</h1>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Users className="w-4 h-4" />
          <span>{participantCount} participantes</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Error Message */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 mb-4">
            <p className="text-red-400 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Chat disabled message */}
        {!chatEnabled && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Chat no disponible</p>
            <p className="text-sm text-center max-w-xs mt-2">
              La tabla de chat no está configurada. Contacta al administrador para activarla.
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        ) : !chatEnabled ? null : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Sin mensajes</p>
            <p className="text-sm">¡Sé el primero en enviar un mensaje!</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }} />
                <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                  {formatDate(dateMessages[0].created_at)}
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }} />
              </div>

              {/* Messages for this date */}
              {dateMessages.map((msg, index) => {
                const isOwnMessage = msg.sender_id === currentUser?.id;
                const showAvatar = index === 0 || dateMessages[index - 1]?.sender_id !== msg.sender_id;
                const showName = index === 0 || dateMessages[index - 1]?.sender_id !== msg.sender_id ||
                  new Date(msg.created_at).getTime() - new Date(dateMessages[index - 1].created_at).getTime() > 300000; // 5 min

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}
                  >
                    <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} gap-2 max-w-[80%]`}>
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {showAvatar ? (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-500/20">
                            <span className="text-sm font-bold text-indigo-400">
                              {msg.sender_name?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                        ) : (
                          <div className="w-8" />
                        )}
                      </div>

                      {/* Message content */}
                      <div>
                        {/* Name and time */}
                        {showName && (
                          <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                            <span className="text-xs font-medium" style={{ color: isOwnMessage ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                              {isOwnMessage ? 'Tú' : msg.sender_name}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                        )}

                        {/* Message bubble */}
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isOwnMessage
                              ? 'bg-indigo-600 text-white rounded-br-sm'
                              : 'rounded-bl-sm'
                          }`}
                          style={!isOwnMessage ? { backgroundColor: 'var(--bg-elevated)' } : {}}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
        {!chatEnabled ? (
          <div className="text-center text-red-400 py-2">
            Chat no disponible - Tabla de mensajes no configurada
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Escribe un mensaje al grupo..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-3 rounded-xl text-sm"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
