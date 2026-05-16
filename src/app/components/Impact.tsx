import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import {
  TreeDeciduous,
  Users,
  MapPin,
  Droplets,
  Zap,
  TrendingUp,
  Building2,
  Heart,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  MessageCircle,
  AlertCircle,
  Upload,
  Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Proposal, ProposalState } from '../App';

interface ImpactProps {
  proposals: Proposal[];
}

interface LifecycleItem {
  key: string;
  label: string;
  date: string;
  status: 'done' | 'in_progress' | 'pending';
}

interface FinancialIndicator {
  label: string;
  value: string;
  status: 'ok' | 'warning' | 'review';
}

interface InstitutionalEvidence {
  reports: string[];
  contracts: string[];
  audits: string[];
  technicalDocs: string[];
  publicExecutionEvidence: string[];
}

interface CompletedProjectExperience {
  id: string;
  proposalId?: string;
  title: string;
  finalStatus: string;
  completionDate: string;
  executionDuration: string;
  neighborhood: string;
  district: string;
  coordinates: { x: number; y: number; lat: string; lng: string };
  timeline: LifecycleItem[];
  visualEvidence: {
    beforePhoto: string;
    duringPhoto: string;
    afterPhoto: string;
    videos: string[];
    publicDocs: string[];
    gallery: string[];
  };
  impactMetrics: {
    peopleBenefited: number;
    rehabilitatedAreas: number;
    treesPlanted: number;
    infrastructureInstalled: number;
    environmentalImprovements: string;
    accessibilityImprovements: string;
  };
  budget: {
    approved: number;
    executed: number;
    indicators: FinancialIndicator[];
  };
  institutionalEvidence: InstitutionalEvidence;
  citizenParticipation: {
    totalVotes: number;
    engagementRate: string;
    comments: number;
    deliberationSessions: number;
    assemblies: number;
  };
  communityPosts: Array<{
    id: string;
    type: 'issue' | 'feedback' | 'update';
    author: string;
    date: string;
    text: string;
    status: string;
  }>;
}

const categoryData = [
  { name: 'Infrastructure', value: 8, color: '#3b82f6' },
  { name: 'Parks', value: 12, color: '#10b981' },
  { name: 'Education', value: 5, color: '#f59e0b' },
  { name: 'Environment', value: 7, color: '#8b5cf6' },
  { name: 'Health', value: 3, color: '#ec4899' }
];

const neighborhoodInvestment = [
  { neighborhood: 'Downtown', investment: 450 },
  { neighborhood: 'East Side', investment: 380 },
  { neighborhood: 'West End', investment: 320 },
  { neighborhood: 'North Hills', investment: 290 },
  { neighborhood: 'South District', investment: 260 }
];

const timelineData = [
  { month: 'Jan', projects: 2 },
  { month: 'Feb', projects: 3 },
  { month: 'Mar', projects: 5 },
  { month: 'Apr', projects: 4 },
  { month: 'May', projects: 7 }
];

