import { useState } from 'react';
import { X, User, Mail, MapPin, Calendar, Award, Heart, MessageCircle, CheckCircle2, Edit2 } from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);

  const userStats = [
    { label: 'Propuestas Creadas', value: '3', icon: Edit2, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Votos Realizados', value: '12', icon: Heart, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
    { label: 'Comentarios', value: '24', icon: MessageCircle, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Nivel', value: 'Activo', icon: Award, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const recentActivity = [
    { type: 'vote', text: 'Votaste por "Renovación del Parque Comunitario"', date: 'Hace 2 horas' },
    { type: 'comment', text: 'Comentaste en "Nuevas Ciclovías"', date: 'Hace 1 día' },
    { type: 'proposal', text: 'Creaste "Mejora de Iluminación en Zona Norte"', date: 'Hace 3 días' },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
        onClick={onClose}
      ></div>

      {/* Profile Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-[70] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Mi Perfil</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Avatar and Name */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">María González</h3>
              <p className="text-purple-100 text-sm">Ciudadana Activa</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Info */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Información Personal</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">maria.gonzalez@email.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Centro, Ciudad</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Miembro desde Mayo 2025</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Estadísticas</h3>
            <div className="grid grid-cols-2 gap-3">
              {userStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className={`${stat.bg} rounded-lg p-4`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                    </div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Actividad Reciente</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {activity.type === 'vote' && <Heart className="w-4 h-4 text-purple-600" />}
                    {activity.type === 'comment' && <MessageCircle className="w-4 h-4 text-purple-600" />}
                    {activity.type === 'proposal' && <Edit2 className="w-4 h-4 text-purple-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Insignias</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-700">Primera Propuesta</p>
              </div>
              <div className="text-center p-3 bg-fuchsia-50 rounded-lg">
                <Heart className="w-8 h-8 text-fuchsia-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-700">10 Votos</p>
              </div>
              <div className="text-center p-3 bg-violet-50 rounded-lg">
                <MessageCircle className="w-8 h-8 text-violet-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-700">Comentarista</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
              Editar Perfil
            </button>
            <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Configuración
            </button>
            <button className="w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
