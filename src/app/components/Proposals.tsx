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
  onOpenCreateProposal?: () => void;
}

export default function Proposals({ proposals, currentPhase, onProposalStateChange, onOpenProposalForum, getNeighborhoodInterest, onOpenVotingSection, onOpenCreateProposal }: ProposalsProps) {
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

  const proposalsForCurrentPhase = filteredOperationalProposals.filter((proposal) => {
    if (currentPhase === 'community_deliberation') {
      return proposal.state === 'approved' || proposal.state === 'rejected';
    }
    if (currentPhase !== 'voting' && proposal.state === 'open_for_voting') return false;
    if (currentPhase === 'proposal_submission' && proposal.state === 'rejected') return false;
    return true;
  });

  const rejectionReasonLabel: Record<NonNullable<Proposal['rejectionReason']>, string> = {
    exceeds_budget_limit: 'Supera el limite de presupuesto',
    outside_jurisdiction: 'Fuera de jurisdiccion institucional',
    technical_infeasibility: 'Inviabilidad tecnica',
    duplicate_proposal: 'Propuesta duplicada'
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
    draft: 'Borrador',
    community_preview: 'Vista comunitaria',
    in_preparation: 'Preenvio',
    officially_submitted: 'Enviada oficialmente',
    under_institutional_review: 'En revision institucional'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="app-heading-lg mb-2">Propuestas Activas</h1>
        <p className="app-subtle">Vota por los proyectos del año {currentYear} que importan a tu comunidad</p>

        {currentPhase === 'proposal_submission' && (
          <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p>La fase de Presentacion de Propuestas esta activa. Puedes enviar una nueva propuesta ahora.</p>
            <button
              onClick={onOpenCreateProposal}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Crear propuesta
            </button>
          </div>
        )}

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
                <option value="submitted">Enviada</option>
                <option value="under_review">En revision</option>
                <option value="draft">Borrador</option>
                <option value="community_preview">Vista comunitaria</option>
                <option value="in_preparation">En preparacion</option>
                <option value="officially_submitted">Enviada oficialmente</option>
                <option value="under_institutional_review">En revision institucional</option>
                <option value="approved">Aprobada</option>
                <option value="rejected">Rechazada</option>
                <option value="in_deliberation">En deliberacion</option>
                <option value="open_for_voting">Abierta a votacion</option>
                <option value="winning_project">Proyecto ganador</option>
                <option value="in_progress">En progreso</option>
                <option value="delayed">Atrasada</option>
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
                <option value="Parques y Recreacion">Parques y Recreacion</option>
                <option value="Infraestructura">Infraestructura</option>
                <option value="Educacion">Educacion</option>
                <option value="Medio Ambiente">Medio Ambiente</option>
                <option value="Comunidad">Comunidad</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        {currentPhase === 'institutional_evaluation'
          ? `Mostrando ${proposalsForCurrentPhase.length} ${proposalsForCurrentPhase.length === 1 ? 'propuesta en proceso de evaluacion' : 'propuestas en proceso de evaluacion'}`
          : currentPhase === 'community_deliberation'
            ? `Mostrando ${proposalsForCurrentPhase.length} ${proposalsForCurrentPhase.length === 1 ? 'propuesta para deliberacion comunitaria' : 'propuestas para deliberacion comunitaria'}`
            : `Mostrando ${proposalsForCurrentPhase.length} ${proposalsForCurrentPhase.length === 1 ? 'propuesta' : 'propuestas'}`}
      </div>

      {(currentPhase === 'institutional_evaluation' || currentPhase === 'community_deliberation') && (
        <div className="surface-card rounded-xl border border-slate-200 overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80">
            <h2 className="text-sm font-semibold text-slate-900">
              {currentPhase === 'institutional_evaluation'
                ? 'Tabla de seguimiento institucional'
                : 'Resumen para deliberacion comunitaria'}
            </h2>
          </div>
          {proposalsForCurrentPhase.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white">
                  <tr className="text-left text-gray-600 border-b border-gray-200">
                    <th className="px-4 py-3 font-medium">Propuesta</th>
                    <th className="px-4 py-3 font-medium">Categoria</th>
                    <th className="px-4 py-3 font-medium">Barrio</th>
                    <th className="px-4 py-3 font-medium">Autor</th>
                    <th className="px-4 py-3 font-medium">Presupuesto</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {proposalsForCurrentPhase.map((proposal) => (
                    <tr
                      key={proposal.id}
                      className="border-b border-gray-100 hover:bg-gray-50/60 cursor-pointer"
                      onClick={() => onOpenProposalForum(proposal.id)}
                    >
                      <td className="px-4 py-3 text-gray-900 font-medium">{proposal.title}</td>
                      <td className="px-4 py-3 text-gray-700">{proposal.category}</td>
                      <td className="px-4 py-3 text-gray-700">{proposal.neighborhood}</td>
                      <td className="px-4 py-3 text-gray-700">{proposal.author}</td>
                      <td className="px-4 py-3 text-gray-900 font-semibold">${proposal.budget.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        {currentPhase === 'institutional_evaluation' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                            <Clock className="w-3.5 h-3.5" />
                            En proceso de evaluacion
                          </span>
                        ) : proposal.state === 'approved' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Aprobada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-800">
                            Rechazada
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpenProposalForum(proposal.id);
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Abrir foro
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 py-8 text-sm text-gray-600 text-center">
              No hay propuestas para mostrar en esta fase.
            </div>
          )}
        </div>
      )}
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
                {currentPhase === 'institutional_evaluation' && (
                  <span className="px-3 py-1 bg-amber-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    En proceso de evaluacion
                  </span>
                )}
                {currentPhase !== 'institutional_evaluation' && proposal.state === 'approved' && (
                  <span className="px-3 py-1 bg-violet-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Aprobada
                  </span>
                )}
                {currentPhase !== 'institutional_evaluation' && proposal.state === 'in_progress' && (
                  <span className="px-3 py-1 bg-fuchsia-600 text-white text-xs font-medium rounded-full">
                    En Progreso
                  </span>
                )}
                {currentPhase !== 'institutional_evaluation' && proposal.state === 'completed' && (
                  <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Completada
                  </span>
                )}
                {currentPhase !== 'institutional_evaluation' && proposal.state === 'delayed' && (
                  <span className="px-3 py-1 bg-amber-600 text-white text-xs font-medium rounded-full">
                    Atrasada
                  </span>
                )}
                {currentPhase !== 'institutional_evaluation' && proposal.state === 'rejected' && (
                  <span className="px-3 py-1 bg-rose-600 text-white text-xs font-medium rounded-full">
                    Rechazada
                  </span>
                )}
                {currentPhase !== 'institutional_evaluation' && proposal.state === 'submitted' && (
                  <span className="px-3 py-1 bg-slate-700 text-white text-xs font-medium rounded-full">
                    Enviada
                  </span>
                )}
                {currentPhase !== 'institutional_evaluation' && proposal.state === 'draft' && (
                  <span className="px-3 py-1 bg-sky-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Borrador
                  </span>
                )}
                {currentPhase !== 'institutional_evaluation' && proposal.state === 'community_preview' && (
                  <span className="px-3 py-1 bg-teal-600 text-white text-xs font-medium rounded-full">
                    Vista comunitaria
                  </span>
                )}
                {currentPhase !== 'institutional_evaluation' && proposal.state === 'in_preparation' && (
                  <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full">
                    En preparacion
                  </span>
                )}
                {currentPhase !== 'institutional_evaluation' && proposal.state === 'officially_submitted' && (
                  <span className="px-3 py-1 bg-violet-700 text-white text-xs font-medium rounded-full">
                    Enviada oficialmente
                  </span>
                )}
                {currentPhase !== 'institutional_evaluation' && proposal.state === 'under_institutional_review' && (
                  <span className="px-3 py-1 bg-amber-700 text-white text-xs font-medium rounded-full">
                    En revision institucional
                  </span>
                )}
                {currentPhase !== 'institutional_evaluation' && proposal.state === 'under_review' && (
                  <span className="px-3 py-1 bg-amber-600 text-white text-xs font-medium rounded-full">
                    En revision
                  </span>
                )}
                {currentPhase !== 'institutional_evaluation' && proposal.state === 'in_deliberation' && (
                  <span className="px-3 py-1 bg-teal-600 text-white text-xs font-medium rounded-full">
                    En deliberacion
                  </span>
                )}
                {currentPhase === 'voting' && proposal.state === 'open_for_voting' && (
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
              {currentPhase !== 'proposal_submission' && (
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
                      {proposal.daysLeft} dias restantes
                    </span>
                  )}
                </div>
              )}

              {proposal.state === 'rejected' && (
                <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
                  <p className="font-semibold mb-1">Razon de rechazo</p>
                  <p>
                    {proposal.rejectionReason ? rejectionReasonLabel[proposal.rejectionReason] : 'No especificada por la institucion.'}
                  </p>
                  {proposal.technicalFeedback && <p className="mt-2 text-rose-800">Retroalimentacion tecnica: {proposal.technicalFeedback}</p>}
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

              <div className="mb-4 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Foro de propuesta</p>
                    <p className="text-xs text-slate-500 mt-1">Interes barrial: {getNeighborhoodInterest(proposal.id)}</p>
                  </div>
                  <button
                    onClick={() => onOpenProposalForum(proposal.id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Abrir
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-2">
                {currentPhase === 'voting' && proposal.state === 'open_for_voting' && (
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