const archivedCompletedProjects: CompletedProjectExperience[] = [
  {
    id: 'arch-1',
    title: 'Corredor Peatonal Centro Historico',
    finalStatus: 'Completado y auditado',
    completionDate: '2025-11-18',
    executionDuration: '8 meses',
    neighborhood: 'Centro',
    district: 'Distrito 1',
    coordinates: { x: 52, y: 34, lat: '19.4328', lng: '-99.1334' },
    timeline: [
      { key: 'proposal_creation', label: 'Creacion de propuesta', date: '2025-01-15', status: 'done' },
      { key: 'institutional_evaluation', label: 'Evaluacion institucional', date: '2025-02-03', status: 'done' },
      { key: 'deliberation', label: 'Deliberacion comunitaria', date: '2025-02-18', status: 'done' },
      { key: 'voting', label: 'Votacion ciudadana', date: '2025-03-10', status: 'done' },
      { key: 'approval', label: 'Aprobacion final', date: '2025-03-17', status: 'done' },
      { key: 'construction_start', label: 'Inicio de obra', date: '2025-04-02', status: 'done' },
      { key: 'milestone_1', label: 'Hito 1: demoliciones y nivelacion', date: '2025-06-01', status: 'done' },
      { key: 'milestone_2', label: 'Hito 2: mobiliario urbano', date: '2025-08-15', status: 'done' },
      { key: 'project_completion', label: 'Cierre de proyecto', date: '2025-11-18', status: 'done' }
    ],
    visualEvidence: {
      beforePhoto: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop',
      duringPhoto: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&auto=format&fit=crop',
      afterPhoto: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&auto=format&fit=crop',
      videos: [
        'Recorrido tecnico semanal - Semana 6',
        'Entrega de obra y activacion peatonal'
      ],
      publicDocs: [
        'Album fotografico georreferenciado',
        'Bitacora publica de obra',
        'Registro audiovisual ciudadano'
      ],
      gallery: [
        'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=900&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1521133573892-e44906baee46?w=900&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1494526585095-c41746248156?w=900&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=900&auto=format&fit=crop'
      ]
    },
    impactMetrics: {
      peopleBenefited: 18300,
      rehabilitatedAreas: 5400,
      treesPlanted: 94,
      infrastructureInstalled: 126,
      environmentalImprovements: 'Reduccion de isla de calor y aumento de sombra peatonal.',
      accessibilityImprovements: 'Cruces accesibles, rampas y guia podotactil en ejes principales.'
    },
    budget: {
      approved: 4200000,
      executed: 3985000,
      indicators: [
        { label: 'Publicacion de contratos', value: '100%', status: 'ok' },
        { label: 'Comprobacion documental', value: 'Completa', status: 'ok' },
        { label: 'Observaciones de auditoria', value: '2 menores', status: 'review' }
      ]
    },
    institutionalEvidence: {
      reports: ['Informe de cierre ejecutivo', 'Reporte de impacto territorial'],
      contracts: ['Contrato de obra publica OP-025-2025', 'Convenio de supervison tecnica'],
      audits: ['Auditoria municipal 2025-IV', 'Revision de transparencia ciudadana'],
      technicalDocs: ['Planos as-built', 'Memoria de calculo y especificaciones'],
      publicExecutionEvidence: ['Acta de entrega-recepcion', 'Cedula fotografica validada por comite vecinal']
    },
    citizenParticipation: {
      totalVotes: 12984,
      engagementRate: '74%',
      comments: 864,
      deliberationSessions: 7,
      assemblies: 4
    },
    communityPosts: [
      {
        id: 'c1',
        type: 'feedback',
        author: 'Comite Centro Vivo',
        date: '2026-02-04',
        text: 'La iluminacion peatonal mejoro la seguridad durante la noche.',
        status: 'Publicado'
      },
      {
        id: 'c2',
        type: 'issue',
        author: 'Vecino Calle Libertad',
        date: '2026-03-11',
        text: 'Se requiere mantenimiento de bancas en el tramo norte.',
        status: 'En revision municipal'
      }
    ]
  },
  {
    id: 'arch-2',
    title: 'Red de Senderos Verdes Interbarrial',
    finalStatus: 'Completado y en monitoreo',
    completionDate: '2025-09-30',
    executionDuration: '6 meses',
    neighborhood: 'Distrito Sur',
    district: 'Distrito 4',
    coordinates: { x: 35, y: 62, lat: '19.4012', lng: '-99.1550' },
    timeline: [
      { key: 'proposal_creation', label: 'Creacion de propuesta', date: '2025-01-05', status: 'done' },
      { key: 'institutional_evaluation', label: 'Evaluacion institucional', date: '2025-01-28', status: 'done' },
      { key: 'deliberation', label: 'Deliberacion comunitaria', date: '2025-02-14', status: 'done' },
      { key: 'voting', label: 'Votacion ciudadana', date: '2025-03-04', status: 'done' },
      { key: 'approval', label: 'Aprobacion final', date: '2025-03-11', status: 'done' },
      { key: 'construction_start', label: 'Inicio de obra', date: '2025-04-03', status: 'done' },
      { key: 'milestone_1', label: 'Hito 1: conectividad peatonal', date: '2025-05-20', status: 'done' },
      { key: 'milestone_2', label: 'Hito 2: arborizacion lineal', date: '2025-07-22', status: 'done' },
      { key: 'project_completion', label: 'Cierre de proyecto', date: '2025-09-30', status: 'done' }
    ],
    visualEvidence: {
      beforePhoto: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&auto=format&fit=crop',
      duringPhoto: 'https://images.unsplash.com/photo-1462392246754-28dfa2df8e6b?w=1200&auto=format&fit=crop',
      afterPhoto: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&auto=format&fit=crop',
      videos: ['Evolucion mensual de senderos', 'Testimonios de movilidad barrial'],
      publicDocs: ['Monitoreo de vegetacion', 'Panel comparativo antes-despues'],
      gallery: [
        'https://images.unsplash.com/photo-1432679963831-2dab49187847?w=900&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=900&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900&auto=format&fit=crop'
      ]
    },
    impactMetrics: {
      peopleBenefited: 9600,
      rehabilitatedAreas: 3100,
      treesPlanted: 167,
      infrastructureInstalled: 88,
      environmentalImprovements: 'Corredor de infiltracion pluvial y reduccion de escorrentia.',
      accessibilityImprovements: 'Senderos con pendiente accesible y descansos cada 120 metros.'
    },
    budget: {
      approved: 2950000,
      executed: 2864000,
      indicators: [
        { label: 'Ejecucion presupuestal', value: '97.1%', status: 'ok' },
        { label: 'Auditoria tecnica', value: 'Sin hallazgos criticos', status: 'ok' },
        { label: 'Transparencia de compras', value: 'Publicada', status: 'ok' }
      ]
    },
    institutionalEvidence: {
      reports: ['Informe final de movilidad activa', 'Evaluacion social post-obra'],
      contracts: ['Contrato SRV-104-2025', 'Anexos de supervison externa'],
      audits: ['Revision financiera Q4 2025'],
      technicalDocs: ['Inventario de especies plantadas', 'Plan de mantenimiento anual'],
      publicExecutionEvidence: ['Acta comunitaria de conformidad', 'Mapa de tramos intervenidos']
    },
    citizenParticipation: {
      totalVotes: 8320,
      engagementRate: '68%',
      comments: 522,
      deliberationSessions: 5,
      assemblies: 3
    },
    communityPosts: [
      {
        id: 'c3',
        type: 'update',
        author: 'Brigada Verde Sur',
        date: '2026-01-20',
        text: 'Se activo una jornada de reforestacion adicional en el tramo oriente.',
        status: 'Publicado'
      }
    ]
  }
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);

const toLabelDate = (date: string) => {
  const asDate = new Date(date);
  if (Number.isNaN(asDate.getTime())) return date;
  return asDate.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
};

