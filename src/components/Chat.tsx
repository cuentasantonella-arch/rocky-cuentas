import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Users, MessageCircle, Trash2, Wifi, WifiOff } from 'lucide-react';
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
  const [connected, setConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  // Cargar mensajes desde Supabase
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(500);

      if (error) {
        console.error('Error loading messages:', error);
        setErrorMessage('No se puede conectar al chat. Ejecuta el SQL de migración en Supabase.');
        setMessages([]);
        setConnected(false);
      } else {
        setMessages(data || []);
        setConnected(true);
      }
    } catch (error: any) {
      console.error('Error loading messages:', error);
      setErrorMessage('Error de conexión. Verifica tu internet.');
      setMessages([]);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Suscribirse a mensajes en tiempo real
  useEffect(() => {
    let isMounted = true;

    const subscribeToMessages = async () => {
      try {
        // Primero cargar mensajes
        await loadMessages();
        if (!isMounted) return;

        // Configurar canal de Realtime
        channelRef.current = supabase
          .channel('chat-realtime-group')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'chat_messages'
            },
            (payload: any) => {
              if (isMounted) {
                const newMsg = payload.new as Message;
                setMessages(prev => {
                  // Evitar duplicados
                  if (prev.some(m => m.id === newMsg.id)) return prev;
                  return [...prev, newMsg];
                });
              }
            }
          )
          .subscribe((status: string) => {
            if (isMounted) {
              setConnected(status === 'SUBSCRIBED');
              if (status === 'CHANNEL_ERROR') {
                setErrorMessage('Error de conexión en tiempo real');
              }
            }
          });
      } catch (error) {
        console.error('Error subscribing:', error);
        if (isMounted) {
          setErrorMessage('No se puede conectar al chat en tiempo real');
          setConnected(false);
        }
      }
    };

    subscribeToMessages();

    return () => {
      isMounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [loadMessages]);

  // Desplazarse al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enviar mensaje
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      const messageData = {
        sender_id: currentUser.id,
        sender_name: currentUser.name,
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('chat_messages')
        .insert([messageData]);

      if (error) {
        console.error('Error sending message:', error);
        setErrorMessage('Error al enviar mensaje: ' + error.message);
      } else {
        setNewMessage('');
        setErrorMessage('');
      }
    } catch (error: any) {
      console.error('Error sending:', error);
      setErrorMessage('Error al enviar: ' + (error?.message || 'Error desconocido'));
    }
  }, [newMessage, currentUser]);

  // Limpiar todos los mensajes (solo admin)
  const clearAllMessages = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'admin') return;

    if (confirm('¿Estás seguro de que quieres borrar TODOS los mensajes del chat?')) {
      try {
        const { error } = await supabase
          .from('chat_messages')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Borra todos

        if (!error) {
          setMessages([]);
        } else {
          alert('Error al borrar mensajes: ' + error.message);
        }
      } catch (error: any) {
        alert('Error: ' + (error?.message || 'No se pudieron borrar los mensajes'));
      }
    }
  }, [currentUser]);

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

  // Contar participantes únicos
  const participantCount = new Set(messages.map(m => m.sender_id)).size;

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg-card)' }}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-indigo-500" />
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Chat Grupal</h1>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {connected ? (
              <>
                <Wifi className="w-3 h-3" />
                <span>En línea</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span>Sin conexión</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Users className="w-4 h-4" />
            <span>{participantCount} participantes</span>
          </div>
          {currentUser?.role === 'admin' && messages.length > 0 && (
            <button
              onClick={clearAllMessages}
              className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
              title="Borrar todos los mensajes"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Error Message */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-amber-500/20 border border-amber-500/30 mb-4">
            <p className="text-amber-400 text-sm">{errorMessage}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Sin mensajes</p>
            <p className="text-sm">¡Sé el primero en enviar un mensaje!</p>
            <p className="text-xs mt-4 opacity-70 text-center max-w-xs">
              Los mensajes se sincronizan en tiempo real entre todos los dispositivos
            </p>
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
                  new Date(msg.created_at).getTime() - new Date(dateMessages[index - 1].created_at).getTime() > 300000;

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
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={connected ? "Escribe un mensaje al grupo..." : "Conectando..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!connected}
            className="flex-1 px-4 py-3 rounded-xl text-sm disabled:opacity-50"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !connected}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
