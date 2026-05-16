import { useState } from 'react';
import {
  Heart,
  MessageCircle,
  MapPin,
  TrendingUp,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  Clock
} from 'lucide-react';

import { Proposal } from '../App';

interface ProposalsProps {
  proposals: Proposal[];
}

const _mockProposals: Proposal[] = [
  {
    id: '1',
    title: 'Community Park Renovation',
    description: 'Renovate the local park with new playground equipment, walking paths, and green spaces for families to enjoy.',
    author: 'Maria Santos',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    neighborhood: 'Downtown',
    category: 'Parks & Recreation',
    budget: 150000,
    votes: 342,
    comments: 28,
    status: 'voting',
    daysLeft: 12,
    createdAt: '2026-05-10',
    image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop',
    peopleBenefited: 5000
  },
  {
    id: '2',
    title: 'New Bike Lanes on Main Street',
    description: 'Install protected bike lanes to improve cyclist safety and encourage sustainable transportation throughout downtown.',
    author: 'John Chen',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    neighborhood: 'Downtown',
    category: 'Infrastructure',
    budget: 250000,
    votes: 521,
    comments: 45,
    status: 'construction',
    createdAt: '2026-04-20',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
    peopleBenefited: 8000
  },
  {
    id: '3',
    title: 'Urban Garden Initiative',
    description: 'Create community gardens for local residents to grow vegetables and connect with neighbors.',
    author: 'Ana Rodriguez',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    neighborhood: 'South District',
    category: 'Environment',
    budget: 75000,
    votes: 287,
    comments: 34,
    status: 'completed',
    createdAt: '2026-03-15',
    image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&auto=format&fit=crop',
    peopleBenefited: 300
  },
  {
    id: '4',
    title: 'Public Library Technology Upgrade',
    description: 'Modernize the library with new computers, high-speed internet, and digital learning resources for all ages.',
    author: 'David Kim',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    neighborhood: 'East Side',
    category: 'Education',
    budget: 200000,
    votes: 456,
    comments: 52,
    status: 'approved',
    createdAt: '2026-05-01',
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop',
    peopleBenefited: 10000
  },
  {
    id: '5',
    title: 'Street Lighting Enhancement',
    description: 'Install energy-efficient LED street lights to improve safety and reduce energy costs.',
    author: 'Sofia Martinez',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
    neighborhood: 'West End',
    category: 'Infrastructure',
    budget: 120000,
    votes: 198,
    comments: 16,
    status: 'voting',
    daysLeft: 8,
    createdAt: '2026-05-12',
    image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&auto=format&fit=crop',
    peopleBenefited: 3000
  },
  {
    id: '6',
    title: 'Community Center Expansion',
    description: 'Expand the local community center with new multipurpose rooms for classes, events, and community gatherings.',
    author: 'Michael Brown',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    neighborhood: 'North Hills',
    category: 'Community',
    budget: 350000,
    votes: 612,
    comments: 78,
    status: 'voting',
    daysLeft: 15,
    createdAt: '2026-05-05',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop',
    peopleBenefited: 15000
  }
];

export default function Proposals({ proposals }: ProposalsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [showFilters, setShowFilters] = useState(false);
  const [votedProposals, setVotedProposals] = useState<Set<string>>(new Set());

  const filteredProposals = proposals
    .filter(p => {
      if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !p.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      if (filterCategory !== 'all' && p.category !== filterCategory) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'trending') return b.votes - a.votes;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'budget') return b.budget - a.budget;
      return 0;
    });

  const handleVote = (proposalId: string) => {
    setVotedProposals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(proposalId)) {
        newSet.delete(proposalId);
      } else {
        newSet.add(proposalId);
      }
      return newSet;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Propuestas Activas</h1>
        <p className="text-gray-600">Vota por los proyectos que importan a tu comunidad</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar propuestas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="trending">Más Popular</option>
            <option value="newest">Más Reciente</option>
            <option value="budget">Mayor Presupuesto</option>
          </select>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5" />
            <span>Filtros</span>
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todos los Estados</option>
                <option value="voting">Abierta a Votación</option>
                <option value="approved">Aprobada</option>
                <option value="construction">En Construcción</option>
                <option value="completed">Completada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todas las Categorías</option>
                <option value="Parks & Recreation">Parques y Recreación</option>
                <option value="Infrastructure">Infraestructura</option>
                <option value="Education">Educación</option>
                <option value="Environment">Medio Ambiente</option>
                <option value="Community">Comunidad</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Mostrando {filteredProposals.length} {filteredProposals.length === 1 ? 'propuesta' : 'propuestas'}
      </div>

      {/* Proposals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProposals.map((proposal) => (
          <div key={proposal.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            {/* Image */}
            <div className="h-48 bg-gray-200 relative">
              <img
                src={proposal.image}
                alt={proposal.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                {proposal.status === 'voting' && (
                  <span className="px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                    Abierta a Votación
                  </span>
                )}
                {proposal.status === 'approved' && (
                  <span className="px-3 py-1 bg-violet-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Aprobada
                  </span>
                )}
                {proposal.status === 'construction' && (
                  <span className="px-3 py-1 bg-fuchsia-600 text-white text-xs font-medium rounded-full">
                    En Progreso
                  </span>
                )}
                {proposal.status === 'completed' && (
                  <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Completada
                  </span>
                )}
              </div>
              <div className="absolute top-3 right-3 px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">
                {proposal.category}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{proposal.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{proposal.description}</p>

              {/* Author & Location */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <img
                    src={proposal.authorAvatar}
                    alt={proposal.author}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm text-gray-700">{proposal.author}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{proposal.neighborhood}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-xs text-gray-500">Presupuesto</div>
                    <div className="font-semibold text-gray-900">
                      ${(proposal.budget / 1000).toFixed(0)}K
                    </div>
                  </div>
                </div>
                {proposal.peopleBenefited && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Impacto</div>
                      <div className="font-semibold text-gray-900">
                        {proposal.peopleBenefited.toLocaleString()} personas
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Engagement */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {proposal.votes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {proposal.comments}
                  </span>
                </div>
                {proposal.daysLeft && (
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {proposal.daysLeft} days left
                  </span>
                )}
              </div>

              {/* Action Button */}
              {proposal.status === 'voting' && (
                <button
                  onClick={() => handleVote(proposal.id)}
                  className={`w-full px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
                    votedProposals.has(proposal.id)
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${votedProposals.has(proposal.id) ? 'fill-current' : ''}`} />
                  {votedProposals.has(proposal.id) ? 'Votado' : 'Votar por este Proyecto'}
                </button>
              )}
              {proposal.status !== 'voting' && (
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Ver Detalles
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProposals.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron propuestas</h3>
          <p className="text-gray-600">Intenta ajustar tu búsqueda o filtros</p>
        </div>
      )}
    </div>
  );
}
