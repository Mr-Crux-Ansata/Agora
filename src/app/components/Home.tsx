import { useState } from 'react';
import {
  MapPin,
  TrendingUp,
  Users,
  Heart,
  ArrowRight,
  Sparkles,
  TreeDeciduous,
  Building2,
  CheckCircle2,
  Clock,
  MessageCircle,
  Vote
} from 'lucide-react';
import { Proposal } from '../App';

type Page = 'home' | 'map' | 'proposals' | 'discussions' | 'impact';

interface HomeProps {
  proposals: Proposal[];
  onNavigate: (page: Page) => void;
  onCreateProposal?: () => void;
}

export default function Home({ proposals, onNavigate, onCreateProposal }: HomeProps) {
  const nearbyProposals = proposals.slice(0, 3).map((p, index) => ({
    id: p.id,
    title: p.title,
    neighborhood: p.neighborhood,
    distance: `${(0.3 + index * 0.4).toFixed(1)} km`,
    votes: p.votes,
    comments: p.comments,
    status: p.status,
    daysLeft: p.daysLeft,
    progress: p.status === 'construction' ? 65 : undefined,
    completedDate: p.status === 'completed' ? 'hace 2 meses' : undefined,
    image: p.image
  }));

  const stats = [
    { label: 'Proyectos Activos', value: '24', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Ciudadanos Participando', value: '12.5K', icon: Users, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
    { label: 'Votos Totales', value: '8,342', icon: Vote, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Presupuesto Asignado', value: '$2.4M', icon: TrendingUp, color: 'text-purple-700', bg: 'bg-purple-100' }
  ];

  const recentActivity = [
    { type: 'vote', user: 'María S.', action: 'votó por', project: 'Renovación del Parque Comunitario', time: 'hace 2 min' },
    { type: 'comment', user: 'Juan C.', action: 'comentó en', project: 'Nuevas Ciclovías en Avenida Principal', time: 'hace 15 min' },
    { type: 'proposal', user: 'Ana R.', action: 'propuso', project: 'Mejora de Seguridad en Parques Infantiles', time: 'hace 1 hora' },
    { type: 'complete', user: 'Sistema', action: 'completó', project: 'Iniciativa de Huertos Urbanos', time: 'hace 3 horas' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Construye el Futuro de tu Comunidad
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-purple-100 mb-8">
              Propón, vota y da seguimiento a proyectos de presupuesto público en tu barrio. Tu voz importa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onCreateProposal}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                Crear Propuesta
              </button>
              <button
                onClick={() => onNavigate('map')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition-colors border border-purple-500"
              >
                <MapPin className="w-5 h-5" />
                Explorar Mapa
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Nearby Proposals */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Proyectos Cercanos</h2>
              <button onClick={() => onNavigate('proposals')} className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {nearbyProposals.map((proposal) => (
                <div key={proposal.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-48 h-48 sm:h-auto bg-gray-200">
                      <img
                        src={proposal.image}
                        alt={proposal.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                            {proposal.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{proposal.neighborhood}</span>
                            <span>•</span>
                            <span>{proposal.distance}</span>
                          </div>
                        </div>
                        {proposal.status === 'voting' && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                            Votación
                          </span>
                        )}
                        {proposal.status === 'construction' && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                            En Progreso
                          </span>
                        )}
                        {proposal.status === 'completed' && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Completado
                          </span>
                        )}
                      </div>

                      {proposal.status === 'voting' && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {proposal.votes} votos
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                {proposal.comments} comentarios
                              </span>
                            </div>
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {proposal.daysLeft} días restantes
                            </span>
                          </div>
                          <button className="w-full mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                            Votar Ahora
                          </button>
                        </div>
                      )}

                      {proposal.status === 'construction' && proposal.progress && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2 text-sm">
                            <span className="text-gray-600">Progreso de Construcción</span>
                            <span className="font-semibold text-gray-900">{proposal.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full transition-all"
                              style={{ width: `${proposal.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {proposal.status === 'completed' && (
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Completado {proposal.completedDate}
                          </span>
                          <button
                            onClick={() => onNavigate('impact')}
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                          >
                            Ver Impacto
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Activity Feed & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <button
                  onClick={onCreateProposal}
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">Crear Nueva Propuesta</span>
                </button>
                <button
                  onClick={() => onNavigate('proposals')}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Vote className="w-5 h-5 text-gray-700" />
                  <span className="font-medium text-gray-900">Explorar y Votar</span>
                </button>
                <button
                  onClick={() => onNavigate('map')}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MapPin className="w-5 h-5 text-gray-700" />
                  <span className="font-medium text-gray-900">Explorar Mapa</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {activity.type === 'vote' && <Heart className="w-4 h-4 text-purple-600" />}
                      {activity.type === 'comment' && <MessageCircle className="w-4 h-4 text-fuchsia-600" />}
                      {activity.type === 'proposal' && <Sparkles className="w-4 h-4 text-violet-600" />}
                      {activity.type === 'complete' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span>{' '}
                        <span className="text-gray-600">{activity.action}</span>{' '}
                        <span className="font-medium">{activity.project}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Assistant Card */}
            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl shadow-sm p-6 border border-purple-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Asistente Cívico IA</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Obtén ayuda para redactar propuestas, entender las normas o encontrar proyectos cerca de ti.
                  </p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-colors font-medium">
                Iniciar Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
