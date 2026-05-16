import { useState } from 'react';
import {
  Heart,
  MessageCircle,
  MapPin,
  Filter,
  Search,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  Bot,
  Sparkles,
  ArrowRight
} from 'lucide-react';

import { ParticipationPhase, Proposal, ProposalState } from '../App';

interface ProposalsProps {
  proposals: Proposal[];
  currentPhase: ParticipationPhase;
  onProposalStateChange: (proposalId: string, nextState: ProposalState) => void;
  onOpenProposalForum: (proposalId: string) => void;
  getNeighborhoodInterest: (proposalId: string) => number;
  onOpenVotingSection: () => void;
}

export default function Proposals({ proposals, currentPhase, onProposalStateChange, onOpenProposalForum, getNeighborhoodInterest, onOpenVotingSection }: ProposalsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [showFilters, setShowFilters] = useState(false);
  const currentYear = new Date().getFullYear();

  const currentYearProposals = proposals.filter(
    (proposal) => new Date(proposal.createdAt).getFullYear() === currentYear
  );

  const filteredProposals = currentYearProposals
    .filter(p => {
      if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !p.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filterStatus !== 'all' && p.state !== filterStatus) return false;
      if (filterCategory !== 'all' && p.category !== filterCategory) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'trending') return b.votes - a.votes;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'budget') return b.budget - a.budget;
      return 0;
    });

  const filteredOperationalProposals = filteredProposals.filter(
    (proposal) => !(proposal.isWinningProject && ['completed', 'in_progress', 'delayed'].includes(proposal.state))
  );

  const proposalsForCurrentPhase = filteredOperationalProposals;

  const rejectionReasonLabel: Record<NonNullable<Proposal['rejectionReason']>, string> = {
    exceeds_budget_limit: 'Exceeds budget limit',
    outside_jurisdiction: 'Outside institutional jurisdiction',
    technical_infeasibility: 'Technical infeasibility',
    duplicate_proposal: 'Duplicate proposal'
  };

  const communityStates: ProposalState[] = ['draft', 'community_preview', 'in_preparation'];
  const officialStates: ProposalState[] = ['officially_submitted', 'under_institutional_review', 'under_review'];

  const nextCommunityStep: Partial<Record<ProposalState, ProposalState>> = {
    draft: 'community_preview',
    community_preview: 'in_preparation',
    in_preparation: 'officially_submitted',
    officially_submitted: 'under_institutional_review'
  };

  const stateLabel: Partial<Record<ProposalState, string>> = {
    draft: 'Draft',
    community_preview: 'Community Preview',
    in_preparation: 'Pre-submission',
    officially_submitted: 'Officially Submitted',
    under_institutional_review: 'Under Institutional Review'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="app-heading-lg mb-2">Propuestas Activas</h1>
        <p className="app-subtle">Vota por los proyectos del año {currentYear} que importan a tu comunidad</p>

        {currentPhase === 'voting' && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p>La votacion ahora es una seccion independiente para mantener foco y una experiencia sin foro.</p>
            <button
              onClick={onOpenVotingSection}
              className="inline-flex items-center justify-center rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
            >
              Ir a seccion de votacion
            </button>
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
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="draft">Draft</option>
                <option value="community_preview">Community Preview</option>
                <option value="in_preparation">In Preparation</option>
                <option value="officially_submitted">Officially Submitted</option>
                <option value="under_institutional_review">Under Institutional Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="in_deliberation">In Deliberation</option>
                <option value="open_for_voting">Open for Voting</option>
                <option value="winning_project">Winning Project</option>
                <option value="in_progress">In Progress</option>
                <option value="delayed">Delayed</option>
                <option value="completed">Completed</option>
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
        Mostrando {proposalsForCurrentPhase.length} {proposalsForCurrentPhase.length === 1 ? 'propuesta' : 'propuestas'}
      </div>

      {/* Proposals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {proposalsForCurrentPhase.map((proposal) => (
          <div key={proposal.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            {/* Image */}
            <div className="h-48 bg-gray-200 relative">
              <img
                src={proposal.image}
                alt={proposal.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                {proposal.state === 'approved' && (
                  <span className="px-3 py-1 bg-violet-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Aprobada
                  </span>
                )}
                {proposal.state === 'in_progress' && (
                  <span className="px-3 py-1 bg-fuchsia-600 text-white text-xs font-medium rounded-full">
                    En Progreso
                  </span>
                )}
                {proposal.state === 'completed' && (
                  <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Completada
                  </span>
                )}
                {proposal.state === 'delayed' && (
                  <span className="px-3 py-1 bg-amber-600 text-white text-xs font-medium rounded-full">
                    Atrasada
                  </span>
                )}
                {proposal.state === 'rejected' && (
                  <span className="px-3 py-1 bg-rose-600 text-white text-xs font-medium rounded-full">
                    Rechazada
                  </span>
                )}
                {proposal.state === 'submitted' && (
                  <span className="px-3 py-1 bg-slate-700 text-white text-xs font-medium rounded-full">
                    Enviada
                  </span>
                )}
                {proposal.state === 'draft' && (
                  <span className="px-3 py-1 bg-sky-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Draft
                  </span>
                )}
                {proposal.state === 'community_preview' && (
                  <span className="px-3 py-1 bg-teal-600 text-white text-xs font-medium rounded-full">
                    Community Preview
                  </span>
                )}
                {proposal.state === 'in_preparation' && (
                  <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full">
                    In Preparation
                  </span>
                )}
                {proposal.state === 'officially_submitted' && (
                  <span className="px-3 py-1 bg-violet-700 text-white text-xs font-medium rounded-full">
                    Officially Submitted
                  </span>
                )}
                {proposal.state === 'under_institutional_review' && (
                  <span className="px-3 py-1 bg-amber-700 text-white text-xs font-medium rounded-full">
                    Under Institutional Review
                  </span>
                )}
                {proposal.state === 'under_review' && (
                  <span className="px-3 py-1 bg-amber-600 text-white text-xs font-medium rounded-full">
                    En revision
                  </span>
                )}
                {proposal.state === 'in_deliberation' && (
                  <span className="px-3 py-1 bg-teal-600 text-white text-xs font-medium rounded-full">
                    En deliberacion
                  </span>
                )}
                {proposal.state === 'open_for_voting' && (
                  <span className="px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                    Abierta a votacion
                  </span>
                )}
                {proposal.state === 'winning_project' && (
                  <span className="px-3 py-1 bg-emerald-700 text-white text-xs font-medium rounded-full">
                    Proyecto ganador
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

              {proposal.state === 'rejected' && (
                <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
                  <p className="font-semibold mb-1">Razon de rechazo</p>
                  <p>
                    {proposal.rejectionReason ? rejectionReasonLabel[proposal.rejectionReason] : 'No especificada por la institucion.'}
                  </p>
                  {proposal.technicalFeedback && <p className="mt-2 text-rose-800">Feedback tecnico: {proposal.technicalFeedback}</p>}
                  {proposal.suggestedModifications && <p className="mt-1 text-rose-800">Sugerencia: {proposal.suggestedModifications}</p>}
                </div>
              )}

              {communityStates.includes(proposal.state) && (
                <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
                  <p className="font-semibold mb-1 flex items-center gap-2"><Bot className="w-4 h-4" />Refinamiento comunitario activo</p>
                  <p className="text-sky-800">Editable, con comentarios comunitarios habilitados y asistencia IA para mejorar estructura y claridad.</p>
                </div>
              )}

              {officialStates.includes(proposal.state) && (
                <div className="mb-4 rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900">
                  <p className="font-semibold mb-1">Flujo oficial institucional</p>
                  <p className="text-violet-800">Propuesta bloqueada para edicion comunitaria. En etapa formal y con trazabilidad procedimental.</p>
                </div>
              )}

              <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Foro centralizado de propuesta</p>
                    <p className="text-xs text-slate-600 mt-1">Cada tarjeta abre una pagina exclusiva para edicion y discusion de esta propuesta.</p>
                    <p className="text-xs text-slate-500 mt-2">Interes barrial: {getNeighborhoodInterest(proposal.id)}</p>
                  </div>
                  <button
                    onClick={() => onOpenProposalForum(proposal.id)}
                    className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Abrir foro
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-2">
                {proposal.state === 'open_for_voting' && (
                  <button
                    onClick={onOpenVotingSection}
                    className="w-full px-4 py-2 border border-rose-600 text-rose-700 rounded-lg hover:bg-rose-50 transition-colors font-medium"
                  >
                    Ir a seccion de votacion
                  </button>
                )}
                {communityStates.includes(proposal.state) && nextCommunityStep[proposal.state] && (
                  <button
                    onClick={() => onProposalStateChange(proposal.id, nextCommunityStep[proposal.state] as ProposalState)}
                    className="w-full px-4 py-2 border border-sky-600 text-sky-700 rounded-lg hover:bg-sky-50 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {proposal.state === 'in_preparation' ? 'Enviar oficialmente' : `Avanzar a ${stateLabel[nextCommunityStep[proposal.state] as ProposalState]}`}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {proposal.state === 'officially_submitted' && (
                  <button
                    onClick={() => onProposalStateChange(proposal.id, 'under_institutional_review')}
                    className="w-full px-4 py-2 border border-violet-600 text-violet-700 rounded-lg hover:bg-violet-50 transition-colors font-medium"
                  >
                    Ingresar a revisión institucional
                  </button>
                )}
                {!communityStates.includes(proposal.state) && proposal.state !== 'open_for_voting' && proposal.state !== 'officially_submitted' && (
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Ver Detalles
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {proposalsForCurrentPhase.length === 0 && (
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
