import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  Lock,
  MapPin,
  MessageSquare,
  PenLine,
  Save,
  Send,
  Sparkles,
  Users
} from 'lucide-react';
import {
  DraftForumEntry,
  DraftForumType,
  DraftWorkspaceDraft,
  ParticipationPhase,
  Proposal,
  ProposalState
} from '../App';

interface ProposalForumPageProps {
  proposal: Proposal | null;
  currentPhase: ParticipationPhase;
  onBack: () => void;
  onProposalStateChange: (proposalId: string, nextState: ProposalState) => void;
  workspaceDraft: DraftWorkspaceDraft | null;
  forumEntries: DraftForumEntry[];
  forumType: DraftForumType;
  forumText: string;
  neighborhoodInterest: number;
  onDraftFieldChange: (proposalId: string, field: keyof DraftWorkspaceDraft, value: string) => void;
  onSaveDraft: (proposalId: string) => void;
  onAiAssist: (proposalId: string) => void;
  onForumTypeChange: (proposalId: string, type: DraftForumType) => void;
  onForumTextChange: (proposalId: string, text: string) => void;
  onAddForumEntry: (proposalId: string) => void;
}

const forumTypeLabel: Record<DraftForumType, string> = {
  discussion: 'Discusion',
  suggestion: 'Sugerencia',
  question: 'Pregunta',
  local_context: 'Contexto local'
};

const stateLabel: Partial<Record<ProposalState, string>> = {
  draft: 'Draft',
  community_preview: 'Community Preview',
  in_preparation: 'Pre-submission',
  officially_submitted: 'Officially Submitted'
};

