import { useState } from 'react';
import {
  Heart,
  MapPin,
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize2,
  TrendingUp
} from 'lucide-react';

interface Proposal {
  id: string;
  title: string;
  description: string;
  location: { x: number; y: number }; // Percentage-based positioning
  status: 'proposed' | 'voting' | 'approved' | 'construction' | 'completed';
  category: 'infrastructure' | 'parks' | 'education' | 'health' | 'environment';
  votes: number;
  budget: number;
  author: string;
  neighborhood: string;
  impact: {
    peopleBenefited?: number;
    treesPlanted?: number;
    areasRehabilitatedSqm?: number;
  };
}

const statusColors = {
  proposed: 'bg-gray-500',
  voting: 'bg-purple-500',
  approved: 'bg-violet-500',
  construction: 'bg-fuchsia-500',
  completed: 'bg-indigo-500',
};

const statusLabels = {
  proposed: 'Propuesta',
  voting: 'Abierta a Votación',
  approved: 'Aprobada',
  construction: 'En Construcción',
  completed: 'Completada',
};

// Mock data with percentage-based positioning
const mockProposals: Proposal[] = [
  {
    id: '1',
    title: 'Renovación del Parque Comunitario',
    description: 'Renovar el parque local con nuevos juegos infantiles, senderos y áreas verdes.',
    location: { x: 45, y: 35 },
    status: 'voting',
    category: 'parks',
    votes: 342,
    budget: 150000,
    author: 'María Santos',
    neighborhood: 'Centro',
    impact: { peopleBenefited: 5000, treesPlanted: 50, areasRehabilitatedSqm: 2500 }
  },
  {
    id: '2',
    title: 'Nuevas Ciclovías en Avenida Principal',
    description: 'Instalar ciclovías protegidas para mejorar la seguridad de ciclistas.',
    location: { x: 55, y: 40 },
    status: 'construction',
    category: 'infrastructure',
    votes: 521,
    budget: 250000,
    author: 'Juan Chen',
    neighborhood: 'Centro',
    impact: { peopleBenefited: 8000 }
  },
  {
    id: '3',
    title: 'Iniciativa de Huertos Urbanos',
    description: 'Crear huertos comunitarios para residentes locales.',
    location: { x: 35, y: 60 },
    status: 'completed',
    category: 'environment',
    votes: 287,
    budget: 75000,
    author: 'Ana Rodríguez',
    neighborhood: 'Distrito Sur',
    impact: { peopleBenefited: 300, treesPlanted: 20, areasRehabilitatedSqm: 800 }
  },
  {
    id: '4',
    title: 'Actualización Tecnológica Biblioteca Pública',
    description: 'Modernizar la biblioteca con nuevas computadoras e internet.',
    location: { x: 65, y: 25 },
    status: 'approved',
    category: 'education',
    votes: 456,
    budget: 200000,
    author: 'David Kim',
    neighborhood: 'Zona Este',
    impact: { peopleBenefited: 10000 }
  },
  {
    id: '5',
    title: 'Mejora de Iluminación Pública',
    description: 'Instalar luces LED de bajo consumo energético.',
    location: { x: 25, y: 45 },
    status: 'proposed',
    category: 'infrastructure',
    votes: 198,
    budget: 120000,
    author: 'Sofía Martínez',
    neighborhood: 'Zona Oeste',
    impact: { peopleBenefited: 3000 }
  }
];