const getFinancialBadge = (status: FinancialIndicator['status']) => {
  if (status === 'ok') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (status === 'warning') return 'bg-amber-100 text-amber-800 border-amber-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

const advancedCategoryOptions = [
  'parks',
  'lighting',
  'mobility',
  'accessibility',
  'security',
  'green areas',
  'culture',
  'sports',
  'education'
] as const;

const advancedStatusOptions: ProposalState[] = [
  'draft',
  'community_preview',
  'in_preparation',
  'officially_submitted',
  'under_institutional_review',
  'under_review',
  'approved',
  'rejected',
  'in_deliberation',
  'open_for_voting',
  'winning_project',
  'in_progress',
  'completed'
];

const advancedStatusLabels: Record<ProposalState, string> = {
  draft: 'Borrador',
  community_preview: 'Community Preview',
  in_preparation: 'In Preparation',
  officially_submitted: 'Officially Submitted',
  under_institutional_review: 'Under Institutional Review',
  submitted: 'Enviada',
  under_review: 'En revisión',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  in_deliberation: 'En deliberación',
  open_for_voting: 'Abierta a votación',
  winning_project: 'Proyecto ganador',
  in_progress: 'En progreso',
  delayed: 'Atrasada',
  completed: 'Completada'
};

const districtByNeighborhood: Record<string, string> = {
  Downtown: 'Distrito 1',
  'East Side': 'Distrito 2',
  'West End': 'Distrito 3',
  'North Hills': 'Distrito 4',
  'South District': 'Distrito 5',
  Centro: 'Distrito 1',
  Norte: 'Distrito 2',
  Sur: 'Distrito 3',
  Este: 'Distrito 4',
  Oeste: 'Distrito 5'
};

const normalizeAdvancedCategory = (category: string, title: string) => {
  const haystack = `${category} ${title}`.toLowerCase();
  if (haystack.includes('park') || haystack.includes('parque') || haystack.includes('recre')) return 'parks';
  if (haystack.includes('light') || haystack.includes('ilumin')) return 'lighting';
  if (haystack.includes('bike') || haystack.includes('movilidad') || haystack.includes('ciclov')) return 'mobility';
  if (haystack.includes('acces')) return 'accessibility';
  if (haystack.includes('segur') || haystack.includes('security')) return 'security';
  if (haystack.includes('green') || haystack.includes('ambiente') || haystack.includes('garden') || haystack.includes('huerto')) return 'green areas';
  if (haystack.includes('cultur')) return 'culture';
  if (haystack.includes('sport') || haystack.includes('deport')) return 'sports';
  if (haystack.includes('edu') || haystack.includes('school') || haystack.includes('biblioteca') || haystack.includes('library')) return 'education';
  return 'culture';
};

const progressByStatus: Record<ProposalState, number> = {
  draft: 5,
  community_preview: 20,
  in_preparation: 35,
  officially_submitted: 50,
  under_institutional_review: 62,
  submitted: 12,
  under_review: 25,
  approved: 42,
  rejected: 35,
  in_deliberation: 55,
  open_for_voting: 68,
  winning_project: 80,
  in_progress: 90,
  delayed: 74,
  completed: 100
};

const buildPoint = (id: string, index: number) => {
  const seed = Number.parseInt(id, 10);
  const safeSeed = Number.isNaN(seed) ? id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) : seed;
  const x = 18 + ((safeSeed + index * 7) % 64);
  const y = 18 + ((safeSeed + index * 11) % 64);
  return { x, y };
};

const getProximity = (x: number, y: number) => {
  const dx = x - 50;
  const dy = y - 50;
  return Math.round(Math.sqrt(dx * dx + dy * dy));
};

