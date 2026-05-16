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
  CheckCircle2
} from 'lucide-react';

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

const completedProjects = [
  {
    id: '1',
    title: 'Urban Garden Initiative',
    neighborhood: 'South District',
    completedDate: 'March 2026',
    impact: {
      treesPlanted: 20,
      peopleBenefited: 300,
      areasRehabilitatedSqm: 800
    },
    image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Downtown Pedestrian Zone',
    neighborhood: 'Downtown',
    completedDate: 'February 2026',
    impact: {
      peopleBenefited: 15000,
      areasRehabilitatedSqm: 5000
    },
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&auto=format&fit=crop'
  },
  {
    id: '3',
    title: 'Solar Panel Installation - Schools',
    neighborhood: 'East Side',
    completedDate: 'January 2026',
    impact: {
      energySavedKwh: 150000,
      peopleBenefited: 5000
    },
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format&fit=crop'
  }
];

export default function Impact() {
  const totalStats = [
    {
      label: 'Árboles Plantados',
      value: '1,245',
      icon: TreeDeciduous,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Personas Beneficiadas',
      value: '45,300',
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      label: 'Proyectos Completados',
      value: '35',
      icon: CheckCircle2,
      color: 'text-fuchsia-600',
      bg: 'bg-fuchsia-50'
    },
    {
      label: 'Inversión Total',
      value: '$3.2M',
      icon: TrendingUp,
      color: 'text-violet-600',
      bg: 'bg-violet-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Impacto Comunitario</h1>
          <p className="text-lg md:text-xl text-purple-100">
            Conoce el impacto real del presupuesto participativo en tu comunidad
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Total Impact Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {totalStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Investment by Neighborhood */}
          <div className="bg-white rounded-xl shadow-sm p-6">
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
          <div className="bg-white rounded-xl shadow-sm p-6">
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
          <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
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

        {/* Completed Projects Showcase */}
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Proyectos Completados Recientemente</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {completedProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="h-48 bg-gray-200">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{project.neighborhood}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">Completado {project.completedDate}</p>

                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900">Métricas de Impacto:</h4>
                    {project.impact.treesPlanted && (
                      <div className="flex items-center gap-2 text-sm">
                        <TreeDeciduous className="w-4 h-4 text-green-600" />
                        <span className="text-gray-700">
                          <span className="font-semibold">{project.impact.treesPlanted}</span> árboles plantados
                        </span>
                      </div>
                    )}
                    {project.impact.peopleBenefited && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-700">
                          <span className="font-semibold">{project.impact.peopleBenefited.toLocaleString()}</span> personas beneficiadas
                        </span>
                      </div>
                    )}
                    {project.impact.areasRehabilitatedSqm && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-fuchsia-600" />
                        <span className="text-gray-700">
                          <span className="font-semibold">{project.impact.areasRehabilitatedSqm}</span> m² rehabilitados
                        </span>
                      </div>
                    )}
                    {project.impact.energySavedKwh && (
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className="w-4 h-4 text-yellow-600" />
                        <span className="text-gray-700">
                          <span className="font-semibold">{project.impact.energySavedKwh.toLocaleString()}</span> kWh/año ahorrados
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="bg-gradient-to-br from-green-50 to-purple-50 rounded-xl p-6 md:p-8 border border-green-100">
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
