import { useEffect, useState } from 'react';
import Layout from './components/Layout';
import Home from './components/Home';
import MapView from './components/MapView';
import Proposals from './components/Proposals';
import VotingSection from './components/VotingSection';
import ResultsSection from './components/ResultsSection';
import Discussions from './components/Discussions';
import Impact from './components/Impact';
import AuthScreen from './components/AuthScreen';
import ProposalForumPage from './components/ProposalForumPage';
import { apiClient } from './api';

type Page = 'home' | 'map' | 'proposals' | 'voting' | 'results' | 'discussions' | 'impact' | 'proposal_forum';
export type ParticipationPhase =
  | 'discovery'
  | 'proposal_submission'
  | 'institutional_evaluation'
  | 'community_deliberation'
  | 'voting'
  | 'results_publication';

export type ProposalState =
  | 'draft'
  | 'community_preview'
  | 'in_preparation'
  | 'officially_submitted'
  | 'under_institutional_review'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'in_deliberation'
  | 'open_for_voting'
  | 'winning_project'
  | 'in_progress'
  | 'delayed'
  | 'completed';

export interface Proposal {
  id: string;
  cycleId?: string;
  title: string;
  description: string;
  author: string;
  authorAvatar: string;
  neighborhood: string;
  category: string;
  budget: number;
  votes: number;
  comments: number;
  state: ProposalState;
  isWinningProject?: boolean;
  rejectionReason?: 'exceeds_budget_limit' | 'outside_jurisdiction' | 'technical_infeasibility' | 'duplicate_proposal';
  technicalFeedback?: string;
  suggestedModifications?: string;
  daysLeft?: number;
  createdAt: string;
  image: string;
  peopleBenefited?: number;
}

export type DraftForumType = 'discussion' | 'suggestion' | 'question' | 'local_context';

export interface DraftForumEntry {
  id: string;
  type: DraftForumType;
  author: string;
  text: string;
  createdAt: string;
}

export interface DraftWorkspaceDraft {
  title: string;
  description: string;
  neighborhood: string;
  image: string;
  territorialReference: string;
  contextualInfo: string;
}

