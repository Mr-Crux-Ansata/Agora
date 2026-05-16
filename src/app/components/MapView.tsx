import { useEffect, useMemo, useState } from 'react';
import {
  Clock,
  Filter,
  Heart,
  MapPin,
  Maximize2,
  TrendingUp,
  Users,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { ParticipationPhase, Proposal, ProposalState } from '../App';

interface MapViewProps {
  proposals: Proposal[];
  currentPhase: ParticipationPhase;
}

interface TerritorialItem {
  proposal: Proposal;
  year: number;
  category: string;
  district: string;
  x: number;
  y: number;
  proximity: number;
  participation: number;
  impact: number;
  progress: number;
}

interface VotingCenter {
  id: string;
  district: string;
  municipality: string;
  x: number;
  y: number;
  proposalCount: number;
}

type MapMode = 'preselection' | 'winning';

const categoryOptions = [
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

const statusOptions: ProposalState[] = [
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

const statusLabels: Record<ProposalState, string> = {
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

const statusColors: Record<ProposalState, string> = {
  draft: 'bg-slate-500',
  community_preview: 'bg-teal-600',
  in_preparation: 'bg-indigo-600',
  officially_submitted: 'bg-violet-700',
  under_institutional_review: 'bg-amber-700',
  submitted: 'bg-indigo-500',
  under_review: 'bg-amber-500',
  approved: 'bg-violet-600',
  rejected: 'bg-rose-600',
  in_deliberation: 'bg-sky-600',
  open_for_voting: 'bg-purple-600',
  winning_project: 'bg-emerald-700',
  in_progress: 'bg-fuchsia-600',
  delayed: 'bg-orange-600',
  completed: 'bg-green-600'
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
  Oeste: 'Distrito 5',
  'Zona Industrial': 'Distrito 6',
  'Zona Residencial': 'Distrito 7'
};

const municipalityByDistrict: Record<string, string> = {
  'Distrito 1': 'Chihuahua',
  'Distrito 2': 'Juárez',
  'Distrito 3': 'Cuauhtémoc',
  'Distrito 4': 'Delicias',
  'Distrito 5': 'Parral',
  'Distrito 6': 'Camargo',
  'Distrito 7': 'Ojinaga'
};

const chihuahuaOutlinePath = 'M18 25 L30 16 L44 14 L57 19 L68 16 L80 24 L86 36 L84 48 L88 60 L80 74 L69 83 L55 87 L42 84 L30 79 L20 69 L15 56 L13 42 L16 33 Z';

const normalizeCategory = (category: string, title: string) => {
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

const buildCenterPoint = (index: number) => {
  const positions = [
    { x: 24, y: 28 },
    { x: 38, y: 20 },
    { x: 56, y: 24 },
    { x: 72, y: 34 },
    { x: 68, y: 56 },
    { x: 48, y: 66 },
    { x: 30, y: 58 }
  ];

  return positions[index % positions.length];
};

const getProximity = (x: number, y: number) => {
  const dx = x - 50;
  const dy = y - 50;
  return Math.round(Math.sqrt(dx * dx + dy * dy));
};

const isWinningProposal = (proposal: Proposal) =>
  proposal.isWinningProject || proposal.state === 'winning_project' || ['in_progress', 'completed'].includes(proposal.state);

export default function MapView({ proposals, currentPhase }: MapViewProps) {
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [mapMode, setMapMode] = useState<MapMode>(currentPhase === 'results_publication' ? 'winning' : 'preselection');

  const [yearFilter, setYearFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [maxProximity, setMaxProximity] = useState(70);
  const [minParticipation, setMinParticipation] = useState(0);
  const [minImpact, setMinImpact] = useState(0);
  const [minProgress, setMinProgress] = useState(0);

  useEffect(() => {
    setMapMode(currentPhase === 'results_publication' ? 'winning' : 'preselection');
    setSelectedCenterId(null);
    setSelectedProposalId(null);
  }, [currentPhase]);

  const items = useMemo<TerritorialItem[]>(() => {
    return proposals.map((proposal, index) => {
      const location = buildPoint(proposal.id, index);
      const participation = proposal.votes + proposal.comments * 4;
      const impact = proposal.peopleBenefited || 0;
      const category = normalizeCategory(proposal.category, proposal.title);
      const district = districtByNeighborhood[proposal.neighborhood] || 'Distrito comunitario';

      return {
        proposal,
        year: new Date(proposal.createdAt).getFullYear(),
        category,
        district,
        x: location.x,
        y: location.y,
        proximity: getProximity(location.x, location.y),
        participation,
        impact,
        progress: progressByStatus[proposal.state]
      };
    });
  }, [proposals]);

  const years = useMemo(() => Array.from(new Set(items.map((item) => item.year))).sort((a, b) => b - a), [items]);
  const neighborhoods = useMemo(() => Array.from(new Set(items.map((item) => item.proposal.neighborhood))).sort(), [items]);
  const districts = useMemo(() => Array.from(new Set(items.map((item) => item.district))).sort(), [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
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
    });
  }, [items, yearFilter, categoryFilter, statusFilter, neighborhoodFilter, districtFilter, maxProximity, minParticipation, minImpact, minProgress]);

  const filteredWinningItems = useMemo(() => filteredItems.filter((item) => isWinningProposal(item.proposal)), [filteredItems]);
  const filteredVotingItems = useMemo(() => filteredItems.filter((item) => item.proposal.state === 'open_for_voting'), [filteredItems]);

  const votingCenters = useMemo<VotingCenter[]>(() => {
    return districts.map((district, index) => ({
      id: district,
      district,
      municipality: municipalityByDistrict[district] || district,
      ...buildCenterPoint(index),
      proposalCount: filteredItems.filter((item) => item.district === district).length
    }));
  }, [districts, filteredItems]);

  const selectedProposal = filteredItems.find((item) => item.proposal.id === selectedProposalId) || null;
  const selectedCenter = votingCenters.find((center) => center.id === selectedCenterId) || null;

  const clearAllFilters = () => {
    setYearFilter('all');
    setCategoryFilter('all');
    setStatusFilter('all');
    setNeighborhoodFilter('all');
    setDistrictFilter('all');
    setMaxProximity(70);
    setMinParticipation(0);
    setMinImpact(0);
    setMinProgress(0);
    setSelectedProposalId(null);
    setSelectedCenterId(null);
  };

  const shownProposalItems = mapMode === 'winning' ? filteredWinningItems : filteredVotingItems;
  const totalParticipation = shownProposalItems.reduce((acc, item) => acc + item.proposal.votes, 0);

  return (
    <div className="h-[calc(100vh-4rem)] relative bg-transparent">
      <div className="h-full w-full relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 14%, rgba(59,130,246,0.34), transparent 18%), radial-gradient(circle at 80% 20%, rgba(168,85,247,0.28), transparent 20%), radial-gradient(circle at 74% 78%, rgba(34,197,94,0.24), transparent 16%), radial-gradient(circle at 20% 82%, rgba(244,114,182,0.2), transparent 18%), linear-gradient(135deg, rgba(239,246,255,0.92), rgba(250,245,255,0.82))',
            backgroundSize: '100% 100%'
          }}
        />

        <div className="absolute inset-0 opacity-70 pointer-events-none">
          <div className="absolute left-[8%] top-[18%] h-24 w-24 rounded-full bg-sky-300 blur-3xl" />
          <div className="absolute right-[10%] top-[14%] h-28 w-28 rounded-full bg-fuchsia-300 blur-3xl" />
          <div className="absolute right-[12%] bottom-[14%] h-28 w-28 rounded-full bg-emerald-300 blur-3xl" />
          <div className="absolute left-[18%] bottom-[14%] h-24 w-24 rounded-full bg-rose-300 blur-3xl" />
        </div>

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="stateFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dbeafe" />
              <stop offset="48%" stopColor="#e9d5ff" />
              <stop offset="100%" stopColor="#dcfce7" />
            </linearGradient>
          </defs>
          <path d={chihuahuaOutlinePath} fill="url(#stateFill)" fillOpacity="0.92" stroke="#334155" strokeWidth="0.7" />
          <path d={chihuahuaOutlinePath} fill="none" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="1.1" />
          <path d={chihuahuaOutlinePath} fill="none" stroke="#7c3aed" strokeOpacity="0.2" strokeWidth="1.6" strokeDasharray="1.1 1.0" />
          <circle cx="34" cy="45" r="8" fill="#34d399" fillOpacity="0.34" />
          <circle cx="61" cy="31" r="9" fill="#60a5fa" fillOpacity="0.3" />
          <circle cx="48" cy="58" r={maxProximity / 1.8} fill="#f472b6" fillOpacity="0.11" />
          <text x="50" y="17" textAnchor="middle" fill="#1e293b" fontSize="4" fontWeight="800" letterSpacing="1.5">CHIHUAHUA</text>
          <text x="28" y="31" textAnchor="middle" fill="#2563eb" fontSize="3" fontWeight="700">Norte</text>
          <text x="66" y="26" textAnchor="middle" fill="#7c3aed" fontSize="3" fontWeight="700">Centro</text>
          <text x="60" y="74" textAnchor="middle" fill="#16a34a" fontSize="3" fontWeight="700">Sur</text>
        </svg>

        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] rounded-full border border-slate-200 bg-white/95 px-4 py-2 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" />
            <span className="font-semibold text-slate-900">Estado base:</span>
            <span>Chihuahua</span>
            <span className="text-slate-400">|</span>
            <span>{mapMode === 'winning' ? 'Propuestas ganadoras' : 'Preseleccion y votacion'}</span>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-[1000] rounded-xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur">
          <div className="flex items-center gap-1">
            {[
              { value: 'preselection', label: 'Preseleccion' },
              { value: 'winning', label: 'Ganadoras' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setMapMode(option.value as MapMode)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${mapMode === option.value ? 'bg-gradient-to-r from-sky-600 to-fuchsia-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {mapMode === 'winning' &&
          filteredWinningItems.map((item) => (
            <div
              key={item.proposal.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: `${item.x}%`, top: `${item.y}%`, zIndex: selectedProposalId === item.proposal.id ? 20 : 10 }}
              onClick={() => {
                setSelectedProposalId(item.proposal.id);
                setSelectedCenterId(null);
              }}
            >
              <div
                <div className={`absolute rounded-full opacity-25 animate-ping ${statusColors[item.proposal.state]}`}
                style={{
                  width: `${24 + Math.min(80, item.participation / 25)}px`,
                  height: `${24 + Math.min(80, item.participation / 25)}px`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
                <div className={`relative w-10 h-10 ${statusColors[item.proposal.state]} rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(15,23,42,0.22)] border-2 border-white hover:scale-110 transition-transform ring-2 ring-white/60`}>
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <div className="bg-white/95 border border-slate-200 px-2 py-1 rounded shadow text-[11px] font-medium text-slate-700">
                  {item.proposal.neighborhood}
                </div>
              </div>
            </div>
          ))}

        {mapMode === 'preselection' &&
          votingCenters.map((center) => (
            <div
              key={center.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: `${center.x}%`, top: `${center.y}%`, zIndex: selectedCenterId === center.id ? 22 : 11 }}
              onClick={() => {
                setSelectedCenterId(center.id);
                setSelectedProposalId(null);
              }}
            >
              <div className="relative w-11 h-11 rounded-full border-2 border-white bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 flex items-center justify-center shadow-[0_10px_20px_rgba(14,165,233,0.28)] hover:scale-110 transition-transform ring-2 ring-white/60">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="bg-white/95 border border-slate-200 px-2 py-1 rounded shadow text-[11px] font-medium text-slate-700">
                  {center.municipality} · {center.district}
                </div>
              </div>
            </div>
          ))}

        {mapMode === 'preselection' &&
          filteredVotingItems.map((item) => (
            <div
              key={item.proposal.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: `${item.x}%`, top: `${item.y}%`, zIndex: selectedProposalId === item.proposal.id ? 20 : 10 }}
              onClick={() => {
                setSelectedProposalId(item.proposal.id);
                setSelectedCenterId(null);
              }}
            >
              <div className={`absolute rounded-full opacity-25 animate-ping ${statusColors.open_for_voting}`} style={{ width: '42px', height: '42px', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
              <div className="relative w-10 h-10 bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(168,85,247,0.28)] border-2 border-white hover:scale-110 transition-transform ring-2 ring-white/60">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="bg-white/95 border border-slate-200 px-2 py-1 rounded shadow text-[11px] font-medium text-slate-700">
                  {item.proposal.title}
                </div>
              </div>
            </div>
          ))}
      </div>

      <button
        onClick={() => setShowFilters(!showFilters)}
        className="md:hidden absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000] flex items-center gap-2"
      >
        <Filter className="w-5 h-5 text-gray-700" />
        <span className="text-sm font-medium">Filtros</span>
      </button>

      <div className={`absolute top-4 left-4 bg-white rounded-xl shadow-lg p-4 z-[1000] w-[22rem] max-w-[calc(100vw-2rem)] ${showFilters ? 'block' : 'hidden md:block'}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Exploración Territorial</h3>
          <button onClick={clearAllFilters} className="text-xs text-fuchsia-700 hover:text-fuchsia-800">Limpiar</button>
        </div>

        <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Mapa interactivo</p>
          <p className="text-xs text-slate-600">
            Chihuahua como base: en preseleccion ves centros de votacion y propuestas por votar; en resultados ves solo ganadoras.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Año</label>
            <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500">
              <option value="all">Todos</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Categoría</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500">
              <option value="all">Todas</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-700 mb-1 block">Estado del proyecto</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500">
              <option value="all">Todos los estados</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{statusLabels[status]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Barrio</label>
            <select value={neighborhoodFilter} onChange={(e) => setNeighborhoodFilter(e.target.value)} className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500">
              <option value="all">Todos</option>
              {neighborhoods.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Distrito</label>
            <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500">
              <option value="all">Todos</option>
              {districts.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <label className="text-xs font-medium text-slate-700 block">Proximidad máxima al centro territorial: {maxProximity}</label>
          <input type="range" min={10} max={90} value={maxProximity} onChange={(e) => setMaxProximity(Number(e.target.value))} className="w-full" />

          <label className="text-xs font-medium text-slate-700 block">Participación mínima: {minParticipation}</label>
          <input type="range" min={0} max={900} step={10} value={minParticipation} onChange={(e) => setMinParticipation(Number(e.target.value))} className="w-full" />

          <label className="text-xs font-medium text-slate-700 block">Impacto mínimo (personas): {minImpact}</label>
          <input type="range" min={0} max={20000} step={100} value={minImpact} onChange={(e) => setMinImpact(Number(e.target.value))} className="w-full" />

          <label className="text-xs font-medium text-slate-700 block">Progreso mínimo del proyecto: {minProgress}%</label>
          <input type="range" min={0} max={100} value={minProgress} onChange={(e) => setMinProgress(Number(e.target.value))} className="w-full" />
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200 text-sm flex items-center justify-between">
          <span className="text-slate-600">Resultados territoriales</span>
          <span className="font-semibold text-slate-900">{filteredItems.length}</span>
        </div>
      </div>

      <button onClick={() => setShowStats(!showStats)} className="md:hidden absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <TrendingUp className="w-5 h-5 text-gray-700" />
      </button>

      <div className={`absolute top-4 right-4 bg-white rounded-xl shadow-lg p-4 z-[1000] w-72 max-w-[calc(100vw-2rem)] ${showStats ? 'block' : 'hidden md:block'}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Transparencia Territorial</h3>
          <button onClick={() => setShowStats(false)} className="md:hidden text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Centro base</span>
            <span className="font-bold text-sky-600">Chihuahua</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Propuestas a votar</span>
            <span className="font-bold text-purple-600">{filteredVotingItems.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Centros de votación</span>
            <span className="font-bold text-fuchsia-600">{votingCenters.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Ganadoras</span>
            <span className="font-bold text-emerald-600">{filteredWinningItems.length}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-slate-600">Participación total</span>
            <span className="font-bold text-slate-900">{totalParticipation.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute bottom-4 left-4 bg-white/95 rounded-xl shadow-lg p-4 z-[1000] border border-slate-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Estados institucionales</h4>
        <div className="space-y-1.5">
          {statusOptions.map((status) => (
            <div key={status} className="flex items-center gap-2 text-xs">
              <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
              <span className="text-slate-700">{statusLabels[status]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-white/95 rounded-lg shadow-lg p-2 z-[1000] flex flex-col gap-2 border border-slate-200">
        <button className="p-2 hover:bg-gray-100 rounded transition-colors">
          <ZoomIn className="w-5 h-5 text-gray-700" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded transition-colors">
          <ZoomOut className="w-5 h-5 text-gray-700" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded transition-colors">
          <Maximize2 className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {selectedProposal && (
        <div className="absolute bottom-4 left-4 right-4 md:bottom-20 md:left-auto md:right-4 bg-white rounded-xl shadow-xl p-4 md:p-6 z-[1100] md:w-96 md:max-w-md">
          <div className="flex items-start justify-between mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${statusColors[selectedProposal.proposal.state]}`}>
              {statusLabels[selectedProposal.proposal.state]}
            </span>
            <button onClick={() => setSelectedProposalId(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">{selectedProposal.proposal.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{selectedProposal.proposal.description}</p>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
            <p className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selectedProposal.proposal.neighborhood}</p>
            <p>{selectedProposal.district}</p>
            <p>Año: {selectedProposal.year}</p>
            <p>Categoría: {selectedProposal.category}</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{selectedProposal.proposal.votes} votos</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{(selectedProposal.proposal.peopleBenefited || 0).toLocaleString()} impacto</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{selectedProposal.progress}% progreso</span>
          </div>

          <div className="text-sm font-semibold text-gray-900">Presupuesto: ${(selectedProposal.proposal.budget / 1000).toFixed(0)}K</div>
        </div>
      )}

      {selectedCenter && !selectedProposal && (
        <div className="absolute bottom-4 left-4 right-4 md:bottom-20 md:left-auto md:right-4 bg-white rounded-xl shadow-xl p-4 md:p-6 z-[1100] md:w-96 md:max-w-md">
          <div className="flex items-start justify-between mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-medium text-sky-700 bg-sky-100">
              Centro de votación
            </span>
            <button onClick={() => setSelectedCenterId(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">{selectedCenter.municipality}</h3>
          <p className="text-sm text-gray-600 mb-3">{selectedCenter.district}</p>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
            <p className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Zona territorial</p>
            <p>Municipio base</p>
            <p>Propuestas cercanas</p>
            <p>{selectedCenter.proposalCount}</p>
          </div>

          <div className="text-sm font-semibold text-gray-900">Vista inicial de Chihuahua</div>
        </div>
      )}
    </div>
  );
}
