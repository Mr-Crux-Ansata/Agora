import { CheckCircle2, Clock3, MapPin, Search, Trophy, Users } from 'lucide-react';
import { Proposal } from '../App';

interface ResultsSectionProps {
  proposals: Proposal[];
}

export default function ResultsSection({ proposals }: ResultsSectionProps) {
  const winningProjects = proposals.filter(
    (proposal) => proposal.state === 'winning_project' || proposal.isWinningProject
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 p-5 text-white shadow-lg mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100">Pestana especial</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Resultados de Proyectos Ganadores</h1>
            <p className="text-sm text-indigo-100 mt-1">Esta seccion solo muestra proyectos ganadores tras votacion ciudadana.</p>
          </div>
          <div className="rounded-lg bg-white/20 px-4 py-3 text-xs">
            <p className="text-indigo-100">Ganadores publicados</p>
            <p className="text-2xl font-extrabold text-white">{winningProjects.length}</p>
          </div>
        </div>
      </div>

      {winningProjects.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-slate-200 bg-white">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Aun no hay proyectos ganadores</h3>
          <p className="text-slate-600">Cuando se definan ganadores en votacion, apareceran aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {winningProjects.map((proposal) => (
            <div key={proposal.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-indigo-100">
              <div className="h-48 bg-gray-200 relative">
                <img src={proposal.image} alt={proposal.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full inline-flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  Ganador
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">
                  {proposal.category}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{proposal.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{proposal.description}</p>

                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <p className="inline-flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500" />{proposal.neighborhood}</p>
                  <p className="inline-flex items-center gap-2"><Users className="w-4 h-4 text-gray-500" />{proposal.peopleBenefited?.toLocaleString() || 'N/D'} personas beneficiadas</p>
                  <p className="inline-flex items-center gap-2"><Clock3 className="w-4 h-4 text-gray-500" />Estado actual: {proposal.state}</p>
                </div>

                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Proyecto ganador validado por votacion ciudadana.
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
