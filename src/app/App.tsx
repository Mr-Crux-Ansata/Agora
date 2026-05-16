import { useState } from 'react';
import Layout from './components/Layout';
import Home from './components/Home';
import MapView from './components/MapView';
import Proposals from './components/Proposals';
import Discussions from './components/Discussions';
import Impact from './components/Impact';
import AuthScreen from './components/AuthScreen';

type Page = 'home' | 'map' | 'proposals' | 'discussions' | 'impact';
export type ParticipationPhase = 'discover' | 'propose' | 'evaluate' | 'deliberate' | 'vote';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar: string;
  neighborhood: string;
  category: string;
  budget: number;
  votes: number;
  comments: number;
  status: 'voting' | 'approved' | 'construction' | 'completed';
  daysLeft?: number;
  createdAt: string;
  image: string;
  peopleBenefited?: number;
}

const initialProposals: Proposal[] = [
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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<ParticipationPhase>('discover');

  const navigateWithPhase = (page: Page) => {
    setCurrentPage(page);
  };

  const openCreateProposal = () => {
    if (currentPhase !== 'propose') return;
    setShowCreateProposal(true);
  };

  const addProposal = (proposal: Omit<Proposal, 'id' | 'votes' | 'comments' | 'status' | 'daysLeft' | 'createdAt'>) => {
    const newProposal: Proposal = {
      ...proposal,
      id: Date.now().toString(),
      votes: 0,
      comments: 0,
      status: 'voting',
      daysLeft: 30,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProposals(prev => [newProposal, ...prev]);
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
        return <MapView />;
      case 'proposals':
        return <Proposals proposals={proposals} currentPhase={currentPhase} />;
      case 'discussions':
        return <Discussions currentPhase={currentPhase} />;
      case 'impact':
        return <Impact />;
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
        <Layout currentPage={currentPage} onNavigate={navigateWithPhase} showCreateProposal={showCreateProposal} setShowCreateProposal={setShowCreateProposal} onAddProposal={addProposal}>
          {renderPage()}
        </Layout>
      )}
    </>
  );
}