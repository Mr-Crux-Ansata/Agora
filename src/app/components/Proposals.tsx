import { useEffect, useState } from 'react';
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
  Lock,
  Bot,
  Sparkles,
  ArrowRight,
  PenLine,
  Send,
  Save
} from 'lucide-react';

import { ParticipationPhase, Proposal, ProposalState } from '../App';

interface ProposalsProps {
  proposals: Proposal[];
  currentPhase: ParticipationPhase;
  onProposalStateChange: (proposalId: string, nextState: ProposalState) => void;
  onProposalUpdate: (
    proposalId: string,
    updates: Partial<Pick<Proposal, 'title' | 'description' | 'neighborhood' | 'image' | 'category' | 'budget' | 'peopleBenefited'>>
  ) => void;
}

interface DraftForumEntry {
  id: string;
  type: 'discussion' | 'suggestion' | 'question' | 'local_context';
  author: string;
  text: string;
  createdAt: string;
}

interface DraftWorkspaceDraft {
  title: string;
  description: string;
  neighborhood: string;
  image: string;
  territorialReference: string;
  contextualInfo: string;
}

export default function Proposals({ proposals, currentPhase, onProposalStateChange, onProposalUpdate }: ProposalsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [showFilters, setShowFilters] = useState(false);
  const [votedProposals, setVotedProposals] = useState<Set<string>>(new Set());
  const [testVotingDeadline] = useState(() => Date.now() + 48 * 60 * 60 * 1000);
  const [now, setNow] = useState(Date.now());
  const currentYear = new Date().getFullYear();
  const [expandedWorkspaceId, setExpandedWorkspaceId] = useState<string | null>(null);
  const [workspaceDrafts, setWorkspaceDrafts] = useState<Record<string, DraftWorkspaceDraft>>({});
  const [forumEntries, setForumEntries] = useState<Record<string, DraftForumEntry[]>>({});
  const [forumType, setForumType] = useState<Record<string, DraftForumEntry['type']>>({});
  const [forumText, setForumText] = useState<Record<string, string>>({});

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

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

  const proposalsForCurrentPhase =
    currentPhase === 'results_publication'
      ? filteredOperationalProposals.filter((proposal) => proposal.state === 'approved' || proposal.state === 'rejected')
      : filteredOperationalProposals;

  const votingEnabled = currentPhase === 'voting';
  const remainingMs = Math.max(0, testVotingDeadline - now);
  const isCountdownFinished = remainingMs === 0;
  const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remainingMs / (1000 * 60)) % 60);
  const seconds = Math.floor((remainingMs / 1000) % 60);

  const handleVote = (proposalId: string) => {
    if (!votingEnabled || isCountdownFinished) return;

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

  const approvedProposals = currentYearProposals.filter((p) => p.state === 'approved');
  const rejectedProposals = currentYearProposals.filter((p) => p.state === 'rejected');
  const institutionalRows = currentYearProposals.filter((p) => p.state === 'approved' || p.state === 'rejected');

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
    in_preparation: 'In Preparation',
    officially_submitted: 'Officially Submitted',
    under_institutional_review: 'Under Institutional Review'
  };

  const forumTypeLabel: Record<DraftForumEntry['type'], string> = {
    discussion: 'Discusion',
    suggestion: 'Sugerencia',
    question: 'Pregunta',
    local_context: 'Contexto local'
  };

  const getWorkspaceDraft = (proposal: Proposal): DraftWorkspaceDraft => {
    return (
      workspaceDrafts[proposal.id] || {
        title: proposal.title,
        description: proposal.description,
        neighborhood: proposal.neighborhood,
        image: proposal.image,
        territorialReference: `Zona de referencia: ${proposal.neighborhood}`,
        contextualInfo: ''
      }
    );
  };

  const updateWorkspaceDraftField = (proposal: Proposal, field: keyof DraftWorkspaceDraft, value: string) => {
    const current = getWorkspaceDraft(proposal);
    setWorkspaceDrafts((prev) => ({
      ...prev,
      [proposal.id]: {
        ...current,
        [field]: value
      }
    }));
  };

  const saveDraftChanges = (proposal: Proposal) => {
    const draft = getWorkspaceDraft(proposal);
    onProposalUpdate(proposal.id, {
      title: draft.title,
      description: draft.description,
      neighborhood: draft.neighborhood,
      image: draft.image
    });
  };

  const applyAiWritingAssist = (proposal: Proposal) => {
    const draft = getWorkspaceDraft(proposal);
    const improved = `${draft.description.trim()}\n\nVersion mejorada con IA: Esta propuesta prioriza evidencia territorial, impacto comunitario medible y viabilidad institucional.`;
    updateWorkspaceDraftField(proposal, 'description', improved);
  };

  const addForumEntry = (proposal: Proposal) => {
    const text = (forumText[proposal.id] || '').trim();
    if (!text) return;

    const type = forumType[proposal.id] || 'discussion';
    const nextEntry: DraftForumEntry = {
      id: `${proposal.id}-${Date.now()}`,
      type,
      author: 'Ciudadania',
      text,
      createdAt: new Date().toISOString()
    };

    setForumEntries((prev) => ({
      ...prev,
      [proposal.id]: [nextEntry, ...(prev[proposal.id] || [])]
    }));
    setForumText((prev) => ({ ...prev, [proposal.id]: '' }));
  };

  const getProposalForumEntries = (proposal: Proposal) => forumEntries[proposal.id] || [];

  const getNeighborhoodInterest = (proposal: Proposal) => {
    const forumCount = getProposalForumEntries(proposal).length;
    return proposal.votes + proposal.comments + forumCount * 3;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="app-heading-lg mb-2">Propuestas Activas</h1>
        <p className="app-subtle">Vota por los proyectos del año {currentYear} que importan a tu comunidad</p>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-700 mb-2">Etapa 1 · Community Refinement</p>
            <p className="text-sm text-sky-900 mb-2">Las propuestas se publican como borrador para recibir comentarios, mejorar claridad y medir interes barrial.</p>
            <ul className="text-xs text-sky-800 space-y-1">
              <li>• Estado editable y colaborativo</li>
              <li>• Comentarios y sugerencias comunitarias habilitadas</li>
              <li>• Asistencia IA para redaccion y estructura</li>
            </ul>
          </div>
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-700 mb-2">Etapa 2 · Official Submission</p>
            <p className="text-sm text-violet-900 mb-2">Al enviar oficialmente, la propuesta se bloquea para edicion y entra al flujo formal institucional.</p>
            <ul className="text-xs text-violet-800 space-y-1">
              <li>• Integridad procedimental y trazabilidad</li>
              <li>• Edicion comunitaria deshabilitada</li>
              <li>• Evaluacion institucional formal</li>
            </ul>
          </div>
        </div>

        <div className={`mt-4 rounded-xl px-4 py-3 border ${
          isCountdownFinished
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900'
        }`}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1">
            Periodo de votacion (prueba)
          </p>
          {isCountdownFinished ? (
            <p className="text-sm font-semibold">El periodo de votacion de prueba ha terminado.</p>
          ) : (
            <p className="text-lg font-bold tabular-nums">
              {String(days).padStart(2, '0')}d : {String(hours).padStart(2, '0')}h : {String(minutes).padStart(2, '0')}m : {String(seconds).padStart(2, '0')}s
            </p>
          )}
        </div>

        {!votingEnabled && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            La votacion esta bloqueada en la fase actual. Debe estar activa la fase global Voting para habilitarla.
          </div>
        )}
      </div>

      {(currentPhase === 'results_publication' || currentPhase === 'institutional_evaluation') && (
        <div className="surface-card rounded-xl p-0 mb-6 overflow-hidden">
          <div className="px-4 py-4 sm:px-5 bg-gradient-to-r from-slate-50 to-fuchsia-50/60 border-b border-slate-200">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Dictamen institucional publico</h2>
                <p className="text-xs text-slate-500 mt-0.5">Transparencia de evaluacion: las propuestas rechazadas mantienen trazabilidad y motivo visible.</p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600">
                {currentPhase === 'results_publication' ? 'Results Publication' : 'Institutional Evaluation'}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Aprobadas: {approvedProposals.length}</span>
              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">Rechazadas: {rejectedProposals.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700">
                  <th className="text-left px-4 py-3 font-semibold">Propuesta</th>
                  <th className="text-left px-4 py-3 font-semibold">Dictamen</th>
                  <th className="text-left px-4 py-3 font-semibold">Razon</th>
                  <th className="text-left px-4 py-3 font-semibold">Feedback tecnico</th>
                  <th className="text-left px-4 py-3 font-semibold">Correccion sugerida</th>
                </tr>
              </thead>
              <tbody>
                {institutionalRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500">No hay dictamenes institucionales publicados.</td>
                  </tr>
                )}
                {institutionalRows.map((proposal, index) => (
                  <tr key={proposal.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="px-4 py-3 font-medium text-slate-900">{proposal.title}</td>
                    <td className="px-4 py-3">
                      {proposal.state === 'approved' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Aprobada</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">Rechazada</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {proposal.state === 'rejected'
                        ? (proposal.rejectionReason ? rejectionReasonLabel[proposal.rejectionReason] : 'No especificado')
                        : 'Cumple evaluacion institucional'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{proposal.technicalFeedback || 'Sin observaciones tecnicas'}</td>
                    <td className="px-4 py-3 text-slate-600">{proposal.suggestedModifications || 'No requiere ajustes'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
        </div>
      )}

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
                <button
                  onClick={() => setExpandedWorkspaceId((prev) => (prev === proposal.id ? null : proposal.id))}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Proposal Draft Workspace</p>
                    <p className="text-xs text-slate-600">Borrador editable + foro dedicado por propuesta</p>
                  </div>
                  <span className="text-xs font-medium text-slate-700">
                    {expandedWorkspaceId === proposal.id ? 'Cerrar' : 'Abrir'}
                  </span>
                </button>

                {expandedWorkspaceId === proposal.id && (
                  <div className="mt-3 space-y-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Draft editor</p>
                      {communityStates.includes(proposal.state) ? (
                        <>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label className="block text-xs text-slate-600 mb-1">Titulo</label>
                              <input
                                value={getWorkspaceDraft(proposal).title}
                                onChange={(e) => updateWorkspaceDraftField(proposal, 'title', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-600 mb-1">Descripcion</label>
                              <textarea
                                value={getWorkspaceDraft(proposal).description}
                                onChange={(e) => updateWorkspaceDraftField(proposal, 'description', e.target.value)}
                                rows={4}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-slate-600 mb-1">Barrio</label>
                                <input
                                  value={getWorkspaceDraft(proposal).neighborhood}
                                  onChange={(e) => updateWorkspaceDraftField(proposal, 'neighborhood', e.target.value)}
                                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-600 mb-1">Imagen (URL)</label>
                                <input
                                  value={getWorkspaceDraft(proposal).image}
                                  onChange={(e) => updateWorkspaceDraftField(proposal, 'image', e.target.value)}
                                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-slate-600 mb-1">Referencia territorial</label>
                              <input
                                value={getWorkspaceDraft(proposal).territorialReference}
                                onChange={(e) => updateWorkspaceDraftField(proposal, 'territorialReference', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-600 mb-1">Contexto local</label>
                              <textarea
                                value={getWorkspaceDraft(proposal).contextualInfo}
                                onChange={(e) => updateWorkspaceDraftField(proposal, 'contextualInfo', e.target.value)}
                                rows={2}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                              />
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              onClick={() => saveDraftChanges(proposal)}
                              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              <Save className="w-3.5 h-3.5" />
                              Guardar cambios
                            </button>
                            <button
                              onClick={() => applyAiWritingAssist(proposal)}
                              className="inline-flex items-center gap-2 rounded-md border border-sky-300 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-800 hover:bg-sky-100"
                            >
                              <PenLine className="w-3.5 h-3.5" />
                              Mejorar redaccion con IA
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="rounded-md border border-violet-200 bg-violet-50 p-3 text-xs text-violet-900">
                          El contenido del borrador esta bloqueado desde el envio oficial para preservar trazabilidad institucional.
                        </div>
                      )}
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Foro dedicado del borrador</p>
                        <span className="text-xs text-slate-500">Interes barrial: {getNeighborhoodInterest(proposal)}</span>
                      </div>

                      <div className="space-y-2 max-h-52 overflow-auto pr-1">
                        {getProposalForumEntries(proposal).length === 0 && (
                          <p className="text-xs text-slate-500">Aun no hay participaciones en este borrador.</p>
                        )}
                        {getProposalForumEntries(proposal).map((entry) => (
                          <div key={entry.id} className="rounded-md border border-slate-200 p-2">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[11px] font-semibold text-slate-700">{forumTypeLabel[entry.type]}</span>
                              <span className="text-[11px] text-slate-500">{new Date(entry.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-slate-700">{entry.text}</p>
                            <p className="mt-1 text-[11px] text-slate-500">Por: {entry.author}</p>
                          </div>
                        ))}
                      </div>

                      {communityStates.includes(proposal.state) ? (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <select
                            value={forumType[proposal.id] || 'discussion'}
                            onChange={(e) => setForumType((prev) => ({ ...prev, [proposal.id]: e.target.value as DraftForumEntry['type'] }))}
                            className="sm:col-span-1 rounded-md border border-slate-300 px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                          >
                            <option value="discussion">Discusion</option>
                            <option value="suggestion">Sugerencia</option>
                            <option value="question">Pregunta</option>
                            <option value="local_context">Contexto local</option>
                          </select>
                          <input
                            value={forumText[proposal.id] || ''}
                            onChange={(e) => setForumText((prev) => ({ ...prev, [proposal.id]: e.target.value }))}
                            placeholder="Escribe tu aporte para este borrador..."
                            className="sm:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                          <button
                            onClick={() => addForumEntry(proposal)}
                            className="sm:col-span-1 inline-flex items-center justify-center gap-1 rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Publicar
                          </button>
                        </div>
                      ) : (
                        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600">
                          Foro en modo lectura durante el proceso oficial. El historial se mantiene publico para transparencia.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="space-y-2">
                {proposal.state === 'open_for_voting' && (
                  <button
                    onClick={() => handleVote(proposal.id)}
                    disabled={!votingEnabled || isCountdownFinished}
                    className={`w-full px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
                      !votingEnabled || isCountdownFinished
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : votedProposals.has(proposal.id)
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    {!votingEnabled ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Heart className={`w-4 h-4 ${votedProposals.has(proposal.id) ? 'fill-current' : ''}`} />
                    )}
                    {!votingEnabled
                      ? 'Disponible solo en Voting'
                      : isCountdownFinished
                      ? 'Periodo de votacion finalizado'
                      : votedProposals.has(proposal.id)
                      ? 'Votado'
                      : 'Votar por este Proyecto'}
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