export default function ProposalForumPage({
  proposal,
  currentPhase,
  onBack,
  onProposalStateChange,
  workspaceDraft,
  forumEntries,
  forumType,
  forumText,
  neighborhoodInterest,
  onDraftFieldChange,
  onSaveDraft,
  onAiAssist,
  onForumTypeChange,
  onForumTextChange,
  onAddForumEntry
}: ProposalForumPageProps) {
  if (!proposal || !workspaceDraft) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a propuestas
        </button>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-slate-700 font-semibold">No se encontro la propuesta seleccionada.</p>
        </div>
      </div>
    );
  }

  const isStage1 = proposal.state === 'draft';
  const isStage2 = proposal.state === 'community_preview' || proposal.state === 'in_preparation';
  const isCommunityCollaboration = isStage1 || isStage2;
  const isLocked = !isCommunityCollaboration;
  const isInstitutionalEvaluationPhase = currentPhase === 'institutional_evaluation';
  const visibleStateLabel = isInstitutionalEvaluationPhase
    ? 'En proceso de evaluacion'
    : stateLabel[proposal.state] || proposal.state;

  const nextStepMap: Partial<Record<ProposalState, ProposalState>> = {
    draft: 'community_preview',
    community_preview: 'in_preparation',
    in_preparation: 'officially_submitted'
  };

  const nextState = nextStepMap[proposal.state];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a propuestas
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-700 mb-2">Foro dedicado por propuesta</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{proposal.title}</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-3xl">{proposal.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                <MapPin className="w-3.5 h-3.5" />
                {proposal.neighborhood}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                <MessageSquare className="w-3.5 h-3.5" />
                {forumEntries.length} aportes
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                <Users className="w-3.5 h-3.5" />
                Interes barrial: {neighborhoodInterest}
              </span>
            </div>
          </div>
          <div
            className={`rounded-xl px-3 py-2 text-xs ${
              isInstitutionalEvaluationPhase
                ? 'border border-amber-200 bg-amber-50 text-amber-800'
                : 'border border-violet-200 bg-violet-50 text-violet-800'
            }`}
          >
            Estado actual: <span className="font-semibold">{visibleStateLabel}</span>
          </div>
        </div>
      </div>

      {currentPhase === 'proposal_submission' && (
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Progresion de envio</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className={`rounded-xl border p-4 ${isStage1 ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-slate-50'}`}>
            <p className="text-xs font-semibold text-sky-700">Etapa 1</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">Draft / Community Proposal</p>
            <p className="text-xs text-slate-600 mt-1">Editar contenido base y abrir discusion comunitaria inicial.</p>
            <div className="mt-3 flex gap-2 text-[11px]">
              <span className="rounded-full bg-white px-2 py-1 border border-sky-200">Editar</span>
              <span className="rounded-full bg-white px-2 py-1 border border-sky-200">Comentar</span>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${isStage2 ? 'border-teal-300 bg-teal-50' : 'border-slate-200 bg-slate-50'}`}>
            <p className="text-xs font-semibold text-teal-700">Etapa 2</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">Community Preview / Pre-submission</p>
            <p className="text-xs text-slate-600 mt-1">Pulir redaccion final, cerrar observaciones y preparar envio oficial.</p>
            <div className="mt-3 flex gap-2 text-[11px]">
              <span className="rounded-full bg-white px-2 py-1 border border-teal-200">Feedback</span>
              <span className="rounded-full bg-white px-2 py-1 border border-teal-200">Ajustes finales</span>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${proposal.state === 'officially_submitted' ? 'border-violet-300 bg-violet-50' : 'border-slate-200 bg-slate-50'}`}>
            <p className="text-xs font-semibold text-violet-700">Etapa 3</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">Official Submission</p>
            <p className="text-xs text-slate-600 mt-1">Se bloquea la edicion comunitaria y continua el proceso institucional.</p>
            <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-600">
              <Clock3 className="w-3.5 h-3.5" />
              Fase global activa: {currentPhase}
            </div>
          </div>
        </div>

        {nextState && (
          <button
            onClick={() => onProposalStateChange(proposal.id, nextState)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            {nextState === 'officially_submitted' ? 'Enviar oficialmente' : `Avanzar a ${stateLabel[nextState]}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">Editor de propuesta</h2>
            {isLocked ? (
              <span className="inline-flex items-center gap-1 text-xs rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                <Lock className="w-3.5 h-3.5" />
                Bloqueado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs rounded-full bg-sky-100 px-2 py-1 text-sky-700">
                <Sparkles className="w-3.5 h-3.5" />
                Colaboracion activa
              </span>
            )}
          </div>

          {isLocked ? (
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs text-violet-900">
              La propuesta esta en flujo oficial. Se mantiene disponible en modo lectura para transparencia.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Titulo</label>
                  <input
                    value={workspaceDraft.title}
                    onChange={(e) => onDraftFieldChange(proposal.id, 'title', e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Descripcion</label>
                  <textarea
                    value={workspaceDraft.description}
                    onChange={(e) => onDraftFieldChange(proposal.id, 'description', e.target.value)}
                    rows={6}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Barrio</label>
                    <input
                      value={workspaceDraft.neighborhood}
                      onChange={(e) => onDraftFieldChange(proposal.id, 'neighborhood', e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Imagen (URL)</label>
                    <input
                      value={workspaceDraft.image}
                      onChange={(e) => onDraftFieldChange(proposal.id, 'image', e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Referencia territorial</label>
                  <input
                    value={workspaceDraft.territorialReference}
                    onChange={(e) => onDraftFieldChange(proposal.id, 'territorialReference', e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Contexto local</label>
                  <textarea
                    value={workspaceDraft.contextualInfo}
                    onChange={(e) => onDraftFieldChange(proposal.id, 'contextualInfo', e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => onSaveDraft(proposal.id)}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Save className="w-3.5 h-3.5" />
                  Guardar cambios
                </button>
                <button
                  onClick={() => onAiAssist(proposal.id)}
                  className="inline-flex items-center gap-2 rounded-md border border-sky-300 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-800 hover:bg-sky-100"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  Mejorar redaccion con IA
                </button>
              </div>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">Foro de la propuesta</h2>
            <span className="text-xs text-slate-500">Solo sobre esta propuesta</span>
          </div>

          <div className="space-y-2 max-h-[28rem] overflow-auto pr-1">
            {forumEntries.length === 0 && (
              <p className="text-xs text-slate-500">Aun no hay participaciones en este foro.</p>
            )}
            {forumEntries.map((entry) => (
              <div key={entry.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-semibold text-slate-700">{forumTypeLabel[entry.type]}</span>
                  <span className="text-[11px] text-slate-500">{new Date(entry.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-700">{entry.text}</p>
                <p className="mt-1 text-[11px] text-slate-500">Por: {entry.author}</p>
              </div>
            ))}
          </div>

          {isCommunityCollaboration ? (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-2">
              <select
                value={forumType}
                onChange={(e) => onForumTypeChange(proposal.id, e.target.value as DraftForumType)}
                className="sm:col-span-1 rounded-md border border-slate-300 px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="discussion">Discusion</option>
                <option value="suggestion">Sugerencia</option>
                <option value="question">Pregunta</option>
                <option value="local_context">Contexto local</option>
              </select>
              <input
                value={forumText}
                onChange={(e) => onForumTextChange(proposal.id, e.target.value)}
                placeholder="Escribe tu aporte para esta propuesta..."
                className="sm:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={() => onAddForumEntry(proposal.id)}
                className="sm:col-span-1 inline-flex items-center justify-center gap-1 rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
              >
                <Send className="w-3.5 h-3.5" />
                Publicar
              </button>
            </div>
          ) : (
            <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600">
              Foro en modo lectura durante el proceso oficial. El historial queda visible para transparencia.
            </div>
          )}
        </section>
      </div>

      {proposal.state === 'officially_submitted' && (
        <div className="mt-6 rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900 inline-flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          La propuesta fue enviada oficialmente y queda lista para evaluacion institucional.
        </div>
      )}

      {currentPhase === 'proposal_submission' && (
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
        <p className="font-semibold mb-1">Flujo guiado de colaboracion</p>
        <p>
          Etapa 1 prioriza creacion y claridad. Etapa 2 prioriza validacion comunitaria y pre-envio.
          La discusion esta centralizada en esta pagina para mantener foco y reducir ruido en la lista principal.
        </p>
      </div>
      )}

      <div className="h-2" />
      <div className="text-xs text-slate-500 inline-flex items-center gap-1">
        <Bot className="w-3.5 h-3.5" />
        Espacio de trabajo colaborativo de propuesta
      </div>
    </div>
  );
}
