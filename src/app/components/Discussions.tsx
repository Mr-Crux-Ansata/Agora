import { useState } from 'react';
import {
  MessageCircle,
  Heart,
  ArrowUp,
  Clock,
  Pin,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';

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
    title: 'How will the new playground equipment accommodate children with disabilities?',
    author: 'Jennifer Walsh',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer',
    projectTitle: 'Community Park Renovation',
    content: 'I love this proposal! However, I\'m wondering if the playground equipment will include accessible features for children with mobility challenges. This is important for our community.',
    replies: 24,
    likes: 45,
    isPinned: true,
    createdAt: '2026-05-14',
    tags: ['accessibility', 'playground']
  },
  {
    id: '2',
    title: 'Bike lane routing concerns near school zone',
    author: 'Robert Chen',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    projectTitle: 'New Bike Lanes on Main Street',
    content: 'The proposed bike lane goes right by Lincoln Elementary. Have we considered the safety implications during school drop-off and pick-up times?',
    replies: 18,
    likes: 32,
    isPinned: false,
    createdAt: '2026-05-15',
    tags: ['safety', 'schools']
  },
  {
    id: '3',
    title: 'What types of vegetables will we be able to grow?',
    author: 'Emma Green',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    projectTitle: 'Urban Garden Initiative',
    content: 'I\'m excited about this project! Can someone share information about what crops would work best in our climate and soil conditions?',
    replies: 42,
    likes: 67,
    isPinned: false,
    createdAt: '2026-05-13',
    tags: ['gardening', 'sustainability']
  },
  {
    id: '4',
    title: 'WiFi coverage and tech support availability',
    author: 'Marcus Johnson',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    projectTitle: 'Public Library Technology Upgrade',
    content: 'This is a great initiative! Will there be staff available to help seniors and others who aren\'t as tech-savvy? Also, what about WiFi coverage in all areas of the library?',
    replies: 15,
    likes: 28,
    isPinned: true,
    createdAt: '2026-05-16',
    tags: ['technology', 'accessibility']
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

export default function Discussions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Discusiones Comunitarias</h1>
        <p className="text-gray-600">Únete a la conversación sobre proyectos de presupuesto público</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
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
        <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Iniciar una Nueva Discusión
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
                <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm font-medium">{discussion.likes}</span>
                </button>
                <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{discussion.replies} replies</span>
                </button>
              </div>
              <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium text-sm">
                View Discussion
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
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
            Iniciar la Primera Discusión
          </button>
        </div>
      )}
    </div>
  );
}
