import {
  MapPin,
  MessageCircle,
  Vote,
  TrendingUp,
  Lock,
  Check,
  ArrowRight,
  Heart,
  Clock,
  CheckCircle2,
  Building2,
  Users,
  Search,
  ChevronRight,
  Compass,
  PenLine,
  ClipboardCheck,
  MessageSquare,
  CheckSquare,
  FileText,
  Bot
} from 'lucide-react';
import { ParticipationPhase, Proposal } from '../App';

type Page = 'home' | 'map' | 'proposals' | 'discussions' | 'impact';

interface HomeProps {
  proposals: Proposal[];
  onNavigate: (page: Page) => void;
  onCreateProposal?: () => void;
  currentPhase: ParticipationPhase;
  onSetPhase: (phase: ParticipationPhase) => void;
}

export default function Home({ proposals, onNavigate, onCreateProposal, currentPhase, onSetPhase }: HomeProps) {
  const phases: { id: ParticipationPhase; num: string; title: string; help: string; color: string; activeBg: string; activeBorder: string; activeText: string; icon: React.ReactNode }[] = [
    { id: 'discovery',                   num: '1', title: 'Discovery',              help: 'Explora necesidades y proyectos de tu zona', color: 'from-blue-500 to-cyan-500',     activeBg: 'bg-blue-50',    activeBorder: 'border-blue-500',   activeText: 'text-blue-700',   icon: <Compass className="w-5 h-5" /> },
    { id: 'proposal_submission',         num: '2', title: 'Proposal Submission',    help: 'Registro formal de propuestas ciudadanas',   color: 'from-violet-500 to-purple-600', activeBg: 'bg-violet-50',  activeBorder: 'border-violet-500', activeText: 'text-violet-700', icon: <PenLine className="w-5 h-5" /> },
    { id: 'institutional_evaluation',    num: '3', title: 'Institutional Evaluation', help: 'Revision tecnica, legal y presupuestal',    color: 'from-amber-500 to-orange-500',  activeBg: 'bg-amber-50',   activeBorder: 'border-amber-500',  activeText: 'text-amber-700',  icon: <ClipboardCheck className="w-5 h-5" /> },
    { id: 'community_deliberation',      num: '4', title: 'Community Deliberation', help: 'Debate publico y mejoras de propuestas',      color: 'from-teal-500 to-emerald-500',  activeBg: 'bg-teal-50',    activeBorder: 'border-teal-500',   activeText: 'text-teal-700',   icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'voting',                      num: '5', title: 'Voting',                 help: 'Votacion abierta con reglas de elegibilidad', color: 'from-pink-500 to-rose-500',     activeBg: 'bg-pink-50',    activeBorder: 'border-pink-500',   activeText: 'text-pink-700',   icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'results_publication',         num: '6', title: 'Results Publication',    help: 'Publicacion de resultados y dictamen',       color: 'from-indigo-500 to-violet-600', activeBg: 'bg-indigo-50',  activeBorder: 'border-indigo-500',  activeText: 'text-indigo-700', icon: <Check className="w-5 h-5" /> },
    { id: 'continuous_project_tracking', num: '7', title: 'Continuous Tracking',    help: 'Seguimiento permanente de obras',            color: 'from-slate-500 to-slate-700',   activeBg: 'bg-slate-100',  activeBorder: 'border-slate-500',   activeText: 'text-slate-700',  icon: <TrendingUp className="w-5 h-5" /> }
  ];

  const activePhase = phases.find(p => p.id === currentPhase)!;

  const phaseLabel: Record<ParticipationPhase, string> = {
    discovery: 'Discovery',
    proposal_submission: 'Proposal Submission',
    institutional_evaluation: 'Institutional Evaluation',
    community_deliberation: 'Community Deliberation',
    voting: 'Voting',
    results_publication: 'Results Publication',
    continuous_project_tracking: 'Continuous Project Tracking'
  };

  const canCreateProposal = currentPhase === 'proposal_submission';
  const canDeliberate = currentPhase === 'community_deliberation';
  const canVote = currentPhase === 'voting';

  const nearbyProposals = proposals.slice(0, 2).map((p, index) => ({
    id: p.id,
    title: p.title,
    neighborhood: p.neighborhood,
    distance: `${(0.3 + index * 0.4).toFixed(1)} km`,
    votes: p.votes,
    comments: p.comments,
    status: p.status,
    daysLeft: p.daysLeft,
    progress: p.state === 'in_progress' ? 65 : undefined,
    completedDate: p.state === 'completed' ? 'hace 2 meses' : undefined,
    image: p.image
  }));

  const stats = [
    { label: 'Proyectos activos', value: '24',    icon: Building2, grad: 'from-purple-500 to-violet-600' },
    { label: 'Participando',      value: '12.5K', icon: Users,     grad: 'from-fuchsia-500 to-pink-600'  },
    { label: 'Votos totales',     value: '8,342', icon: Vote,      grad: 'from-violet-500 to-indigo-600' },
    { label: 'Invertido',         value: '$2.4M', icon: TrendingUp,grad: 'from-emerald-500 to-teal-600'  }
  ];

  // Action cards config
  const actionCards = [
    {
      key: 'map',
      icon: <MapPin className="w-10 h-10" />,
      title: 'Explorar mapa',
      desc: 'Obras, proyectos y actividad cerca de ti',
      headerBg: 'bg-sky-600',
      decoration: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 60%)',
      enabled: true,
      lockedMsg: '',
      onClick: () => onNavigate('map')
    },
    {
      key: 'propose',
      icon: <FileText className="w-10 h-10" />,
      title: 'Crear propuesta',
      desc: 'Con formulario guiado, voz e IA',
      headerBg: 'bg-indigo-600',
      decoration: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 60%)',
      enabled: canCreateProposal,
      lockedMsg: 'Proposal Submission',
      onClick: onCreateProposal
    },
    {
      key: 'deliberate',
      icon: <MessageSquare className="w-10 h-10" />,
      title: 'Deliberar',
      desc: 'Conversa y mejora propuestas',
      headerBg: 'bg-emerald-600',
      decoration: 'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 60%)',
      enabled: canDeliberate,
      lockedMsg: 'Community Deliberation',
      onClick: () => onNavigate('discussions')
    },
    {
      key: 'vote',
      icon: <Vote className="w-10 h-10" />,
      title: 'Votar',
      desc: 'Elige proyectos para tu comunidad',
      headerBg: 'bg-orange-500',
      decoration: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.15) 0%, transparent 60%)',
      enabled: canVote,
      lockedMsg: 'Voting',
      onClick: () => onNavigate('proposals')
    }
  ];

  return (
    <div className="min-h-screen bg-transparent">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-fuchsia-600 to-pink-500 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-2xl">
            <span className="motion-rise inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <span className={`w-2 h-2 rounded-full bg-gradient-to-br ${activePhase.color}`} />
              Fase activa: {phaseLabel[currentPhase]}
            </span>
            <h1 className="motion-rise-2 text-4xl sm:text-5xl font-bold leading-tight mb-3 tracking-tight">
              Tu barrio,<br />tu decision
            </h1>
            <p className="motion-rise-3 text-lg text-purple-100">
              Elige la fase en la que estas, luego usa las herramientas que se habiliten.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* ── STATS ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 -mt-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="surface-card card-lift rounded-2xl p-4 sm:p-5 flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.grad} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-none">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </section>

        {/* ── FASE STEPPER ── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-600 text-white text-sm font-bold">1</span>
            <h2 className="app-heading-lg">Elige la fase del ciclo</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {phases.map((phase, i) => {
              const active = phase.id === currentPhase;
              return (
                <button
                  key={phase.id}
                  onClick={() => onSetPhase(phase.id)}
                    className={`card-lift relative text-left rounded-2xl border-2 p-4 transition-all ${
                    active
                      ? `${phase.activeBorder} ${phase.activeBg} shadow-md`
                      : 'border-transparent bg-white shadow-sm hover:shadow-md hover:border-gray-300'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${phase.color} flex items-center justify-center text-white font-bold text-sm mb-3`}>
                    {active ? <Check className="w-5 h-5" /> : phase.icon}
                  </div>
                  <p className={`font-bold text-sm ${active ? phase.activeText : 'text-gray-800'}`}>{phase.title}</p>
                  <p className={`text-xs mt-1 leading-snug ${active ? phase.activeText + '/80' : 'text-gray-500'}`}>{phase.help}</p>
                  {i < phases.length - 1 && (
                    <ChevronRight className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 z-10" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── ACCIONES ── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-600 text-white text-sm font-bold">2</span>
            <h2 className="app-heading-lg">Usa las funciones de esta fase</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {actionCards.map((card) => (
              <button
                key={card.key}
                onClick={card.enabled ? card.onClick : undefined}
                disabled={!card.enabled}
                className={`card-lift w-full text-left rounded-2xl border overflow-hidden transition-all ${
                  card.enabled
                    ? 'border-gray-200 bg-white hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                    : 'border-gray-200 bg-white cursor-not-allowed'
                }`}
              >
                {/* Visual header */}
                <div
                  className={`relative h-28 flex items-center justify-center ${card.enabled ? card.headerBg : 'bg-gray-200'}`}
                  style={{ backgroundImage: card.enabled ? card.decoration : undefined }}
                >
                  {/* Decorative circles */}
                  <div className="absolute bottom-0 right-0 w-16 h-16 rounded-full bg-black/10 translate-x-4 translate-y-4" />
                  <div className="absolute top-0 left-0 w-10 h-10 rounded-full bg-white/10 -translate-x-3 -translate-y-3" />
                  <div className={`relative ${card.enabled ? 'text-white' : 'text-gray-400'}`}>
                    {card.enabled ? card.icon : <Lock className="w-10 h-10" />}
                  </div>
                </div>
                {/* Text body */}
                <div className="p-4">
                  <p className={`font-semibold text-sm ${card.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                    {card.title}
                  </p>
                  <p className={`text-xs mt-1 leading-snug ${card.enabled ? 'text-gray-500' : 'text-gray-400'}`}>
                    {card.enabled ? card.desc : `Disponible en: ${card.lockedMsg}`}
                  </p>
                  {card.enabled && (
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gray-400">
                      Abrir <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── GOVERNANCE FLOW ── */}
        <section className="surface-card rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="app-heading-lg mb-1">Flujo Institucional y de Gobernanza</h3>
            <p className="app-subtle text-sm">Solo una fase global puede estar activa al mismo tiempo. Las transiciones de propuestas siguen reglas procedimentales y auditables.</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Fases Globales</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Discovery {'>'} Proposal Submission {'>'} Institutional Evaluation {'>'} Community Deliberation {'>'} Voting {'>'} Results Publication {'>'} Continuous Project Tracking
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Estados de Propuesta</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Draft {'>'} Submitted {'>'} Under Review {'>'} Approved/Rejected {'>'} In Deliberation {'>'} Open for Voting {'>'} Winning Project {'>'} In Progress {'>'} Completed
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-fuchsia-200 bg-fuchsia-50 p-4">
            <p className="text-sm font-semibold text-fuchsia-900 mb-1">Transparencia de Evaluacion Institucional</p>
            <p className="text-sm text-fuchsia-800">
              Las propuestas rechazadas no desaparecen: el sistema publica razon de rechazo, retroalimentacion tecnica y sugerencias de correccion para reenvio.
            </p>
          </div>
        </section>

        {/* ── CAPA CONTINUA ── */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-6">
          <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-xs font-semibold tracking-widest uppercase text-blue-200 mb-1">Siempre activa</p>
              <h3 className="text-xl font-bold mb-1">Capa de Seguimiento Continuo</h3>
              <p className="text-blue-100 text-sm">Obras en progreso, evidencia publica, cronogramas, reportes ciudadanos e inversion historica por barrio.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onNavigate('impact')}
                className="px-4 py-2 bg-white text-indigo-700 font-semibold text-sm rounded-xl hover:bg-blue-50 transition-colors"
              >
                Ver impacto
              </button>
              <button
                onClick={() => onNavigate('map')}
                className="px-4 py-2 bg-white/20 text-white font-semibold text-sm rounded-xl hover:bg-white/30 transition-colors"
              >
                Ver mapa
              </button>
            </div>
          </div>
        </section>

        {/* ── PROYECTOS CERCANOS + ASISTENTE ── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="app-heading-lg">Proyectos cercanos</h3>
              <button onClick={() => onNavigate('proposals')} className="text-purple-600 hover:text-purple-700 font-semibold text-sm flex items-center gap-1">
                Ver todos <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {nearbyProposals.map((proposal) => (
                <div key={proposal.id} className="surface-card card-lift rounded-2xl overflow-hidden flex flex-col sm:flex-row">
                  <div className="w-full sm:w-36 h-36 flex-shrink-0">
                    <img src={proposal.image} alt={proposal.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-bold text-gray-900">{proposal.title}</p>
                        {proposal.state === 'completed' && (
                          <span className="shrink-0 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Completado
                          </span>
                        )}
                        {proposal.state === 'in_progress' && (
                          <span className="shrink-0 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">En progreso</span>
                        )}
                        {proposal.state === 'open_for_voting' && (
                          <span className="shrink-0 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">Votacion</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {proposal.neighborhood} • {proposal.distance}
                      </p>
                    </div>
                    {proposal.state === 'open_for_voting' && (
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Heart className="w-4 h-4 text-pink-500" />{proposal.votes}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4 text-blue-500" />{proposal.comments}</span>
                        {proposal.daysLeft && <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-amber-500" />{proposal.daysLeft} dias</span>}
                      </div>
                    )}
                    {proposal.state === 'in_progress' && proposal.progress && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Progreso</span><span>{proposal.progress}%</span></div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-1.5 rounded-full" style={{ width: `${proposal.progress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="surface-card rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-purple-600 to-fuchsia-600 p-5 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold">Asistente Civico IA</p>
                    <p className="text-xs text-purple-200">Siempre disponible</p>
                  </div>
                </div>
                <p className="text-sm text-purple-100">Te ayuda a redactar propuestas, entender los pasos y encontrar proyectos cerca de ti.</p>
              </div>
              <div className="bg-white p-4">
                <button className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-fuchsia-700 transition-colors">
                  Iniciar chat
                </button>
              </div>
            </div>

            <div className="surface-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-5 h-5 text-purple-600" />
                <h4 className="font-bold text-gray-900">No sabes por donde empezar?</h4>
              </div>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2"><span className="shrink-0 w-5 h-5 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>Elige la fase en la que esta tu comunidad</li>
                <li className="flex items-start gap-2"><span className="shrink-0 w-5 h-5 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>Revisa que herramientas estan activas</li>
                <li className="flex items-start gap-2"><span className="shrink-0 w-5 h-5 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>Haz una accion y comparte con tu vecino/a</li>
              </ol>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