export default function MapView() {
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(true);

  const filteredProposals = mockProposals.filter(proposal => {
    if (filterStatus !== 'all' && proposal.status !== filterStatus) return false;
    if (filterCategory !== 'all' && proposal.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="h-[calc(100vh-4rem)] relative bg-gray-100">
      {/* Map Area */}
      <div className="h-full w-full relative overflow-hidden">
        {/* Grid Pattern Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(156, 163, 175, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(156, 163, 175, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* City Map Representation */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Streets */}
          <line x1="0" y1="30" x2="100" y2="30" stroke="#cbd5e1" strokeWidth="0.3" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#cbd5e1" strokeWidth="0.5" />
          <line x1="0" y1="70" x2="100" y2="70" stroke="#cbd5e1" strokeWidth="0.3" />
          <line x1="30" y1="0" x2="30" y2="100" stroke="#cbd5e1" strokeWidth="0.3" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#cbd5e1" strokeWidth="0.5" />
          <line x1="70" y1="0" x2="70" y2="100" stroke="#cbd5e1" strokeWidth="0.3" />

          {/* Green spaces */}
          <circle cx="45" cy="35" r="8" fill="#86efac" fillOpacity="0.3" />
          <circle cx="35" cy="60" r="6" fill="#86efac" fillOpacity="0.3" />

          {/* Buildings */}
          <rect x="20" y="20" width="5" height="5" fill="#94a3b8" fillOpacity="0.4" />
          <rect x="60" y="15" width="6" height="6" fill="#94a3b8" fillOpacity="0.4" />
          <rect x="75" y="40" width="4" height="4" fill="#94a3b8" fillOpacity="0.4" />
          <rect x="15" y="75" width="5" height="5" fill="#94a3b8" fillOpacity="0.4" />
        </svg>

        {/* Project Markers */}
        {filteredProposals.map((proposal) => (
          <div
            key={proposal.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{
              left: `${proposal.location.x}%`,
              top: `${proposal.location.y}%`,
              zIndex: selectedProposal?.id === proposal.id ? 20 : 10
            }}
            onClick={() => setSelectedProposal(proposal)}
          >
            {/* Pulse effect */}
            <div className={`absolute inset-0 ${statusColors[proposal.status]} rounded-full opacity-20 animate-ping`}></div>

            {/* Marker */}
            <div className={`relative w-10 h-10 ${statusColors[proposal.status]} rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform`}>
              <MapPin className="w-5 h-5 text-white" />
            </div>

            {/* Label */}
            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <div className="bg-white px-2 py-1 rounded shadow text-xs font-medium text-gray-700">
                {proposal.neighborhood}
              </div>
            </div>
          </div>
        ))}

        {/* Participation heatmap circles */}
        {filteredProposals.map((proposal) => (
          <div
            key={`heat-${proposal.id}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${proposal.location.x}%`,
              top: `${proposal.location.y}%`,
              width: '200px',
              height: '200px',
              transform: 'translate(-50%, -50%)',
              background: proposal.status === 'completed'
                ? 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
            }}
          />
        ))}
      </div>

      {/* Floating Filter Toggle Button - Mobile */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="md:hidden absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000] flex items-center gap-2"
      >
        <Filter className="w-5 h-5 text-gray-700" />
        <span className="text-sm font-medium">Filtros</span>
      </button>

      {/* Floating Filter Panel */}
      <div className={`absolute top-4 left-4 bg-white rounded-xl shadow-lg p-4 z-[1000] w-80 max-w-[calc(100vw-2rem)] ${showFilters ? 'block' : 'hidden md:block'}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Filtrar Proyectos</h3>
          <button
            onClick={() => setShowFilters(false)}
            className="md:hidden text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Estado</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Todos los Estados</option>
              <option value="proposed">Propuesta</option>
              <option value="voting">Abierta a Votación</option>
              <option value="approved">Aprobada</option>
              <option value="construction">En Construcción</option>
              <option value="completed">Completada</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Categoría</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Todas las Categorías</option>
              <option value="infrastructure">Infraestructura</option>
              <option value="parks">Parques y Recreación</option>
              <option value="education">Educación</option>
              <option value="health">Salud</option>
              <option value="environment">Medio Ambiente</option>
            </select>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Mostrando</span>
            <span className="font-semibold text-gray-900">{filteredProposals.length} proyectos</span>
          </div>
        </div>
      </div>

      {/* Legend - Hidden on mobile to avoid overlap */}
      <div className="hidden lg:block absolute bottom-4 left-4 bg-white rounded-xl shadow-lg p-4 z-[1000]">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Estado del Proyecto</h4>
        <div className="space-y-2">
          {Object.entries(statusLabels).map(([status, label]) => (
            <div key={status} className="flex items-center gap-2 text-xs">
              <div className={`w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors]}`}></div>
              <span className="text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Toggle Button - Mobile */}
      <button
        onClick={() => setShowStats(!showStats)}
        className="md:hidden absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]"
      >
        <TrendingUp className="w-5 h-5 text-gray-700" />
      </button>

      {/* Quick Stats */}
      <div className={`absolute top-4 right-4 bg-white rounded-xl shadow-lg p-4 z-[1000] w-64 max-w-[calc(100vw-2rem)] ${showStats ? 'block' : 'hidden md:block'}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Impacto Comunitario</h3>
          <button
            onClick={() => setShowStats(false)}
            className="md:hidden text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Propuestas Activas</span>
              <span className="text-lg font-bold text-purple-600">
                {mockProposals.filter(p => p.status === 'voting').length}
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">En Construcción</span>
              <span className="text-lg font-bold text-fuchsia-600">
                {mockProposals.filter(p => p.status === 'construction').length}
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Completados</span>
              <span className="text-lg font-bold text-indigo-600">
                {mockProposals.filter(p => p.status === 'completed').length}
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Votos Totales</span>
              <span className="text-lg font-bold text-gray-900">
                {mockProposals.reduce((acc, p) => acc + p.votes, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Controls */}
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

      {/* Selected Proposal Card */}
      {selectedProposal && (
        <div className="absolute bottom-4 left-4 right-4 md:bottom-20 md:left-auto md:right-4 bg-white rounded-xl shadow-xl p-4 md:p-6 z-[1100] md:w-80 md:max-w-md">
          <div className="flex items-start justify-between mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${statusColors[selectedProposal.status]}`}>
              {statusLabels[selectedProposal.status]}
            </span>
            <button
              onClick={() => setSelectedProposal(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">{selectedProposal.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{selectedProposal.description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {selectedProposal.votes} votos
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {selectedProposal.neighborhood}
            </span>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            Presupuesto: ${(selectedProposal.budget / 1000).toFixed(0)}K
          </div>
          {selectedProposal.impact.peopleBenefited && (
            <div className="text-xs text-gray-600 mt-1">
              Impacto: {selectedProposal.impact.peopleBenefited.toLocaleString()} personas beneficiadas
            </div>
          )}
          <button
            onClick={() => setSelectedProposal(null)}
            className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
          >
            Ver Detalles
          </button>
        </div>
      )}
    </div>
  );
}
