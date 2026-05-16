import { useState } from 'react';
import { X, Heart, MessageCircle, CheckCircle2, Bell, Trash2 } from 'lucide-react';

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Notification {
  id: string;
  type: 'vote' | 'comment' | 'status' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function Notifications({ isOpen, onClose }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'vote',
      title: 'Nueva votación',
      message: 'Tu propuesta "Mejora de Iluminación" recibió 5 nuevos votos',
      time: 'Hace 10 min',
      read: false,
    },
    {
      id: '2',
      type: 'comment',
      title: 'Nuevo comentario',
      message: 'Juan comentó en tu propuesta "Renovación del Parque"',
      time: 'Hace 1 hora',
      read: false,
    },
    {
      id: '3',
      type: 'status',
      title: 'Proyecto aprobado',
      message: 'El proyecto "Nuevas Ciclovías" que votaste fue aprobado',
      time: 'Hace 2 horas',
      read: true,
    },
    {
      id: '4',
      type: 'comment',
      title: 'Respuesta a tu comentario',
      message: 'Ana respondió a tu comentario en "Huertos Urbanos"',
      time: 'Hace 5 horas',
      read: true,
    },
    {
      id: '5',
      type: 'system',
      title: 'Recordatorio',
      message: 'La votación para "Parque Comunitario" termina en 2 días',
      time: 'Hace 1 día',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'vote':
        return <Heart className="w-5 h-5 text-purple-600" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-fuchsia-600" />;
      case 'status':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'system':
        return <Bell className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
        onClick={onClose}
      ></div>

      {/* Notifications Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-[70] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Notificaciones</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-white text-purple-600 text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-purple-100 hover:text-white transition-colors"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-gray-200">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay notificaciones
              </h3>
              <p className="text-gray-600">Te avisaremos cuando haya novedades</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-purple-50' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-gray-100">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{notification.time}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button className="w-full px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors font-medium text-sm">
              Ver todas las notificaciones
            </button>
          </div>
        )}
      </div>
    </>
  );
}