const initialProposals: Proposal[] = [
  {
    id: '1',
    title: 'Renovacion del Parque Comunitario',
    description: 'Renovar el parque local con nuevos juegos infantiles, senderos y areas verdes para el disfrute de las familias.',
    author: 'Maria Santos',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    neighborhood: 'Centro',
    category: 'Parques y Recreacion',
    budget: 150000,
    votes: 342,
    comments: 28,
    state: 'open_for_voting',
    daysLeft: 12,
    createdAt: '2026-05-10',
    image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop',
    peopleBenefited: 5000
  },
  {
    id: '2',
    title: 'Nuevas Ciclovias en Avenida Principal',
    description: 'Instalar ciclovias protegidas para mejorar la seguridad de ciclistas y fomentar movilidad sostenible en el centro.',
    author: 'John Chen',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    neighborhood: 'Centro',
    category: 'Infraestructura',
    budget: 250000,
    votes: 521,
    comments: 45,
    state: 'in_progress',
    isWinningProject: true,
    createdAt: '2026-04-20',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
    peopleBenefited: 8000
  },
  {
    id: '3',
    title: 'Iniciativa de Huertos Urbanos',
    description: 'Crear huertos comunitarios para que residentes cultiven vegetales y fortalezcan la convivencia vecinal.',
    author: 'Ana Rodriguez',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    neighborhood: 'Distrito Sur',
    category: 'Medio Ambiente',
    budget: 75000,
    votes: 287,
    comments: 34,
    state: 'completed',
    isWinningProject: true,
    createdAt: '2026-03-15',
    image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&auto=format&fit=crop',
    peopleBenefited: 300
  },
  {
    id: '4',
    title: 'Actualizacion Tecnologica de Biblioteca Publica',
    description: 'Modernizar la biblioteca con nuevas computadoras, internet de alta velocidad y recursos digitales para todas las edades.',
    author: 'David Kim',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    neighborhood: 'Zona Este',
    category: 'Educacion',
    budget: 200000,
    votes: 456,
    comments: 52,
    state: 'delayed',
    isWinningProject: true,
    createdAt: '2026-05-01',
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop',
    peopleBenefited: 10000
  },
  {
    id: '5',
    title: 'Mejora del Alumbrado Publico',
    description: 'Instalar luminarias LED eficientes para mejorar la seguridad y reducir costos de energia.',
    author: 'Sofia Martinez',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
    neighborhood: 'Zona Oeste',
    category: 'Infraestructura',
    budget: 120000,
    votes: 198,
    comments: 16,
    state: 'rejected',
    rejectionReason: 'outside_jurisdiction',
    technicalFeedback: 'La zona de ejecucion propuesta corresponde a una vialidad estatal fuera del ambito municipal.',
    suggestedModifications: 'Redefinir el poligono del proyecto a vialidades bajo jurisdiccion municipal y volver a enviar.',
    daysLeft: 8,
    createdAt: '2026-05-12',
    image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&auto=format&fit=crop',
    peopleBenefited: 3000
  },
  {
    id: '6',
    title: 'Ampliacion del Centro Comunitario',
    description: 'Ampliar el centro comunitario con salas multiproposito para clases, eventos y encuentros vecinales.',
    author: 'Michael Brown',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    neighborhood: 'Lomas Norte',
    category: 'Comunidad',
    budget: 350000,
    votes: 612,
    comments: 78,
    state: 'rejected',
    rejectionReason: 'exceeds_budget_limit',
    technicalFeedback: 'El costo estimado supera el techo presupuestal aprobado para esta convocatoria.',
    suggestedModifications: 'Dividir el proyecto en etapas y presentar una version ajustada al limite de presupuesto.',
    daysLeft: 15,
    createdAt: '2026-05-05',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop',
    peopleBenefited: 15000
  }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<ParticipationPhase>('discovery');
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [workspaceDrafts, setWorkspaceDrafts] = useState<Record<string, DraftWorkspaceDraft>>({});
  const [forumEntries, setForumEntries] = useState<Record<string, DraftForumEntry[]>>({});
  const [forumType, setForumType] = useState<Record<string, DraftForumType>>({});
  const [forumText, setForumText] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const resultsEnabled = currentPhase === 'results_publication';
  const proposalsEnabled = [
    'proposal_submission',
    'institutional_evaluation',
    'community_deliberation',
    'voting'
  ].includes(currentPhase);

  useEffect(() => {
    const loadProposals = async () => {
      try {
        const rows = await apiClient.getProposals();
        setProposals(rows);
        setApiError(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo cargar la API.';
        setApiError(message);
      }
    };

    loadProposals();
  }, []);

  const navigateWithPhase = (page: Page) => {
    if (page === 'proposals' && !proposalsEnabled) {
      return;
    }
    if (page === 'voting' && currentPhase !== 'voting') {
      return;
    }
    if (page === 'results' && !resultsEnabled) {
      return;
    }
    setCurrentPage(page);
  };

  const openCreateProposal = () => {
    if (currentPhase !== 'proposal_submission') return;
    setShowCreateProposal(true);
  };

  const openProposalForum = (proposalId: string) => {
    setSelectedProposalId(proposalId);
    setCurrentPage('proposal_forum');
  };

  const closeProposalForum = () => {
    setCurrentPage('proposals');
  };

  const addProposal = (proposal: Omit<Proposal, 'id' | 'votes' | 'comments' | 'state' | 'daysLeft' | 'createdAt'>) => {
    const newProposal: Proposal = {
      ...proposal,
      id: Date.now().toString(),
      votes: 0,
      comments: 0,
      state: 'draft',
      daysLeft: 30,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProposals(prev => [newProposal, ...prev]);
  };

  const updateProposalContent = (
    proposalId: string,
    updates: Partial<Pick<Proposal, 'title' | 'description' | 'neighborhood' | 'image' | 'category' | 'budget' | 'peopleBenefited'>>
  ) => {
    setProposals((prev) =>
      prev.map((proposal) => (proposal.id === proposalId ? { ...proposal, ...updates } : proposal))
    );
  };

  const transitionProposalState = (proposalId: string, nextState: ProposalState) => {
    const allowedTransitions: Record<ProposalState, ProposalState[]> = {
      draft: ['community_preview'],
      community_preview: ['in_preparation'],
      in_preparation: ['officially_submitted'],
      officially_submitted: ['under_institutional_review'],
      under_institutional_review: ['approved', 'rejected', 'in_deliberation'],
      submitted: ['under_review'],
      under_review: ['approved', 'rejected'],
      approved: ['in_deliberation', 'open_for_voting'],
      rejected: [],
      in_deliberation: ['open_for_voting'],
      open_for_voting: ['winning_project'],
      winning_project: ['in_progress'],
      in_progress: ['completed', 'delayed'],
      delayed: ['in_progress', 'completed'],
      completed: []
    };

    setProposals((prev) =>
      prev.map((proposal) => {
        if (proposal.id !== proposalId) return proposal;
        const canTransition = allowedTransitions[proposal.state]?.includes(nextState);
        if (!canTransition) return proposal;

        return {
          ...proposal,
          state: nextState
        };
      })
    );
  };

  const getWorkspaceDraft = (proposalId: string): DraftWorkspaceDraft => {
    const proposal = proposals.find((item) => item.id === proposalId);
    if (!proposal) {
      return {
        title: '',
        description: '',
        neighborhood: '',
        image: '',
        territorialReference: '',
        contextualInfo: ''
      };
    }

    return (
      workspaceDrafts[proposalId] || {
        title: proposal.title,
        description: proposal.description,
        neighborhood: proposal.neighborhood,
        image: proposal.image,
        territorialReference: `Zona de referencia: ${proposal.neighborhood}`,
        contextualInfo: ''
      }
    );
  };

  const updateWorkspaceDraftField = (proposalId: string, field: keyof DraftWorkspaceDraft, value: string) => {
    const current = getWorkspaceDraft(proposalId);
    setWorkspaceDrafts((prev) => ({
      ...prev,
      [proposalId]: {
        ...current,
        [field]: value
      }
    }));
  };

  const saveDraftChanges = (proposalId: string) => {
    const draft = getWorkspaceDraft(proposalId);
    updateProposalContent(proposalId, {
      title: draft.title,
      description: draft.description,
      neighborhood: draft.neighborhood,
      image: draft.image
    });
  };

  const applyAiWritingAssist = (proposalId: string) => {
    const draft = getWorkspaceDraft(proposalId);
    const improved = `${draft.description.trim()}\n\nVersion mejorada con IA: Esta propuesta prioriza evidencia territorial, impacto comunitario medible y viabilidad institucional.`;
    updateWorkspaceDraftField(proposalId, 'description', improved);
  };

  const addForumEntry = (proposalId: string) => {
    const text = (forumText[proposalId] || '').trim();
    if (!text) return;

    const type = forumType[proposalId] || 'discussion';
    const nextEntry: DraftForumEntry = {
      id: `${proposalId}-${Date.now()}`,
      type,
      author: 'Ciudadania',
      text,
      createdAt: new Date().toISOString()
    };

    setForumEntries((prev) => ({
      ...prev,
      [proposalId]: [nextEntry, ...(prev[proposalId] || [])]
    }));
    setForumText((prev) => ({ ...prev, [proposalId]: '' }));
  };

  const getProposalForumEntries = (proposalId: string) => forumEntries[proposalId] || [];

  const getNeighborhoodInterest = (proposalId: string) => {
    const proposal = proposals.find((item) => item.id === proposalId);
    if (!proposal) return 0;
    const forumCount = getProposalForumEntries(proposalId).length;
    return proposal.votes + proposal.comments + forumCount * 3;
  };

  const castVote = async (proposalId: string) => {
    const proposal = proposals.find((item) => item.id === proposalId);
    if (!proposal?.cycleId) {
      throw new Error('La propuesta no tiene cycleId para registrar voto.');
    }

    const voterId = localStorage.getItem('agoraVoterId');
    if (!voterId) {
      throw new Error('Falta agoraVoterId en localStorage para emitir voto.');
    }

    await apiClient.voteForProposal({
      proposalId,
      cycleId: proposal.cycleId,
      voterId
    });

    const rows = await apiClient.getProposals();
    setProposals(rows);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home
            proposals={proposals}
            onNavigate={navigateWithPhase}
            onCreateProposal={openCreateProposal}
            currentPhase={currentPhase}
            onSetPhase={setCurrentPhase}
          />
        );
      case 'map':
        return <MapView proposals={proposals} currentPhase={currentPhase} />;
      case 'proposals':
        if (!proposalsEnabled) {
          return (
            <Home
              proposals={proposals}
              onNavigate={navigateWithPhase}
              onCreateProposal={openCreateProposal}
              currentPhase={currentPhase}
              onSetPhase={setCurrentPhase}
            />
          );
        }
        return (
          <>
            {apiError && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  API no disponible ({apiError}). Se muestran datos locales.
                </div>
              </div>
            )}
            <Proposals
              proposals={proposals}
              currentPhase={currentPhase}
              onProposalStateChange={transitionProposalState}
              onOpenProposalForum={openProposalForum}
              getNeighborhoodInterest={getNeighborhoodInterest}
              onOpenVotingSection={() => setCurrentPage('voting')}
              onOpenCreateProposal={openCreateProposal}
            />
          </>
        );
      case 'voting':
        return <VotingSection proposals={proposals} currentPhase={currentPhase} onCastVote={castVote} />;
      case 'results':
        if (!resultsEnabled) {
          return (
            <Home
              proposals={proposals}
              onNavigate={navigateWithPhase}
              onCreateProposal={openCreateProposal}
              currentPhase={currentPhase}
              onSetPhase={setCurrentPhase}
            />
          );
        }
        return <ResultsSection proposals={proposals} />;
      case 'proposal_forum': {
        const selectedProposal = proposals.find((proposal) => proposal.id === selectedProposalId) || null;
        return (
          <ProposalForumPage
            proposal={selectedProposal}
            currentPhase={currentPhase}
            onBack={closeProposalForum}
            onProposalStateChange={transitionProposalState}
            workspaceDraft={selectedProposal ? getWorkspaceDraft(selectedProposal.id) : null}
            forumEntries={selectedProposal ? getProposalForumEntries(selectedProposal.id) : []}
            forumType={selectedProposal ? forumType[selectedProposal.id] || 'discussion' : 'discussion'}
            forumText={selectedProposal ? forumText[selectedProposal.id] || '' : ''}
            neighborhoodInterest={selectedProposal ? getNeighborhoodInterest(selectedProposal.id) : 0}
            onDraftFieldChange={updateWorkspaceDraftField}
            onSaveDraft={saveDraftChanges}
            onAiAssist={applyAiWritingAssist}
            onForumTypeChange={(proposalId, type) => setForumType((prev) => ({ ...prev, [proposalId]: type }))}
            onForumTextChange={(proposalId, text) => setForumText((prev) => ({ ...prev, [proposalId]: text }))}
            onAddForumEntry={addForumEntry}
          />
        );
      }
      case 'discussions':
        return <Discussions currentPhase={currentPhase} />;
      case 'impact':
        return <Impact proposals={proposals} />;
      default:
        return (
          <Home
            proposals={proposals}
            onNavigate={navigateWithPhase}
            onCreateProposal={openCreateProposal}
            currentPhase={currentPhase}
            onSetPhase={setCurrentPhase}
          />
        );
    }
  };

  return (
    <>
      {!isAuthenticated ? (
        <AuthScreen
          onAuth={(user) => {
            setCurrentUser(user);
            setIsAuthenticated(true);
          }}
        />
      ) : (
        <Layout currentPage={currentPage} currentPhase={currentPhase} resultsEnabled={resultsEnabled} onNavigate={navigateWithPhase} showCreateProposal={showCreateProposal} setShowCreateProposal={setShowCreateProposal} onAddProposal={addProposal}>
          {renderPage()}
        </Layout>
      )}
    </>
  );
}