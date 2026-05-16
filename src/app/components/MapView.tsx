import { useMemo, useState } from 'react';
import {
  Heart,
  MapPin,
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize2,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';
import { Proposal, ProposalState } from '../App';

interface MapViewProps {
  proposals: Proposal[];
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

const categoryOptions = [
   'parques',
   'iluminación',
   'movilidad',
   'accesibilidad',
   'seguridad',
   'áreas verdes',
   'cultura',
   'deporte',
   'educación'
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
   community_preview: 'Vista comunitaria',
   in_preparation: 'Pre-envío',
   officially_submitted: 'Enviada oficialmente',
   under_institutional_review: 'Bajo revisión institucional',
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

const getDistrict = (neighborhood: string) => districtByNeighborhood[neighborhood] || 'Distrito comunitario';

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

export default function MapView({ proposals }: MapViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(true);

  const [yearFilter, setYearFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [maxProximity, setMaxProximity] = useState(70);
  const [minParticipation, setMinParticipation] = useState(0);
  const [minImpact, setMinImpact] = useState(0);
  const [minProgress, setMinProgress] = useState(0);

  const items = useMemo<TerritorialItem[]>(() => {
    return proposals.map((proposal, index) => {
      const location = buildPoint(proposal.id, index);
      const participation = proposal.votes + proposal.comments * 4;
      const impact = proposal.peopleBenefited || 0;
      const category = normalizeCategory(proposal.category, proposal.title);
      const district = getDistrict(proposal.neighborhood);
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
  }, [
    items,
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

  const selectedItem = filteredItems.find((item) => item.proposal.id === selectedId) || null;

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
  };

  return (
    <div className="h-[calc(100vh-4rem)] relative bg-transparent">
      <div className="h-full w-full relative overflow-hidden rounded-xl border border-slate-200">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="0" y1="30" x2="100" y2="30" stroke="#cbd5e1" strokeWidth="0.35" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#cbd5e1" strokeWidth="0.45" />
          <line x1="0" y1="70" x2="100" y2="70" stroke="#cbd5e1" strokeWidth="0.35" />
          <line x1="30" y1="0" x2="30" y2="100" stroke="#cbd5e1" strokeWidth="0.35" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#cbd5e1" strokeWidth="0.45" />
          <line x1="70" y1="0" x2="70" y2="100" stroke="#cbd5e1" strokeWidth="0.35" />

          <circle cx="38" cy="58" r="8" fill="#a7f3d0" fillOpacity="0.28" />
          <circle cx="62" cy="34" r="9" fill="#bfdbfe" fillOpacity="0.24" />
          <circle cx="47" cy="44" r={maxProximity / 1.8} fill="#f0abfc" fillOpacity="0.08" />
        </svg>

        {filteredItems.map((item) => (
          <div
            key={item.proposal.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{ left: `${item.x}%`, top: `${item.y}%`, zIndex: selectedId === item.proposal.id ? 20 : 10 }}
            onClick={() => setSelectedId(item.proposal.id)}
          >
            <div
              className={`absolute rounded-full opacity-20 animate-ping ${statusColors[item.proposal.state]}`}
              style={{
                width: `${24 + Math.min(80, item.participation / 25)}px`,
                height: `${24 + Math.min(80, item.participation / 25)}px`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
            <div className={`relative w-10 h-10 ${statusColors[item.proposal.state]} rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform`}>
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="bg-white/95 border border-slate-200 px-2 py-1 rounded shadow text-[11px] font-medium text-slate-700">
                {item.proposal.neighborhood}
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
            <span className="text-slate-600">Bajo revisión</span>
            <span className="font-bold text-amber-600">{filteredItems.filter((item) => item.proposal.state === 'under_review').length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Abiertas a votación</span>
            <span className="font-bold text-purple-600">{filteredItems.filter((item) => item.proposal.state === 'open_for_voting').length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">En progreso</span>
            <span className="font-bold text-fuchsia-600">{filteredItems.filter((item) => item.proposal.state === 'in_progress').length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Completadas</span>
            <span className="font-bold text-emerald-600">{filteredItems.filter((item) => item.proposal.state === 'completed').length}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-slate-600">Participación total</span>
            <span className="font-bold text-slate-900">{filteredItems.reduce((acc, item) => acc + item.proposal.votes, 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute bottom-4 left-4 bg-white rounded-xl shadow-lg p-4 z-[1000]">
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

      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2 z-[1000] flex flex-col gap-2">
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

      {selectedItem && (
        <div className="absolute bottom-4 left-4 right-4 md:bottom-20 md:left-auto md:right-4 bg-white rounded-xl shadow-xl p-4 md:p-6 z-[1100] md:w-96 md:max-w-md">
          <div className="flex items-start justify-between mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${statusColors[selectedItem.proposal.state]}`}>
              {statusLabels[selectedItem.proposal.state]}
            </span>
            <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">{selectedItem.proposal.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{selectedItem.proposal.description}</p>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
            <p className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selectedItem.proposal.neighborhood}</p>
            <p>{selectedItem.district}</p>
            <p>Año: {selectedItem.year}</p>
            <p>Categoría: {selectedItem.category}</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{selectedItem.proposal.votes} votos</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{selectedItem.impact.toLocaleString()} impacto</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{selectedItem.progress}% progreso</span>
          </div>

          <div className="text-sm font-semibold text-gray-900">Presupuesto: ${(selectedItem.proposal.budget / 1000).toFixed(0)}K</div>
        </div>
      )}
    </div>
  );
}
