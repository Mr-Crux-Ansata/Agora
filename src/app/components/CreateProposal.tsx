import { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Upload,
  MapPin,
  Users,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface CreateProposalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProposal: (proposal: any) => void;
}

export default function CreateProposal({ isOpen, onClose, onAddProposal }: CreateProposalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [aiHint, setAiHint] = useState('');
  const [formData, setFormData] = useState({
    // Paso 1: Información Básica
    title: '',
    category: '',
    neighborhood: '',

    // Paso 2: Descripción del Proyecto
    description: '',
    justification: '',
    currentSituation: '',
    proposedSolution: '',

    // Paso 3: Beneficiarios e Impacto
    beneficiaries: '',
    estimatedPeople: '',
    targetPopulation: [] as string[],
    expectedImpact: '',

    // Paso 4: Presupuesto y Recursos
    estimatedBudget: '',
    budgetBreakdown: '',
    implementationTime: '',
    maintenancePlan: '',

    // Paso 5: Ubicación y Evidencia
    specificLocation: '',
    coordinates: '',
    supportingDocuments: [] as File[],
    images: [] as File[],

    // Paso 6: Información del Proponente
    proposerName: '',
    proposerEmail: '',
    proposerPhone: '',
    proposerAddress: '',
    organizationName: '',
    isOrganization: false,
  });

  const categories = [
    'Infraestructura',
    'Parques y Recreación',
    'Educación',
    'Salud',
    'Medio Ambiente',
    'Cultura',
    'Deporte',
    'Seguridad',
    'Transporte',
    'Servicios Públicos'
  ];

  const neighborhoods = [
    'Centro',
    'Norte',
    'Sur',
    'Este',
    'Oeste',
    'Zona Industrial',
    'Zona Residencial'
  ];

  const targetPopulations = [
    'Niños y Niñas',
    'Adolescentes',
    'Adultos Mayores',
    'Personas con Discapacidad',
    'Mujeres',
    'Familias',
    'Comunidad en General'
  ];

  const implementationTimes = [
    'Menos de 3 meses',
    '3-6 meses',
    '6-12 meses',
    'Más de 12 meses'
  ];

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const aiText = (base: string, fallback: string) => (base.trim() ? base.trim() : fallback);

  const buildAiDescription = () => {
    const title = aiText(formData.title, 'proyecto comunitario');
    const category = aiText(formData.category, 'infraestructura local');
    const neighborhood = aiText(formData.neighborhood, 'el barrio');
    return `La propuesta ${title} busca mejorar ${neighborhood} mediante acciones concretas en el eje de ${category}. Se plantea una intervencion escalable, de impacto directo y con enfoque de beneficio colectivo para fortalecer la calidad de vida del territorio.`;
  };

  const buildAiJustification = () => {
    const neighborhood = aiText(formData.neighborhood, 'la zona');
    return `Este proyecto es prioritario porque responde a necesidades actuales de ${neighborhood}, reduce brechas de acceso a servicios y mejora condiciones de seguridad, convivencia y bienestar. Su ejecucion contribuira a resultados medibles para la comunidad en el corto y mediano plazo.`;
  };

  const buildAiSolution = () => {
    return `Se propone ejecutar el proyecto en etapas: 1) diagnostico y diseno tecnico, 2) implementacion de obras/acciones principales, 3) validacion comunitaria de resultados y 4) plan de mantenimiento con seguimiento vecinal e institucional.`;
  };

  const buildAiBudgetBreakdown = () => {
    const total = parseInt(formData.estimatedBudget || '0', 10);
    if (!total || total <= 0) {
      return 'Define primero un presupuesto estimado para generar el desglose con IA.';
    }

    const materials = Math.round(total * 0.45);
    const labor = Math.round(total * 0.35);
    const management = Math.round(total * 0.1);
    const contingency = Math.max(total - materials - labor - management, 0);

    return [
      `- Materiales e insumos: $${materials.toLocaleString('es-MX')}`,
      `- Mano de obra y ejecucion: $${labor.toLocaleString('es-MX')}`,
      `- Gestion, permisos y supervision: $${management.toLocaleString('es-MX')}`,
      `- Contingencias: $${contingency.toLocaleString('es-MX')}`
    ].join('\n');
  };

  const applyAiAssist = (action: 'description' | 'justification' | 'solution' | 'all_step2' | 'budget') => {
    if (action === 'description') {
      updateFormData('description', buildAiDescription());
      setAiHint('IA: se genero una descripcion base para tu propuesta.');
      return;
    }

    if (action === 'justification') {
      updateFormData('justification', buildAiJustification());
      setAiHint('IA: se genero una justificacion inicial.');
      return;
    }

    if (action === 'solution') {
      updateFormData('proposedSolution', buildAiSolution());
      setAiHint('IA: se genero una solucion propuesta.');
      return;
    }

    if (action === 'all_step2') {
      updateFormData('description', buildAiDescription());
      updateFormData('currentSituation', aiText(formData.currentSituation, 'Actualmente existe una brecha de cobertura y calidad en el territorio, con afectaciones directas en uso del espacio publico y acceso a servicios comunitarios.'));
      updateFormData('justification', buildAiJustification());
      updateFormData('proposedSolution', buildAiSolution());
      setAiHint('IA: se completo el borrador integral del paso de descripcion.');
      return;
    }

    updateFormData('budgetBreakdown', buildAiBudgetBreakdown());
    setAiHint('IA: se genero un desglose presupuestario sugerido.');
  };

  const handleTargetPopulationToggle = (population: string) => {
    setFormData(prev => ({
      ...prev,
      targetPopulation: prev.targetPopulation.includes(population)
        ? prev.targetPopulation.filter(p => p !== population)
        : [...prev.targetPopulation, population]
    }));
  };

  const handleFileUpload = (field: 'supportingDocuments' | 'images', files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], ...fileArray]
      }));
    }
  };

  const removeFile = (field: 'supportingDocuments' | 'images', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.category && formData.neighborhood);
      case 2:
        return !!(formData.description && formData.justification && formData.currentSituation);
      case 3:
        return !!(formData.beneficiaries && formData.estimatedPeople && formData.targetPopulation.length > 0);
      case 4:
        return !!(formData.estimatedBudget && formData.implementationTime);
      case 5:
        return !!(formData.specificLocation);
      case 6:
        return !!(formData.proposerName && formData.proposerEmail && formData.proposerPhone);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 7));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    const newProposal = {
      title: formData.title,
      description: formData.description || formData.justification,
      author: formData.proposerName,
      authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.proposerName}`,
      neighborhood: formData.neighborhood,
      category: formData.category,
      budget: parseInt(formData.estimatedBudget) || 0,
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop',
      peopleBenefited: parseInt(formData.estimatedPeople) || 0
    };

    onAddProposal(newProposal);
    alert('¡Propuesta enviada exitosamente!');
    onClose();

    // Reset form
    setFormData({
      title: '',
      category: '',
      neighborhood: '',
      description: '',
      justification: '',
      currentSituation: '',
      proposedSolution: '',
      beneficiaries: '',
      estimatedPeople: '',
      targetPopulation: [],
      expectedImpact: '',
      estimatedBudget: '',
      budgetBreakdown: '',
      implementationTime: '',
      maintenancePlan: '',
      specificLocation: '',
      coordinates: '',
      supportingDocuments: [],
      images: [],
      proposerName: '',
      proposerEmail: '',
      proposerPhone: '',
      proposerAddress: '',
      organizationName: '',
      isOrganization: false,
    });
    setCurrentStep(1);
  };

  const steps = [
    { number: 1, title: 'Información Básica' },
    { number: 2, title: 'Descripción' },
    { number: 3, title: 'Beneficiarios' },
    { number: 4, title: 'Presupuesto' },
    { number: 5, title: 'Ubicación' },
    { number: 6, title: 'Proponente' },
    { number: 7, title: 'Revisión' },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[80]" onClick={onClose}></div>

      {/* Modal */}
      <div className="fixed inset-4 sm:inset-8 md:inset-16 bg-white rounded-2xl shadow-2xl z-[90] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white p-4 sm:p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Nueva Propuesta</h2>
                <p className="text-sm text-purple-100">Comparte tu idea con la comunidad</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      currentStep >= step.number
                        ? 'bg-white text-purple-600'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    {currentStep > step.number ? <CheckCircle className="w-5 h-5" /> : step.number}
                  </div>
                  <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 transition-colors ${
                      currentStep > step.number ? 'bg-white' : 'bg-white/20'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Step 1: Información Básica */}
          {currentStep === 1 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Título del Proyecto *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="Ej: Renovación del Parque Central"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Categoría del Proyecto *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateFormData('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Seleccione una categoría</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Barrio / Zona *
                </label>
                <select
                  value={formData.neighborhood}
                  onChange={(e) => updateFormData('neighborhood', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Seleccione un barrio</option>
                  {neighborhoods.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Descripción del Proyecto */}
          {currentStep === 2 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-purple-900">Asistencia IA para redaccion</p>
                    <p className="text-xs text-purple-700 mt-1">Genera o mejora textos del proyecto con un clic. Luego puedes editarlos manualmente.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => applyAiAssist('description')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-white border border-purple-300 text-purple-800 hover:bg-purple-100"
                      >
                        Redactar descripcion
                      </button>
                      <button
                        type="button"
                        onClick={() => applyAiAssist('justification')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-white border border-purple-300 text-purple-800 hover:bg-purple-100"
                      >
                        Mejorar justificacion
                      </button>
                      <button
                        type="button"
                        onClick={() => applyAiAssist('solution')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-white border border-purple-300 text-purple-800 hover:bg-purple-100"
                      >
                        Sugerir solucion
                      </button>
                      <button
                        type="button"
                        onClick={() => applyAiAssist('all_step2')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-purple-600 text-white hover:bg-purple-700"
                      >
                        Completar paso con IA
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Descripción General del Proyecto *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Describe brevemente tu proyecto..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Situación Actual / Problema a Resolver *
                </label>
                <textarea
                  value={formData.currentSituation}
                  onChange={(e) => updateFormData('currentSituation', e.target.value)}
                  placeholder="¿Cuál es el problema o necesidad actual que este proyecto busca resolver?"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Justificación / ¿Por qué es importante este proyecto? *
                </label>
                <textarea
                  value={formData.justification}
                  onChange={(e) => updateFormData('justification', e.target.value)}
                  placeholder="Explica por qué este proyecto beneficiaría a la comunidad..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Solución Propuesta
                </label>
                <textarea
                  value={formData.proposedSolution}
                  onChange={(e) => updateFormData('proposedSolution', e.target.value)}
                  placeholder="Describe cómo tu proyecto resolverá el problema..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Beneficiarios e Impacto */}
          {currentStep === 3 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  ¿Quiénes serán los beneficiarios? *
                </label>
                <textarea
                  value={formData.beneficiaries}
                  onChange={(e) => updateFormData('beneficiaries', e.target.value)}
                  placeholder="Describe quiénes se beneficiarán directamente de este proyecto..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Número Estimado de Personas Beneficiadas *
                </label>
                <input
                  type="number"
                  value={formData.estimatedPeople}
                  onChange={(e) => updateFormData('estimatedPeople', e.target.value)}
                  placeholder="Ej: 500"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Población Objetivo * (Selecciona todas las que apliquen)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {targetPopulations.map(pop => (
                    <label
                      key={pop}
                      className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.targetPopulation.includes(pop)
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.targetPopulation.includes(pop)}
                        onChange={() => handleTargetPopulationToggle(pop)}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-900">{pop}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Impacto Esperado
                </label>
                <textarea
                  value={formData.expectedImpact}
                  onChange={(e) => updateFormData('expectedImpact', e.target.value)}
                  placeholder="Describe el impacto positivo que tendrá este proyecto..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {/* Step 4: Presupuesto y Recursos */}
          {currentStep === 4 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-purple-900">Asistencia IA para presupuesto</p>
                    <p className="text-xs text-purple-700 mt-1">Con base en el monto total, IA puede sugerir un desglose inicial para que lo ajustes.</p>
                    <button
                      type="button"
                      onClick={() => applyAiAssist('budget')}
                      className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-md bg-purple-600 text-white hover:bg-purple-700"
                    >
                      Generar desglose con IA
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Presupuesto Estimado (en pesos) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.estimatedBudget}
                    onChange={(e) => updateFormData('estimatedBudget', e.target.value)}
                    placeholder="150000"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa un monto aproximado del costo total del proyecto
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Desglose Presupuestario
                </label>
                <textarea
                  value={formData.budgetBreakdown}
                  onChange={(e) => updateFormData('budgetBreakdown', e.target.value)}
                  placeholder="Ej:&#10;- Materiales: $80,000&#10;- Mano de obra: $50,000&#10;- Otros: $20,000"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tiempo de Implementación *
                </label>
                <select
                  value={formData.implementationTime}
                  onChange={(e) => updateFormData('implementationTime', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Seleccione un tiempo estimado</option>
                  {implementationTimes.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Plan de Mantenimiento
                </label>
                <textarea
                  value={formData.maintenancePlan}
                  onChange={(e) => updateFormData('maintenancePlan', e.target.value)}
                  placeholder="Describe cómo se mantendrá el proyecto a largo plazo..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {/* Step 5: Ubicación y Evidencia */}
          {currentStep === 5 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Ubicación Específica *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={formData.specificLocation}
                    onChange={(e) => updateFormData('specificLocation', e.target.value)}
                    placeholder="Ej: Parque Central, entre Calle 5 y Avenida Principal"
                    rows={2}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Coordenadas GPS (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.coordinates}
                  onChange={(e) => updateFormData('coordinates', e.target.value)}
                  placeholder="Ej: -34.6037, -58.3816"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Imágenes de Referencia
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Sube fotos del lugar o situación actual
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload('images', e.target.files)}
                    className="hidden"
                    id="images-upload"
                  />
                  <label
                    htmlFor="images-upload"
                    className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors"
                  >
                    Seleccionar Imágenes
                  </label>
                </div>
                {formData.images.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.images.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <button
                          onClick={() => removeFile('images', idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Documentos de Soporte (Opcional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Estudios, planos, cotizaciones, etc.
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    multiple
                    onChange={(e) => handleFileUpload('supportingDocuments', e.target.files)}
                    className="hidden"
                    id="docs-upload"
                  />
                  <label
                    htmlFor="docs-upload"
                    className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors"
                  >
                    Seleccionar Documentos
                  </label>
                </div>
                {formData.supportingDocuments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.supportingDocuments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <button
                          onClick={() => removeFile('supportingDocuments', idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 6: Información del Proponente */}
          {currentStep === 6 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <p className="text-sm text-purple-900">
                  Esta información se mantendrá privada y solo se usará para contacto oficial.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.isOrganization}
                    onChange={(e) => updateFormData('isOrganization', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    Represento a una organización o grupo comunitario
                  </span>
                </label>
              </div>

              {formData.isOrganization && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nombre de la Organización
                  </label>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => updateFormData('organizationName', e.target.value)}
                    placeholder="Ej: Asociación Vecinal del Centro"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nombre Completo del Proponente *
                </label>
                <input
                  type="text"
                  value={formData.proposerName}
                  onChange={(e) => updateFormData('proposerName', e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  value={formData.proposerEmail}
                  onChange={(e) => updateFormData('proposerEmail', e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Teléfono de Contacto *
                </label>
                <input
                  type="tel"
                  value={formData.proposerPhone}
                  onChange={(e) => updateFormData('proposerPhone', e.target.value)}
                  placeholder="Ej: +52 555 123 4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Dirección
                </label>
                <textarea
                  value={formData.proposerAddress}
                  onChange={(e) => updateFormData('proposerAddress', e.target.value)}
                  placeholder="Tu dirección completa"
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {/* Step 7: Revisión */}
          {currentStep === 7 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">
                      ¡Tu propuesta está lista!
                    </h3>
                    <p className="text-sm text-green-700">
                      Revisa la información antes de enviar. Podrás editarla después si es necesario.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Información Básica</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Título:</span> {formData.title}</p>
                    <p><span className="font-medium">Categoría:</span> {formData.category}</p>
                    <p><span className="font-medium">Barrio:</span> {formData.neighborhood}</p>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
                  <p className="text-sm text-gray-700">{formData.description}</p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Beneficiarios</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Personas beneficiadas:</span> {formData.estimatedPeople}</p>
                    <p><span className="font-medium">Población objetivo:</span> {formData.targetPopulation.join(', ')}</p>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Presupuesto</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Monto:</span> ${parseInt(formData.estimatedBudget).toLocaleString()}</p>
                    <p><span className="font-medium">Tiempo:</span> {formData.implementationTime}</p>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Ubicación</h3>
                  <p className="text-sm text-gray-700">{formData.specificLocation}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Proponente</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Nombre:</span> {formData.proposerName}</p>
                    <p><span className="font-medium">Email:</span> {formData.proposerEmail}</p>
                    <p><span className="font-medium">Teléfono:</span> {formData.proposerPhone}</p>
                    {formData.isOrganization && (
                      <p><span className="font-medium">Organización:</span> {formData.organizationName}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 sm:p-6 flex items-center justify-between flex-shrink-0">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <div className="text-sm text-gray-600">
            Paso {currentStep} de {steps.length}
          </div>

          {currentStep < 7 ? (
            <button
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              <CheckCircle className="w-5 h-5" />
              Enviar Propuesta
            </button>
          )}
        </div>
        {aiHint && (
          <div className="px-4 sm:px-6 pb-4 text-xs text-purple-700 bg-purple-50 border-t border-purple-200">
            {aiHint}
          </div>
        )}
      </div>
    </>
  );
}
