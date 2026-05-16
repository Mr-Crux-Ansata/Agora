import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock, Heart, Lock, MapPin, Search, Users, Vote } from 'lucide-react';
import { ParticipationPhase, Proposal } from '../App';

interface VotingSectionProps {
  proposals: Proposal[];
  currentPhase: ParticipationPhase;
  onCastVote?: (proposalId: string) => Promise<void>;
}

export default function VotingSection({ proposals, currentPhase, onCastVote }: VotingSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [votedProposals, setVotedProposals] = useState<Set<string>>(new Set());
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [showVoteConfirmation, setShowVoteConfirmation] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [testVotingDeadline] = useState(() => Date.now() + 48 * 60 * 60 * 1000);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const votingEnabled = currentPhase === 'voting';
  const remainingMs = Math.max(0, testVotingDeadline - now);
  const isCountdownFinished = remainingMs === 0;
  const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remainingMs / (1000 * 60)) % 60);
  const seconds = Math.floor((remainingMs / 1000) % 60);

  const votingProposals = proposals
    .filter((proposal) => proposal.state === 'open_for_voting')
    .filter((proposal) => {
      if (!searchTerm) return true;
      return (
        proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => b.votes - a.votes);

  const selectedProposal = votingProposals.find((proposal) => proposal.id === selectedProposalId) || null;

  const requestVoteConfirmation = () => {
    if (!selectedProposal) return;
    if (!votingEnabled || isCountdownFinished) return;
    if (votedProposals.has(selectedProposal.id)) return;
    setShowVoteConfirmation(true);
  };

  const confirmVote = async () => {
    if (!selectedProposal) return;
    if (!votingEnabled || isCountdownFinished) return;

    setVoteError(null);
    setIsSubmittingVote(true);

    try {
      if (onCastVote) {
        await onCastVote(selectedProposal.id);
      }

      setVotedProposals((prev) => {
        if (prev.has(selectedProposal.id)) return prev;
        const next = new Set(prev);
        next.add(selectedProposal.id);
        return next;
      });
      setShowVoteConfirmation(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo registrar el voto.';
      setVoteError(message);
    } finally {
      setIsSubmittingVote(false);
    }
  };

  if (!votingEnabled) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 mb-2">Votacion deshabilitada</p>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">La seccion de votacion solo se habilita en la fase de Votacion</h1>
          <p className="text-sm text-slate-700">Ahora mismo el sistema esta en otra fase. Cuando se active Votacion, podras entrar a la cabina de votacion desde el menu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-600 via-red-500 to-orange-500 p-5 text-white shadow-lg mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-100">Seccion independiente</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Cabina de Votacion</h1>
            <p className="text-sm text-rose-50 mt-1">Solo decision ciudadana: sin foro ni edicion de propuestas.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs w-full lg:w-auto">
            <div className="rounded-lg bg-white/20 px-3 py-2">
              <p className="text-rose-100">Abiertas</p>
              <p className="text-lg font-extrabold text-white">{votingProposals.length}</p>
            </div>
            <div className="rounded-lg bg-white/20 px-3 py-2">
              <p className="text-rose-100">Tus votos</p>
              <p className="text-lg font-extrabold text-white">{votedProposals.size}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`mb-6 rounded-xl px-4 py-3 border ${
        isCountdownFinished
          ? 'bg-red-50 border-red-200 text-red-800'
          : 'bg-rose-50 border-rose-200 text-rose-900'
      }`}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-1">Periodo de votacion</p>
        {isCountdownFinished ? (
          <p className="text-sm font-semibold">El periodo de votacion ha terminado.</p>
        ) : (
          <p className="text-lg font-bold tabular-nums">
            {String(days).padStart(2, '0')}d : {String(hours).padStart(2, '0')}h : {String(minutes).padStart(2, '0')}m : {String(seconds).padStart(2, '0')}s
          </p>
        )}
      </div>

      {voteError && (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {voteError}
        </div>
      )}

      {!votingEnabled && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          La votacion esta bloqueada en la fase actual. Activa la fase Votacion para habilitar esta cabina.
        </div>
      )}

      <div className="rounded-xl border-2 border-rose-200 bg-rose-50/40 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-400" />
          <input
            type="text"
            placeholder="Buscar propuestas para votar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
          />
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        {votingProposals.length} {votingProposals.length === 1 ? 'propuesta disponible' : 'propuestas disponibles'} para votar
      </div>

      {!selectedProposal && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {votingProposals.map((proposal) => (
            <div key={proposal.id} className="bg-white rounded-xl shadow-lg ring-2 ring-rose-300 hover:shadow-xl transition-shadow overflow-hidden">
              <div className="h-48 bg-gray-200 relative">
                <img src={proposal.image} alt={proposal.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-full inline-flex items-center gap-1 shadow-md">
                  <Vote className="w-3.5 h-3.5" />
                  Urna activa
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">
                  {proposal.category}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{proposal.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{proposal.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{proposal.neighborhood}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{proposal.peopleBenefited?.toLocaleString() || 'N/D'} personas</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {proposal.votes} apoyos
                  </span>
                  {proposal.daysLeft && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {proposal.daysLeft} dias restantes
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setSelectedProposalId(proposal.id)}
                  className="w-full rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors font-bold px-4 py-3 text-base shadow-md"
                >
                  Entrar a propuesta para votar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProposal && (
        <div className="rounded-2xl border border-rose-200 bg-white shadow-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-rose-100 bg-rose-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">Revision previa al voto</p>
              <h2 className="text-xl font-bold text-slate-900">{selectedProposal.title}</h2>
            </div>
            <button
              onClick={() => {
                setSelectedProposalId(null);
                setShowVoteConfirmation(false);
              }}
              className="inline-flex items-center gap-2 rounded-md border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al listado
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="h-full min-h-[260px] bg-gray-200">
              <img src={selectedProposal.image} alt={selectedProposal.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 leading-relaxed">{selectedProposal.description}</p>

              <div className="mt-5 space-y-3 text-sm text-gray-700">
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500" />Barrio: {selectedProposal.neighborhood}</p>
                <p className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-500" />Personas beneficiadas: {selectedProposal.peopleBenefited?.toLocaleString() || 'N/D'}</p>
                <p className="flex items-center gap-2"><Heart className="w-4 h-4 text-gray-500" />Apoyos actuales: {selectedProposal.votes}</p>
              </div>

              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                Verifica la informacion antes de votar. Este flujo incluye confirmacion final por seguridad.
              </div>

              <button
                onClick={requestVoteConfirmation}
                disabled={!votingEnabled || isCountdownFinished || votedProposals.has(selectedProposal.id)}
                className={`mt-5 w-full rounded-lg transition-colors font-bold flex items-center justify-center gap-2 ${
                  !votingEnabled || isCountdownFinished
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed px-4 py-2'
                    : votedProposals.has(selectedProposal.id)
                    ? 'bg-emerald-600 text-white cursor-default px-4 py-3 text-base'
                    : 'bg-rose-600 text-white hover:bg-rose-700 px-4 py-3 text-base shadow-md'
                }`}
              >
                {!votingEnabled ? (
                  <Lock className="w-4 h-4" />
                ) : votedProposals.has(selectedProposal.id) ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Vote className="w-5 h-5" />
                )}
                {!votingEnabled
                  ? 'Disponible solo en Votacion'
                  : isCountdownFinished
                  ? 'Periodo de votacion finalizado'
                  : votedProposals.has(selectedProposal.id)
                  ? 'Voto registrado'
                  : 'Emitir voto con confirmacion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {votingProposals.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay propuestas abiertas a votacion</h3>
          <p className="text-gray-600">Intenta ajustar la busqueda o espera la apertura de la urna.</p>
        </div>
      )}

      {showVoteConfirmation && selectedProposal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-rose-200 shadow-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Confirmar voto</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Estas por votar por <span className="font-semibold">{selectedProposal.title}</span>. Esta accion no se puede revertir en esta sesion.
                </p>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowVoteConfirmation(false)}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmVote}
                disabled={isSubmittingVote}
                className="flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                {isSubmittingVote ? 'Registrando...' : 'Si, estoy seguro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
