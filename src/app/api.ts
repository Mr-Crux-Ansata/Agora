import type { Proposal, ProposalState } from './App';

type RawProposal = {
  id: string;
  cycle_id: string;
  title: string;
  description: string;
  lifecycle_stage: string;
  institutional_status: string;
  participation_status: string;
  selection_status: string;
  execution_status: string;
  budget_requested: number;
  people_benefited_estimated: number | null;
  created_at: string;
  category_name: string | null;
  neighborhood_name: string | null;
  author_name: string | null;
  votes_count: number;
  comments_count: number;
};

const DEFAULT_API_BASE_URL = 'http://localhost:4000';

const API_BASE_URL = ((import.meta as ImportMeta & { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

const buildUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    ...init
  });

  if (!response.ok) {
    const fallback = `Request failed: ${response.status}`;
    try {
      const payload = await response.json();
      throw new Error(payload?.message || fallback);
    } catch {
      throw new Error(fallback);
    }
  }

  return (await response.json()) as T;
};

const imageByCategory = (category: string | null) => {
  const key = (category || '').toLowerCase();
  if (key.includes('infra')) {
    return 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=800&auto=format&fit=crop';
  }
  if (key.includes('park') || key.includes('recre')) {
    return 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop';
  }
  if (key.includes('educ')) {
    return 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop';
  }
  if (key.includes('environ')) {
    return 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&auto=format&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop';
};

const toProposalState = (row: RawProposal): ProposalState => {
  if (row.execution_status === 'in_progress') return 'in_progress';
  if (row.execution_status === 'delayed') return 'delayed';
  if (row.execution_status === 'completed') return 'completed';
  if (row.selection_status === 'winning_project') return 'winning_project';
  if (row.participation_status === 'voting_open') return 'open_for_voting';
  if (row.participation_status === 'discussion_open') return 'in_deliberation';
  if (row.institutional_status === 'rejected' || row.lifecycle_stage === 'rejected') return 'rejected';

  if (row.lifecycle_stage === 'draft') return 'draft';
  if (row.lifecycle_stage === 'in_preparation') return 'in_preparation';
  if (row.lifecycle_stage === 'officially_submitted') return 'officially_submitted';
  if (row.lifecycle_stage === 'under_institutional_review') return 'under_institutional_review';
  if (row.lifecycle_stage === 'open_for_voting') return 'open_for_voting';

  return 'approved';
};

const mapProposal = (row: RawProposal): Proposal => {
  const category = row.category_name || 'Community';
  const author = row.author_name || 'Ciudadania';

  return {
    id: row.id,
    cycleId: row.cycle_id,
    title: row.title,
    description: row.description,
    author,
    authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(author)}`,
    neighborhood: row.neighborhood_name || 'N/D',
    category,
    budget: Number(row.budget_requested || 0),
    votes: Number(row.votes_count || 0),
    comments: Number(row.comments_count || 0),
    state: toProposalState(row),
    isWinningProject: row.selection_status === 'winning_project',
    createdAt: row.created_at,
    image: imageByCategory(category),
    peopleBenefited: row.people_benefited_estimated ?? undefined
  };
};

export const apiClient = {
  baseUrl: API_BASE_URL,

  async getProposals(): Promise<Proposal[]> {
    const rows = await requestJson<RawProposal[]>('/api/proposals');
    return rows.map(mapProposal);
  },

  async voteForProposal(input: { proposalId: string; cycleId: string; voterId: string; clientFingerprint?: string }): Promise<void> {
    await requestJson(`/api/proposals/${input.proposalId}/votes`, {
      method: 'POST',
      body: JSON.stringify({
        cycleId: input.cycleId,
        voterId: input.voterId,
        clientFingerprint: input.clientFingerprint || 'web-client'
      })
    });
  }
};
