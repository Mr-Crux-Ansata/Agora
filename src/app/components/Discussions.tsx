import { useState } from 'react';
import {
  MessageCircle,
  Heart,
  Clock,
  Pin,
  Search,
  Lock
} from 'lucide-react';
import { ParticipationPhase } from '../App';

interface Discussion {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  projectTitle: string;
  content: string;
  replies: number;
  likes: number;
  isPinned: boolean;
  createdAt: string;
  tags: string[];
}

const mockDiscussions: Discussion[] = [
   {
     id: '1',
     title: '¿Cómo se adaptará la nueva equipación del parque para niños con discapacidades?',
     author: 'Jennifer Walsh',
     authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer',
     projectTitle: 'Renovación del Parque Comunitario',
     content: '¡Me encanta esta propuesta! Sin embargo, me pregunto si la equipación del parque incluirá características accesibles para niños con desafíos de movilidad. Esto es importante para nuestra comunidad.',
     replies: 24,
     likes: 45,
     isPinned: true,
     createdAt: '2026-05-14',
     tags: ['accesibilidad', 'parque infantil']
   },
   {
     id: '2',
     title: 'Inquietudes sobre el ruta del carril bici cerca de la escuela',
     author: 'Robert Chen',
     authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
     projectTitle: 'Nuevos Carriles Bici en Calle Principal',
     content: 'El carril bici propuesto pasa justo por la Escuela Primaria Lincoln. ¿Hemos considerado las implicaciones de seguridad durante la llegada y salida de la escuela?',
     replies: 18,
     likes: 32,
     isPinned: false,
     createdAt: '2026-05-15',
     tags: ['seguridad', 'escuelas']
   },
   {
     id: '3',
     title: '¿Qué tipos de verduras podremos cultivar?',
     author: 'Emma Green',
     authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
     projectTitle: 'Iniciativa de Huerto Urbano',
     content: '¡Estoy entusiasmado sobre este proyecto! ¿Puede alguien compartir información sobre qué cultivos funcionarían mejor en nuestro clima y condiciones del suelo?',
     replies: 42,
     likes: 67,
     isPinned: false,
     createdAt: '2026-05-13',
     tags: ['jardinería', 'sostenibilidad']
   },
   {
     id: '4',
     title: 'Cobertura de WiFi y disponibilidad de soporte técnico',
     author: 'Marcus Johnson',
     authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
     projectTitle: 'Actualización Tecnológica de la Biblioteca Pública',
     content: '¡Esto es una gran iniciativa! ¿Habrá personal disponible para ayudar a adultos mayores y otros que no sean tan expertos en tecnología? Además, ¿qué hay sobre la cobertura de WiFi en todas las áreas de la biblioteca?',
     replies: 15,
     likes: 28,
     isPinned: true,
     createdAt: '2026-05-16',
     tags: ['tecnología', 'accesibilidad']
   },
   {
     id: '5',
    title: 'Timeline for completion and maintenance plan',
    author: 'Lisa Patel',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    projectTitle: 'Street Lighting Enhancement',
    content: 'When is the expected completion date? Also, what\'s the long-term maintenance plan to ensure the lights stay functional?',
    replies: 9,
    likes: 19,
    isPinned: false,
    createdAt: '2026-05-15',
    tags: ['timeline', 'maintenance']
  },
  {
    id: '6',
    title: 'Parking concerns during construction',
    author: 'Tom Anderson',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom',
    projectTitle: 'Community Center Expansion',
    content: 'I fully support this expansion, but I\'m worried about parking during the construction phase. The current lot is already limited. Any plans to address this?',
    replies: 31,
    likes: 54,
    isPinned: false,
    createdAt: '2026-05-12',
    tags: ['parking', 'construction']
  }
];

interface DiscussionsProps {
  currentPhase: ParticipationPhase;
}

export default function Discussions({ currentPhase }: DiscussionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const deliberationEnabled = currentPhase === 'community_deliberation';

  const allTags = Array.from(new Set(mockDiscussions.flatMap(d => d.tags)));

  const filteredDiscussions = mockDiscussions
    .filter(d => {
      if (searchTerm && !d.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !d.content.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filterTag !== 'all' && !d.tags.includes(filterTag)) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'popular') {
        return b.likes - a.likes;
      }
      if (sortBy === 'active') {
        return b.replies - a.replies;
      }
      return 0;
    });

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'less than 1 hour ago';
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="app-heading-lg mb-2">Discusiones Comunitarias</h1>
         <p className="app-subtle">Únete a la conversación sobre proyectos de presupuesto público</p>
         {!deliberationEnabled && (
           <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
             La participación en debates está bloqueada en la fase actual. Debe estar activa la fase Community Deliberation.
           </div>
         )}
      </div>

      {/* Search and Filters */}
      <div className="surface-card rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar discusiones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Tag Filter */}
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todos los Temas</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="recent">Más Reciente</option>
            <option value="popular">Más Popular</option>
            <option value="active">Más Activo</option>
          </select>
        </div>
      </div>

      {/* New Discussion Button */}
      <div className="mb-6">
        <button
          disabled={!deliberationEnabled}
          className={`w-full px-4 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
            deliberationEnabled
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-100 text-gray-500 cursor-not-allowed'
          }`}
        >
          {deliberationEnabled ? <MessageCircle className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          {deliberationEnabled ? 'Iniciar una Nueva Discusión' : 'Disponible solo en Deliberación Comunitaria'}
        </button>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        {filteredDiscussions.length} {filteredDiscussions.length === 1 ? 'discusión' : 'discusiones'}
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        {filteredDiscussions.map((discussion) => (
          <div
            key={discussion.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <img
                src={discussion.authorAvatar}
                alt={discussion.author}
                className="w-12 h-12 rounded-full flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    {discussion.isPinned && (
                      <Pin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                    <span>{discussion.title}</span>
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span className="font-medium">{discussion.author}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getTimeAgo(discussion.createdAt)}
                  </span>
                </div>
                <div className="text-sm text-blue-600 font-medium mb-2">
                  Re: {discussion.projectTitle}
                </div>
              </div>
            </div>

            {/* Content */}
            <p className="text-gray-700 mb-4">{discussion.content}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {discussion.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <button
                  disabled={!deliberationEnabled}
                  className={`flex items-center gap-1 transition-colors ${
                    deliberationEnabled ? 'text-gray-600 hover:text-blue-600' : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  <span className="text-sm font-medium">{discussion.likes}</span>
                </button>
                <button
                  disabled={!deliberationEnabled}
                  className={`flex items-center gap-1 transition-colors ${
                    deliberationEnabled ? 'text-gray-600 hover:text-blue-600' : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{discussion.replies} replies</span>
                </button>
              </div>
              <button
                disabled={!deliberationEnabled}
                className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                  deliberationEnabled
                    ? 'text-blue-600 hover:bg-blue-50'
                    : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                }`}
              >
                {deliberationEnabled ? 'View Discussion' : 'Bloqueado en esta fase'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDiscussions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron discusiones</h3>
          <p className="text-gray-600 mb-4">Intenta ajustar tu búsqueda o filtros</p>
           <button
             disabled={!deliberationEnabled}
             className={`px-6 py-2 rounded-lg transition-colors font-medium ${
               deliberationEnabled
                 ? 'bg-purple-600 text-white hover:bg-purple-700'
                 : 'bg-gray-100 text-gray-500 cursor-not-allowed'
             }`}
           >
             {deliberationEnabled ? 'Iniciar la Primera Discusión' : 'Disponible solo en la fase Deliberación'}
           </button>
        </div>
      )}
    </div>
  );
}