export default function Impact({ proposals }: ImpactProps) {
  const [yearFilter, setYearFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [maxProximity, setMaxProximity] = useState(70);
  const [minParticipation, setMinParticipation] = useState(0);
  const [minImpact, setMinImpact] = useState(0);
  const [minProgress, setMinProgress] = useState(0);

  const proposalTerritorialMeta = useMemo(() => {
    return proposals.map((proposal, index) => {
      const point = buildPoint(proposal.id, index);
      const year = new Date(proposal.createdAt).getFullYear();
      const category = normalizeAdvancedCategory(proposal.category, proposal.title);
      const district = districtByNeighborhood[proposal.neighborhood] || 'Distrito comunitario';
      const participation = proposal.votes + proposal.comments * 4;
      const impact = proposal.peopleBenefited || 0;

      return {
        proposal,
        year,
        category,
        district,
        x: point.x,
        y: point.y,
        proximity: getProximity(point.x, point.y),
        participation,
        impact,
        progress: progressByStatus[proposal.state]
      };
    });
  }, [proposals]);

  const filteredImpactProposals = useMemo(() => {
    return proposalTerritorialMeta
      .filter((item) => {
        if (yearFilter !== 'all' && item.year !== Number(yearFilter)) return false;
        if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
        if (statusFilter !== 'all' && item.proposal.state !== statusFilter) return false;
        if (neighborhoodFilter !== 'all' && item.proposal.neighborhood !== neighborhoodFilter) return false;
        if (districtFilter !== 'all' && item.district !== districtFilter) return false;
        if (item.proximity > maxProximity) return false;
        if (item.participation < minParticipation) return false;
        if (item.impact < minImpact) return false;
        if (item.progress < minProgress) return false;
        return true;
      })
      .map((item) => item.proposal);
  }, [
    proposalTerritorialMeta,
    yearFilter,
    categoryFilter,
    statusFilter,
    neighborhoodFilter,
    districtFilter,
    maxProximity,
    minParticipation,
    minImpact,
    minProgress
  ]);

  const proposalCompletedExperiences = useMemo<CompletedProjectExperience[]>(() => {
    const completed = proposals.filter((proposal) => proposal.state === 'completed');

    return completed.map((proposal, index) => {
      const executed = Math.round(proposal.budget * 0.94);

      return {
        id: `proposal-${proposal.id}`,
        proposalId: proposal.id,
        title: proposal.title,
        finalStatus: 'Completado con evidencia publica',
        completionDate: proposal.createdAt,
        executionDuration: `${5 + index} meses`,
        neighborhood: proposal.neighborhood,
        district: `Distrito ${index + 2}`,
        coordinates: { x: 42 + index * 8, y: 40 + index * 7, lat: '19.4300', lng: '-99.1350' },
        timeline: [
          { key: 'proposal_creation', label: 'Creacion de propuesta', date: proposal.createdAt, status: 'done' },
          { key: 'institutional_evaluation', label: 'Evaluacion institucional', date: '2026-01-28', status: 'done' },
          { key: 'deliberation', label: 'Deliberacion comunitaria', date: '2026-02-14', status: 'done' },
          { key: 'voting', label: 'Votacion ciudadana', date: '2026-03-02', status: 'done' },
          { key: 'approval', label: 'Aprobacion final', date: '2026-03-10', status: 'done' },
          { key: 'construction_start', label: 'Inicio de obra', date: '2026-03-28', status: 'done' },
          { key: 'milestone_1', label: 'Hito 1: avance de obra', date: '2026-05-12', status: 'done' },
          { key: 'milestone_2', label: 'Hito 2: verificacion tecnica', date: '2026-06-24', status: 'done' },
          { key: 'project_completion', label: 'Cierre de proyecto', date: '2026-07-30', status: 'done' }
        ],
        visualEvidence: {
          beforePhoto: proposal.image,
          duringPhoto: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&auto=format&fit=crop',
          afterPhoto: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1200&auto=format&fit=crop',
          videos: ['Capsula de avance trimestral', 'Registro de recepcion vecinal'],
          publicDocs: ['Panel antes-despues', 'Repositorio fotografico de avance'],
          gallery: [
            proposal.image,
            'https://images.unsplash.com/photo-1521133573892-e44906baee46?w=900&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=900&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1494526585095-c41746248156?w=900&auto=format&fit=crop'
          ]
        },
        impactMetrics: {
          peopleBenefited: proposal.peopleBenefited || 0,
          rehabilitatedAreas: 1200 + index * 280,
          treesPlanted: 20 + index * 7,
          infrastructureInstalled: 35 + index * 5,
          environmentalImprovements: 'Mejoras en vegetacion urbana y confort termico del espacio publico.',
          accessibilityImprovements: 'Rutas accesibles, señalizacion y cruces con enfoque peatonal.'
        },
        budget: {
          approved: proposal.budget,
          executed,
          indicators: [
            { label: 'Transparencia documental', value: 'Alta', status: 'ok' },
            { label: 'Ejecucion presupuestal', value: `${((executed / proposal.budget) * 100).toFixed(1)}%`, status: 'ok' },
            { label: 'Revision ciudadana', value: 'Activa', status: 'warning' }
          ]
        },
        institutionalEvidence: {
          reports: ['Reporte de cierre institucional', 'Reporte de impacto social post-entrega'],
          contracts: ['Contrato principal de ejecucion', 'Anexo de supervision'],
          audits: ['Auditoria de cumplimiento'],
          technicalDocs: ['Memoria tecnica', 'Lista de verificacion de calidad'],
          publicExecutionEvidence: ['Acta de recepcion vecinal', 'Evidencia georreferenciada']
        },
        citizenParticipation: {
          totalVotes: proposal.votes,
          engagementRate: `${Math.min(95, Math.max(40, Math.round((proposal.comments / Math.max(proposal.votes, 1)) * 100 * 2)))}%`,
          comments: proposal.comments,
          deliberationSessions: 4,
          assemblies: 2
        },
        communityPosts: [
          {
            id: `post-${proposal.id}`,
            type: 'feedback',
            author: 'Observatorio Vecinal',
            date: '2026-04-08',
            text: 'La comunidad confirma mejoras visibles en el entorno inmediato.',
            status: 'Publicado'
          }
        ]
      };
    });
  }, [proposals]);

  const completedProjectExperiences = useMemo(
    () => [...proposalCompletedExperiences, ...archivedCompletedProjects],
    [proposalCompletedExperiences]
  );

  const filteredCompletedExperiences = useMemo(() => {
    return completedProjectExperiences.filter((item, index) => {
      const year = new Date(item.completionDate).getFullYear();
      const category = normalizeAdvancedCategory(item.title, item.title);
      const proximity = getProximity(item.coordinates.x, item.coordinates.y);
      const participation = item.citizenParticipation.totalVotes;
      const impact = item.impactMetrics.peopleBenefited;
      const progress = 100;

      if (yearFilter !== 'all' && year !== Number(yearFilter)) return false;
      if (categoryFilter !== 'all' && category !== categoryFilter) return false;
      if (statusFilter !== 'all' && statusFilter !== 'completed') return false;
      if (neighborhoodFilter !== 'all' && item.neighborhood !== neighborhoodFilter) return false;
      if (districtFilter !== 'all' && item.district !== districtFilter) return false;
      if (proximity > maxProximity) return false;
      if (participation < minParticipation) return false;
      if (impact < minImpact) return false;
      if (progress < minProgress) return false;
      return true;
    });
  }, [
    completedProjectExperiences,
    yearFilter,
    categoryFilter,
    statusFilter,
    neighborhoodFilter,
    districtFilter,
    maxProximity,
    minParticipation,
    minImpact,
    minProgress
  ]);

  const availableYears = useMemo(() => {
    const fromProposals = proposalTerritorialMeta.map((item) => item.year);
    const fromCompleted = completedProjectExperiences.map((item) => new Date(item.completionDate).getFullYear());
    return Array.from(new Set([...fromProposals, ...fromCompleted])).sort((a, b) => b - a);
  }, [proposalTerritorialMeta, completedProjectExperiences]);

  const availableNeighborhoods = useMemo(
    () => Array.from(new Set([...proposalTerritorialMeta.map((item) => item.proposal.neighborhood), ...completedProjectExperiences.map((item) => item.neighborhood)])).sort(),
    [proposalTerritorialMeta, completedProjectExperiences]
  );

  const availableDistricts = useMemo(
    () => Array.from(new Set([...proposalTerritorialMeta.map((item) => item.district), ...completedProjectExperiences.map((item) => item.district)])).sort(),
    [proposalTerritorialMeta, completedProjectExperiences]
  );

  const [selectedExperienceId, setSelectedExperienceId] = useState('');
  const [maintenanceIssue, setMaintenanceIssue] = useState('');
  const [citizenFeedback, setCitizenFeedback] = useState('');
  const [citizenUpdate, setCitizenUpdate] = useState('');
  const [communityPosts, setCommunityPosts] = useState<CompletedProjectExperience['communityPosts']>([]);

  useEffect(() => {
    if (selectedExperienceId && !filteredCompletedExperiences.some((item) => item.id === selectedExperienceId)) {
      setSelectedExperienceId('');
    }
  }, [filteredCompletedExperiences, selectedExperienceId]);

  const selectedExperience = filteredCompletedExperiences.find((item) => item.id === selectedExperienceId) || null;

  useEffect(() => {
    if (selectedExperience) {
      setCommunityPosts(selectedExperience.communityPosts);
    } else {
      setCommunityPosts([]);
    }
  }, [selectedExperience]);

  const relatedTerritorialProjects = useMemo(() => {
    if (!selectedExperience) return [];

    return filteredImpactProposals
      .filter((proposal) => {
        if (selectedExperience.proposalId && proposal.id === selectedExperience.proposalId) return false;
        const sharesTerritory = proposal.neighborhood === selectedExperience.neighborhood;
        const inRelevantState = ['completed', 'in_progress', 'delayed', 'open_for_voting', 'winning_project'].includes(proposal.state);
        return sharesTerritory && inRelevantState;
      })
      .slice(0, 6);
  }, [filteredImpactProposals, selectedExperience]);

  const submitCommunityPost = (type: 'issue' | 'feedback' | 'update') => {
    const sourceText = type === 'issue' ? maintenanceIssue : type === 'feedback' ? citizenFeedback : citizenUpdate;
    if (!sourceText.trim()) return;

    const nextItem = {
      id: `local-${Date.now()}`,
      type,
      author: 'Ciudadania',
      date: new Date().toISOString().slice(0, 10),
      text: sourceText.trim(),
      status: type === 'issue' ? 'En revision municipal' : 'Publicado'
    };

    setCommunityPosts((prev) => [nextItem, ...prev]);

    if (type === 'issue') setMaintenanceIssue('');
    if (type === 'feedback') setCitizenFeedback('');
    if (type === 'update') setCitizenUpdate('');
  };

  const exportProjectPdf = (project: CompletedProjectExperience) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const left = 14;
    const right = pageWidth - 14;
    const contentWidth = right - left;
    let y = 16;
    let pageNumber = 1;

    const drawFooter = () => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Documento generado automaticamente para fines de transparencia publica.', left, pageHeight - 8);
      doc.text(`Pagina ${pageNumber}`, right - 18, pageHeight - 8);
    };

    const drawHeader = (isFirstPage: boolean) => {
      if (isFirstPage) {
        doc.setFillColor(76, 29, 149);
        doc.rect(0, 0, pageWidth, 38, 'F');

        doc.setFillColor(219, 39, 119);
        doc.rect(0, 38, pageWidth, 3, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('Expediente Publico de Proyecto Completado', left, 15);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Plataforma de Presupuesto Participativo', left, 22);
        doc.text(`Fecha de emision: ${new Date().toLocaleDateString('es-MX')}`, left, 28);
        doc.text('Reporte ciudadano de transparencia y seguimiento', left, 34);

        y = 48;
      } else {
        doc.setFillColor(241, 245, 249);
        doc.rect(0, 0, pageWidth, 18, 'F');
        doc.setTextColor(51, 65, 85);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(project.title, left, 11);
        y = 24;
      }

      doc.setTextColor(17, 24, 39);
    };

    const addPage = () => {
      drawFooter();
      doc.addPage();
      pageNumber += 1;
      drawHeader(false);
    };

    const ensureSpace = (blockHeight = 12) => {
      if (y + blockHeight > pageHeight - 18) {
        addPage();
      }
    };

    const addSectionTitle = (text: string) => {
      ensureSpace(14);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(left - 2, y - 4, contentWidth + 4, 10, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(left - 2, y - 4, contentWidth + 4, 10, 2, 2, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(30, 41, 59);
      doc.text(text, left, y + 2);
      y += 14;
    };

    const addKeyValueRow = (label: string, value: string, highlight = false) => {
      const lines = doc.splitTextToSize(value, contentWidth - 44);
      const rowHeight = Math.max(8, lines.length * 5 + 2);
      ensureSpace(rowHeight + 3);

      if (highlight) {
        doc.setFillColor(255, 251, 235);
        doc.roundedRect(left - 1, y - 4, contentWidth + 2, rowHeight + 2, 2, 2, 'F');
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`${label}:`, left, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(lines, left + 40, y);
      y += rowHeight + 2;
    };

    const addParagraph = (text: string) => {
      const lines = doc.splitTextToSize(text, contentWidth);
      ensureSpace(lines.length * 5 + 3);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text(lines, left, y);
      y += lines.length * 5 + 3;
    };

    const addBulletList = (items: string[]) => {
      items.forEach((item) => {
        const lines = doc.splitTextToSize(item, contentWidth - 6);
        ensureSpace(lines.length * 5 + 3);
        doc.setFillColor(99, 102, 241);
        doc.circle(left + 1.5, y - 1, 0.8, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        doc.text(lines, left + 5, y);
        y += lines.length * 5 + 3;
      });
    };

    const addKpiCardRow = () => {
      ensureSpace(30);
      const gap = 5;
      const cardWidth = (contentWidth - gap * 2) / 3;
      const cardY = y;

      const cards = [
        { label: 'Personas beneficiadas', value: project.impactMetrics.peopleBenefited.toLocaleString() },
        { label: 'Presupuesto ejecutado', value: formatCurrency(project.budget.executed) },
        { label: 'Participacion total', value: project.citizenParticipation.totalVotes.toLocaleString() }
      ];

      cards.forEach((card, idx) => {
        const x = left + idx * (cardWidth + gap);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(x, cardY, cardWidth, 24, 2, 2, 'F');
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(x, cardY, cardWidth, 24, 2, 2, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(17, 24, 39);
        doc.text(card.value, x + 3, cardY + 9);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const labelLines = doc.splitTextToSize(card.label, cardWidth - 6);
        doc.text(labelLines, x + 3, cardY + 16);
      });

      y += 30;
    };

    const addTimelineRows = () => {
      project.timeline.forEach((step) => {
        ensureSpace(10);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(left - 1, y - 4, contentWidth + 2, 9, 1.5, 1.5, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(left - 1, y - 4, contentWidth + 2, 9, 1.5, 1.5, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.2);
        doc.setTextColor(30, 41, 59);
        doc.text(step.label, left + 2, y + 1);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(toLabelDate(step.date), right - 44, y + 1);
        y += 11;
      });
    };

    drawHeader(true);
    addSectionTitle('Ficha General');
    addKeyValueRow('Proyecto', project.title);
    addKeyValueRow('Estado final', project.finalStatus, true);
    addKeyValueRow('Fecha de finalizacion', toLabelDate(project.completionDate));
    addKeyValueRow('Duracion de ejecucion', project.executionDuration);
    addKeyValueRow('Territorio', `${project.neighborhood}, ${project.district}`);

    addKpiCardRow();

    addSectionTitle('Transparencia Presupuestaria');
    addKeyValueRow('Presupuesto aprobado', formatCurrency(project.budget.approved));
    addKeyValueRow('Gasto ejecutado', formatCurrency(project.budget.executed));
    addKeyValueRow('Porcentaje usado', `${((project.budget.executed / project.budget.approved) * 100).toFixed(1)}%`);
    addBulletList(project.budget.indicators.map((item) => `${item.label}: ${item.value}`));

    addSectionTitle('Impacto y Participacion');
    addKeyValueRow('Personas beneficiadas', project.impactMetrics.peopleBenefited.toLocaleString());
    addKeyValueRow('Areas rehabilitadas', `${project.impactMetrics.rehabilitatedAreas.toLocaleString()} m2`);
    addKeyValueRow('Arboles plantados', project.impactMetrics.treesPlanted.toString());
    addKeyValueRow('Infraestructura instalada', project.impactMetrics.infrastructureInstalled.toString());
    addKeyValueRow('Mejoras ambientales', project.impactMetrics.environmentalImprovements);
    addKeyValueRow('Mejoras de accesibilidad', project.impactMetrics.accessibilityImprovements);
    addKeyValueRow('Votos totales', project.citizenParticipation.totalVotes.toLocaleString());
    addKeyValueRow('Comentarios', project.citizenParticipation.comments.toString());
    addKeyValueRow('Engagement', project.citizenParticipation.engagementRate);

    addSectionTitle('Linea de Tiempo Democratica');
    addTimelineRows();

    addSectionTitle('Evidencia Institucional');
    addParagraph('Reportes:');
    addBulletList(project.institutionalEvidence.reports);
    addParagraph('Contratos:');
    addBulletList(project.institutionalEvidence.contracts);
    addParagraph('Auditorias:');
    addBulletList(project.institutionalEvidence.audits);

    drawFooter();

    const safeName = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    doc.save(`proyecto-${safeName || project.id}.pdf`);
  };

  const allProjectPoints = filteredCompletedExperiences.map((item) => ({
    id: item.id,
    title: item.title,
    x: item.coordinates.x,
    y: item.coordinates.y,
    neighborhood: item.neighborhood,
    district: item.district
  }));

  const aggregatedCompletedMetrics = filteredCompletedExperiences.reduce(
    (acc, item) => {
      acc.people += item.impactMetrics.peopleBenefited;
      acc.trees += item.impactMetrics.treesPlanted;
      acc.projects += 1;
      acc.investment += item.budget.executed;
      return acc;
    },
    { people: 0, trees: 0, projects: 0, investment: 0 }
  );

  const completedVsTotal = `${aggregatedCompletedMetrics.projects}/${Math.max(filteredImpactProposals.length, 1)}`;

  const totalStats = [
    {
      label: 'Personas Beneficiadas',
      value: aggregatedCompletedMetrics.people.toLocaleString(),
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      label: 'Proyectos Completados',
      value: completedVsTotal,
      icon: CheckCircle2,
      color: 'text-fuchsia-600',
      bg: 'bg-fuchsia-50'
    },
    {
      label: 'Inversión Total',
      value: formatCurrency(aggregatedCompletedMetrics.investment),
      icon: TrendingUp,
      color: 'text-violet-600',
      bg: 'bg-violet-50'
    }
  ];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-fuchsia-700 via-violet-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="app-heading-xl text-white mb-3">Impacto Comunitario</h1>
          <p className="text-lg md:text-xl text-purple-100 motion-rise-2">
            Conoce el impacto real del presupuesto participativo en tu comunidad
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {/* Total Impact Stats */}
        <div className="order-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {totalStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="surface-card rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="order-3 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Investment by Neighborhood */}
          <div className="surface-card rounded-xl p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Inversión por Barrio</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={neighborhoodInvestment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="neighborhood" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="investment" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-2">Inversión en miles (K)</p>
          </div>

          {/* Projects by Category */}
          <div className="surface-card rounded-xl p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Proyectos por Categoría</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Project Timeline */}
          <div className="surface-card rounded-xl p-6 lg:col-span-2">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Proyectos Completados en el Tiempo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="projects" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Completed Project Experience */}
        <div className="order-1 mb-8">
          <div className="surface-card rounded-xl p-4 md:p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              <div>
                <h2 className="app-heading-lg">Expediente Publico de Proyecto Completado</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Evidencia territorial, trazabilidad democratica e impacto comunitario verificable.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-fuchsia-100 border border-fuchsia-200 text-fuchsia-700">
                Transparencia activa
              </span>
            </div>
          </div>

          <div className="surface-card rounded-xl p-4 md:p-6 mb-6">
            <h3 className="text-base font-semibold text-slate-900 mb-3">Filtros avanzados territoriales</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Año</label>
                <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500">
                  <option value="all">Todos</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Categoría</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500">
                  <option value="all">Todas</option>
                  {advancedCategoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Estado</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500">
                  <option value="all">Todos</option>
                  {advancedStatusOptions.map((status) => (
                    <option key={status} value={status}>{advancedStatusLabels[status]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Barrio</label>
                <select value={neighborhoodFilter} onChange={(e) => setNeighborhoodFilter(e.target.value)} className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500">
                  <option value="all">Todos</option>
                  {availableNeighborhoods.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Distrito</label>
                <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500">
                  <option value="all">Todos</option>
                  {availableDistricts.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Proximidad: {maxProximity}</label>
                <input type="range" min={10} max={90} value={maxProximity} onChange={(e) => setMaxProximity(Number(e.target.value))} className="w-full" />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Participación min: {minParticipation}</label>
                <input type="range" min={0} max={15000} step={50} value={minParticipation} onChange={(e) => setMinParticipation(Number(e.target.value))} className="w-full" />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Impacto min: {minImpact}</label>
                <input type="range" min={0} max={30000} step={100} value={minImpact} onChange={(e) => setMinImpact(Number(e.target.value))} className="w-full" />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Progreso min: {minProgress}%</label>
                <input type="range" min={0} max={100} value={minProgress} onChange={(e) => setMinProgress(Number(e.target.value))} className="w-full" />
              </div>
            </div>
          </div>

          {filteredCompletedExperiences.length === 0 && (
            <div className="surface-card rounded-xl p-8 text-center text-slate-600">
              Aun no hay proyectos completados para construir el expediente publico.
            </div>
          )}

          {filteredCompletedExperiences.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <aside className="xl:col-span-4 space-y-4">
                {filteredCompletedExperiences.map((item) => (
                  <div
                    key={item.id}
                    className={`w-full text-left p-4 rounded-xl border transition-colors ${
                      selectedExperience?.id === item.id
                        ? 'border-fuchsia-300 bg-fuchsia-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedExperienceId((prev) => (prev === item.id ? '' : item.id))}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      </div>
                      <div className="space-y-1 text-xs text-slate-600">
                        <p className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{item.neighborhood} · {item.district}</p>
                        <p className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{item.executionDuration}</p>
                        <p className="text-emerald-700 font-medium">{item.finalStatus}</p>
                      </div>
                    </button>
                    <button
                      onClick={() => exportProjectPdf(item)}
                      className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Exportar PDF
                    </button>
                  </div>
                ))}
              </aside>

              <section className="xl:col-span-8">
                {!selectedExperience && (
                  <div className="surface-card rounded-xl p-8 text-center text-slate-600">
                    Selecciona un proyecto del listado para desplegar su ventana de información.
                  </div>
                )}

                {selectedExperience && <div className="space-y-6">
                <div className="surface-card rounded-xl p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4 mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{selectedExperience.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">Proyecto completado como evidencia publica de transformacion territorial.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {selectedExperience.finalStatus}
                      </span>
                      <button
                        onClick={() => exportProjectPdf(selectedExperience)}
                        className="text-xs px-3 py-1 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF
                      </button>
                      <button
                        onClick={() => setSelectedExperienceId('')}
                        className="text-xs px-3 py-1 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                      <p className="text-xs text-slate-500 mb-1">Fecha de finalizacion</p>
                      <p className="text-sm font-semibold text-slate-900">{toLabelDate(selectedExperience.completionDate)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                      <p className="text-xs text-slate-500 mb-1">Duracion de ejecucion</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedExperience.executionDuration}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                      <p className="text-xs text-slate-500 mb-1">Barrio</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedExperience.neighborhood}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                      <p className="text-xs text-slate-500 mb-1">Distrito</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedExperience.district}</p>
                    </div>
                  </div>
                </div>

                <div className="surface-card rounded-xl p-5 md:p-6">
                  <h4 className="text-base font-semibold text-slate-900 mb-3">Proyectos territoriales relacionados</h4>
                  <div className="space-y-2">
                    {relatedTerritorialProjects.length === 0 && (
                      <p className="text-xs text-slate-600">No hay proyectos cercanos registrados en este momento.</p>
                    )}
                    {relatedTerritorialProjects.map((project) => (
                      <div key={project.id} className="rounded-lg border border-slate-200 bg-white p-2.5">
                        <p className="text-xs font-semibold text-slate-900">{project.title}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">{project.neighborhood} · Estado: {project.state.replaceAll('_', ' ')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="surface-card rounded-xl p-5 md:p-6">
                  <h4 className="text-base font-semibold text-slate-900 mb-4">Linea de tiempo del ciclo democratico</h4>
                  <div className="space-y-3">
                    {selectedExperience.timeline.map((step, idx) => (
                      <div key={step.key} className="flex items-start gap-3">
                        <div className="flex flex-col items-center mt-0.5">
                          <span className={`w-3 h-3 rounded-full ${step.status === 'done' ? 'bg-emerald-500' : step.status === 'in_progress' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                          {idx < selectedExperience.timeline.length - 1 && <span className="w-px h-7 bg-slate-300" />}
                        </div>
                        <div className="pb-2">
                          <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                          <p className="text-xs text-slate-600">{toLabelDate(step.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="surface-card rounded-xl p-5 md:p-6">
                  <h4 className="text-base font-semibold text-slate-900 mb-4">Evidencia visual publica</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-2">Antes</p>
                      <img src={selectedExperience.visualEvidence.beforePhoto} alt={`Antes de ${selectedExperience.title}`} className="h-40 w-full object-cover rounded-lg border border-slate-200" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-2">Durante</p>
                      <img src={selectedExperience.visualEvidence.duringPhoto} alt={`Durante ${selectedExperience.title}`} className="h-40 w-full object-cover rounded-lg border border-slate-200" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-2">Despues</p>
                      <img src={selectedExperience.visualEvidence.afterPhoto} alt={`Despues de ${selectedExperience.title}`} className="h-40 w-full object-cover rounded-lg border border-slate-200" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2"><Upload className="w-4 h-4 text-fuchsia-600" />Videos</p>
                      <ul className="space-y-1 text-sm text-slate-700">
                        {selectedExperience.visualEvidence.videos.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-600" />Documentacion visual publica</p>
                      <ul className="space-y-1 text-sm text-slate-700">
                        {selectedExperience.visualEvidence.publicDocs.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 mb-2">Galeria de progreso</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {selectedExperience.visualEvidence.gallery.map((photo, idx) => (
                      <img key={photo + idx} src={photo} alt={`Galeria ${idx + 1}`} className="h-24 w-full object-cover rounded-lg border border-slate-200" />
                    ))}
                  </div>
                </div>

                <div className="surface-card rounded-xl p-5 md:p-6">
                  <h4 className="text-base font-semibold text-slate-900 mb-4">Metricas de impacto</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                      <p className="text-xs text-slate-500">Personas beneficiadas</p>
                      <p className="text-lg font-semibold text-slate-900">{selectedExperience.impactMetrics.peopleBenefited.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                      <p className="text-xs text-slate-500">Areas rehabilitadas</p>
                      <p className="text-lg font-semibold text-slate-900">{selectedExperience.impactMetrics.rehabilitatedAreas.toLocaleString()} m2</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                      <p className="text-xs text-slate-500">Arboles plantados</p>
                      <p className="text-lg font-semibold text-slate-900">{selectedExperience.impactMetrics.treesPlanted}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                      <p className="text-xs text-slate-500">Infraestructura instalada</p>
                      <p className="text-lg font-semibold text-slate-900">{selectedExperience.impactMetrics.infrastructureInstalled}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                      <p className="font-semibold text-emerald-900 mb-1">Mejoras ambientales</p>
                      <p>{selectedExperience.impactMetrics.environmentalImprovements}</p>
                    </div>
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                      <p className="font-semibold text-indigo-900 mb-1">Mejoras de accesibilidad</p>
                      <p>{selectedExperience.impactMetrics.accessibilityImprovements}</p>
                    </div>
                  </div>
                </div>

                <div className="surface-card rounded-xl p-5 md:p-6">
                  <h4 className="text-base font-semibold text-slate-900 mb-4">Transparencia presupuestaria</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                      <p className="text-xs text-slate-500 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />Presupuesto aprobado</p>
                      <p className="text-base font-semibold text-slate-900">{formatCurrency(selectedExperience.budget.approved)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                      <p className="text-xs text-slate-500">Gasto ejecutado</p>
                      <p className="text-base font-semibold text-slate-900">{formatCurrency(selectedExperience.budget.executed)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                      <p className="text-xs text-slate-500">Porcentaje usado</p>
                      <p className="text-base font-semibold text-slate-900">{((selectedExperience.budget.executed / selectedExperience.budget.approved) * 100).toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden mb-4">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500"
                      style={{ width: `${Math.min(100, (selectedExperience.budget.executed / selectedExperience.budget.approved) * 100)}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedExperience.budget.indicators.map((indicator) => (
                      <span key={indicator.label} className={`text-xs border rounded-full px-2.5 py-1 ${getFinancialBadge(indicator.status)}`}>
                        {indicator.label}: {indicator.value}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="surface-card rounded-xl p-5 md:p-6">
                  <h4 className="text-base font-semibold text-slate-900 mb-4">Evidencia institucional</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="font-semibold text-slate-900 mb-2">Reportes</p>
                      {selectedExperience.institutionalEvidence.reports.map((item) => <p key={item} className="text-slate-700">• {item}</p>)}
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="font-semibold text-slate-900 mb-2">Contratos</p>
                      {selectedExperience.institutionalEvidence.contracts.map((item) => <p key={item} className="text-slate-700">• {item}</p>)}
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="font-semibold text-slate-900 mb-2">Auditorias</p>
                      {selectedExperience.institutionalEvidence.audits.map((item) => <p key={item} className="text-slate-700">• {item}</p>)}
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="font-semibold text-slate-900 mb-2">Documentacion tecnica</p>
                      {selectedExperience.institutionalEvidence.technicalDocs.map((item) => <p key={item} className="text-slate-700">• {item}</p>)}
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3 md:col-span-2">
                      <p className="font-semibold text-slate-900 mb-2">Evidencia publica de ejecucion</p>
                      {selectedExperience.institutionalEvidence.publicExecutionEvidence.map((item) => <p key={item} className="text-slate-700">• {item}</p>)}
                    </div>
                  </div>
                </div>

                <div className="surface-card rounded-xl p-5 md:p-6">
                  <h4 className="text-base font-semibold text-slate-900 mb-4">Participacion ciudadana</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-sm">
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                      <p className="text-xs text-slate-500">Votos totales</p>
                      <p className="font-semibold text-slate-900">{selectedExperience.citizenParticipation.totalVotes.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                      <p className="text-xs text-slate-500">Engagement</p>
                      <p className="font-semibold text-slate-900">{selectedExperience.citizenParticipation.engagementRate}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                      <p className="text-xs text-slate-500">Comentarios</p>
                      <p className="font-semibold text-slate-900">{selectedExperience.citizenParticipation.comments}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                      <p className="text-xs text-slate-500">Sesiones deliberativas</p>
                      <p className="font-semibold text-slate-900">{selectedExperience.citizenParticipation.deliberationSessions}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                      <p className="text-xs text-slate-500">Asambleas barriales</p>
                      <p className="font-semibold text-slate-900">{selectedExperience.citizenParticipation.assemblies}</p>
                    </div>
                  </div>
                </div>

                <div className="surface-card rounded-xl p-5 md:p-6">
                  <h4 className="text-base font-semibold text-slate-900 mb-4">Feedback comunitario post-completacion</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1"><AlertCircle className="w-4 h-4 text-amber-600" />Reportar mantenimiento</p>
                      <textarea
                        value={maintenanceIssue}
                        onChange={(e) => setMaintenanceIssue(e.target.value)}
                        rows={3}
                        placeholder="Ej. luminaria danada, bache, senaletica deteriorada"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                      />
                      <button onClick={() => submitCommunityPost('issue')} className="mt-2 w-full rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2">
                        Enviar reporte
                      </button>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1"><Heart className="w-4 h-4 text-fuchsia-600" />Compartir feedback</p>
                      <textarea
                        value={citizenFeedback}
                        onChange={(e) => setCitizenFeedback(e.target.value)}
                        rows={3}
                        placeholder="Como ha cambiado tu barrio desde que se completo el proyecto"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                      />
                      <button onClick={() => submitCommunityPost('feedback')} className="mt-2 w-full rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm font-medium py-2">
                        Publicar feedback
                      </button>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1"><MessageCircle className="w-4 h-4 text-indigo-600" />Enviar actualizacion</p>
                      <textarea
                        value={citizenUpdate}
                        onChange={(e) => setCitizenUpdate(e.target.value)}
                        rows={3}
                        placeholder="Nuevos usos, actividades o impactos observados en la zona"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                      />
                      <button onClick={() => submitCommunityPost('update')} className="mt-2 w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2">
                        Enviar actualizacion
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm font-semibold text-slate-900 mb-2">Conversacion comunitaria y seguimiento</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {communityPosts.length === 0 && <p className="text-sm text-slate-600">Sin publicaciones aun.</p>}
                      {communityPosts.map((post) => (
                        <div key={post.id} className="rounded-lg bg-white border border-slate-200 p-3">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-xs font-semibold text-slate-800">{post.author}</p>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">{post.status}</span>
                          </div>
                          <p className="text-xs text-slate-500 mb-1">{toLabelDate(post.date)} · {post.type}</p>
                          <p className="text-sm text-slate-700">{post.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                </div>}
              </section>
            </div>
          )}
        </div>

        {/* Environmental Impact */}
        <div className="order-4 bg-gradient-to-br from-green-50 to-purple-50 rounded-xl p-6 md:p-8 border border-green-100">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Impacto Ambiental</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TreeDeciduous className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">1,245</div>
              <div className="text-gray-600">Árboles Plantados</div>
              <div className="text-sm text-gray-500 mt-1">~62 ton CO₂/año absorbidas</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Droplets className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">2.4M</div>
              <div className="text-gray-600">Litros de Agua Ahorrados</div>
              <div className="text-sm text-gray-500 mt-1">A través de sistemas eficientes</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">450K</div>
              <div className="text-gray-600">kWh de Energía Ahorrados</div>
              <div className="text-sm text-gray-500 mt-1">De solar y LED</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
