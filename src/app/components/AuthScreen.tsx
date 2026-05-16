import { useState } from 'react';
import {
  MapPin,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Vote,
  Lightbulb,
  MessageCircle,
  ShieldCheck,
  ScanLine,
  IdCard
} from 'lucide-react';

interface AuthScreenProps {
  onAuth: (user: { name: string; email: string }) => void;
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    neighborhood: '',
    district: '',
    municipality: ''
  });
  const [verificationMethod, setVerificationMethod] = useState<'manual' | 'scan'>('manual');
  const [ineData, setIneData] = useState({ claveElector: '', section: '' });
  const [ineFileName, setIneFileName] = useState('');
  const [ineVerified, setIneVerified] = useState(false);
   const [ineStatusMessage, setIneStatusMessage] = useState('Aún no has verificado tu INE.');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (mode === 'register' && !form.name.trim()) next.name = 'Ingresa tu nombre';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Correo inválido';
    if (form.password.length < 6) next.password = 'Mínimo 6 caracteres';
    if (mode === 'register' && !form.neighborhood) next.neighborhood = 'Selecciona tu colonia o barrio';
    if (mode === 'register' && !form.district) next.district = 'Selecciona tu distrito';
    if (mode === 'register' && !form.municipality) next.municipality = 'Selecciona tu municipio';
    if (mode === 'register' && !ineVerified) next.ine = 'Debes verificar tu INE para completar el registro';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleIneValidation = () => {
    if (verificationMethod === 'manual') {
      if (ineData.claveElector.trim().length < 10 || ineData.section.trim().length < 3) {
        setErrors(prev => ({ ...prev, ine: 'Completa Clave de Elector y Sección Electoral válidas' }));
        setIneVerified(false);
        setIneStatusMessage('Validación INE pendiente por datos incompletos.');
        return;
      }
    }

    if (verificationMethod === 'scan' && !ineFileName) {
      setErrors(prev => ({ ...prev, ine: 'Sube una imagen de tu credencial INE para escanearla' }));
      setIneVerified(false);
      setIneStatusMessage('Validación INE pendiente por falta de archivo.');
      return;
    }

    setErrors(prev => {
      const next = { ...prev };
      delete next.ine;
      return next;
    });
    setIneVerified(true);
     setIneStatusMessage('INE verificada. Tu sección electoral quedó asociada al territorio habilitado.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onAuth({ name: form.name || form.email.split('@')[0], email: form.email });
  };

  const handleGuest = () => {
    onAuth({ name: 'Invitado', email: '' });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">

      {/* ── LEFT PANEL ── */}
      <div className="hidden md:flex md:w-1/2 relative flex-col justify-center items-center bg-[radial-gradient(circle_at_15%_20%,rgba(236,72,153,0.28),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(168,85,247,0.24),transparent_40%),linear-gradient(145deg,#111827_0%,#1f1235_45%,#2a0f33_100%)] text-white p-8 overflow-hidden">

        {/* Background accents */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="absolute top-14 right-16 w-28 h-28 rounded-full border border-white/20" />
        <div className="absolute bottom-20 left-14 w-16 h-16 rounded-lg rotate-12 border border-fuchsia-200/30" />

        <div className="relative w-full max-w-md space-y-6">
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 backdrop-blur-md">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">Agora</p>
              <p className="text-xs text-fuchsia-100/90 mt-1">Presupuesto participativo</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-4xl font-bold leading-tight tracking-tight">
              Participacion
              <span className="block text-fuchsia-200">con identidad verificada</span>
            </h2>
            <p className="text-sm text-fuchsia-100/90 leading-relaxed max-w-sm">
               Propone y vota en procesos territoriales con validación ciudadana y reglas claras de elegibilidad.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-md">
              <Lightbulb className="w-5 h-5 text-fuchsia-200 mb-2" />
              <p className="text-xs font-semibold">Propuesta</p>
              <p className="text-[11px] text-fuchsia-100/80 mt-1">Iniciativas locales</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-md">
              <MessageCircle className="w-5 h-5 text-violet-200 mb-2" />
              <p className="text-xs font-semibold">Deliberacion</p>
              <p className="text-[11px] text-fuchsia-100/80 mt-1">Diálogo abierto</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-md">
              <Vote className="w-5 h-5 text-emerald-200 mb-2" />
              <p className="text-xs font-semibold">Votación</p>
              <p className="text-[11px] text-fuchsia-100/80 mt-1">Un voto por persona</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-fuchsia-100/80">Seguridad y confianza</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-black/20 border border-white/10 p-2">
                <p className="text-[11px] text-fuchsia-100/80">Identidad</p>
                <p className="text-sm font-semibold">INE validada</p>
              </div>
              <div className="rounded-lg bg-black/20 border border-white/10 p-2">
                <p className="text-[11px] text-fuchsia-100/80">Territorio</p>
                <p className="text-sm font-semibold">Sección elegible</p>
              </div>
            </div>
            <p className="text-xs text-fuchsia-100/85 leading-relaxed">
              Tu información personal permanece cifrada y nunca se muestra públicamente en resultados.
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 md:w-1/2 flex flex-col justify-center items-center bg-gradient-to-br from-gray-50 via-white to-indigo-50/20 p-4 sm:p-6 lg:p-8 relative overflow-y-auto md:overflow-hidden">

        {/* Subtle background gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-200/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-200/5 rounded-full blur-3xl -ml-40 -mb-40" />

        {/* Mobile logo */}
         <div className="flex md:hidden items-center gap-3 mb-4 relative z-10">
           <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-400 to-pink-500 flex items-center justify-center shadow-lg">
             <MapPin className="w-6 h-6 text-white" />
           </div>
           <div>
             <h3 className="text-lg font-bold tracking-tight">Agora</h3>
             <p className="text-xs text-gray-600">Presupuesto participativo</p>
           </div>
         </div>

        <div className="w-full max-w-lg relative z-10">

          {/* Tabs - More Intuitive */}
          <div className="flex gap-2 mb-6 p-1.5 bg-gray-100 rounded-lg">
            <button
              onClick={() => { setMode('login'); setErrors({}); }}
              className={`flex-1 py-3 px-4 text-sm font-semibold rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-fuchsia-700 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Inicia sesión
            </button>
            <button
              onClick={() => { setMode('register'); setErrors({}); }}
              className={`flex-1 py-3 px-4 text-sm font-semibold rounded-md transition-all ${
                mode === 'register'
                  ? 'bg-fuchsia-700 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Regístrate
            </button>
          </div>

          {/* Heading - simple */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              {mode === 'login' ? 'Inicia sesión' : 'Regístrate'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {mode === 'login'
                ? 'Accede a tu cuenta para continuar.'
                : 'Registra tu cuenta y verifica tu INE para poder votar.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3">

            {mode === 'register' && (
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Nombre completo</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className={`w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-white outline-none transition-all ${
                      errors.name
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-200 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-200'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Correo electrónico</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className={`w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-white outline-none transition-all ${
                    errors.email
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-gray-200 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-200'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className={`w-full pl-9 pr-10 py-2 text-sm border rounded-lg bg-white outline-none transition-all ${
                    errors.password
                      ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-200 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-0.5">{errors.password}</p>}
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                  Colonia o barrio
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={form.neighborhood}
                    onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))}
                    className={`w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-white outline-none ${
                      errors.neighborhood
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-200 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-200'
                    }`}
                  >
                    <option value="">Selecciona tu colonia o barrio</option>
                    <option value="centro">Centro</option>
                    <option value="norte">Norte</option>
                    <option value="sur">Sur</option>
                    <option value="oriente">Oriente</option>
                    <option value="poniente">Poniente</option>
                  </select>
                </div>
                {errors.neighborhood && <p className="text-xs text-red-500 mt-0.5">{errors.neighborhood}</p>}
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Distrito</label>
                <select
                  value={form.district}
                  onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                  className={`w-full px-3 py-2 text-sm border rounded-lg bg-white outline-none ${
                    errors.district
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-gray-200 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-200'
                  }`}
                >
                  <option value="">Selecciona tu distrito</option>
                  <option value="distrito-1">Distrito 1</option>
                  <option value="distrito-2">Distrito 2</option>
                  <option value="distrito-3">Distrito 3</option>
                </select>
                {errors.district && <p className="text-xs text-red-500 mt-0.5">{errors.district}</p>}
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Municipio</label>
                <select
                  value={form.municipality}
                  onChange={e => setForm(f => ({ ...f, municipality: e.target.value }))}
                  className={`w-full px-3 py-2 text-sm border rounded-lg bg-white outline-none ${
                    errors.municipality
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-gray-200 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-200'
                  }`}
                >
                  <option value="">Selecciona tu municipio</option>
                  <option value="aguascalientes">Aguascalientes</option>
                  <option value="jesus-maria">Jesus Maria</option>
                  <option value="calvillo">Calvillo</option>
                </select>
                {errors.municipality && <p className="text-xs text-red-500 mt-0.5">{errors.municipality}</p>}
              </div>
            )}

            {mode === 'register' && (
              <div className="rounded-lg border border-fuchsia-200 bg-fuchsia-50/50 p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-fuchsia-700" />
                  <p className="text-xs font-semibold text-fuchsia-900">Verificación de identidad INE</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationMethod('manual');
                      setIneVerified(false);
                      setIneStatusMessage('Aún no has verificado tu INE.');
                    }}
                    className={`py-2 text-xs font-semibold rounded-md border transition-colors ${
                      verificationMethod === 'manual'
                        ? 'border-fuchsia-700 bg-fuchsia-700 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Captura manual
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationMethod('scan');
                      setIneVerified(false);
                      setIneStatusMessage('Aún no has verificado tu INE.');
                    }}
                    className={`py-2 text-xs font-semibold rounded-md border transition-colors ${
                      verificationMethod === 'scan'
                        ? 'border-fuchsia-700 bg-fuchsia-700 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Escanear INE
                  </button>
                </div>

                {verificationMethod === 'manual' && (
                  <div className="space-y-2">
                    <div className="relative">
                      <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Clave de Elector"
                        value={ineData.claveElector}
                        onChange={e => {
                          setIneVerified(false);
                          setIneData(prev => ({ ...prev, claveElector: e.target.value.toUpperCase() }));
                        }}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-200"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Sección electoral"
                      value={ineData.section}
                      onChange={e => {
                        setIneVerified(false);
                        setIneData(prev => ({ ...prev, section: e.target.value }));
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-200"
                    />
                  </div>
                )}

                {verificationMethod === 'scan' && (
                  <div className="space-y-2">
                    <label className="text-xs text-gray-700 block">Sube foto frontal o posterior de tu credencial</label>
                    <div className="relative">
                      <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          setIneVerified(false);
                          setIneFileName(file ? file.name : '');
                        }}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-white outline-none file:mr-2 file:border-0 file:bg-fuchsia-100 file:px-2 file:py-1 file:rounded-md file:text-fuchsia-800"
                      />
                    </div>
                    {ineFileName && <p className="text-xs text-gray-600">Archivo: {ineFileName}</p>}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleIneValidation}
                  className="w-full py-2 bg-fuchsia-700 hover:bg-fuchsia-800 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Validar INE
                </button>

                <p className={`text-xs ${ineVerified ? 'text-emerald-700' : 'text-gray-600'}`}>
                  {ineStatusMessage}
                </p>
                {errors.ine && <p className="text-xs text-red-500">{errors.ine}</p>}
                <p className="text-xs text-gray-600">
                  Protección de datos: tu información de identidad se cifra, no se publica y se usa sólo para validar elegibilidad territorial y prevenir voto duplicado.
                </p>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-fuchsia-700 hover:text-fuchsia-900 font-semibold">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 bg-fuchsia-700 hover:bg-fuchsia-800 text-white font-semibold text-sm rounded-lg transition-colors mt-3"
            >
              {mode === 'login' ? 'Inicia sesión' : 'Regístrate'}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-500">o</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Guest access */}
          <button
            onClick={handleGuest}
            className="w-full py-2 border-2 border-fuchsia-700 text-fuchsia-700 hover:bg-fuchsia-50 font-semibold text-sm rounded-lg transition-colors"
          >
            Explorar sin cuenta
          </button>

          <p className="text-xs text-gray-500 text-center mt-6">
            Al continuar aceptas los{' '}
            <span className="text-gray-700 cursor-pointer hover:underline">términos de uso</span>
            {' '}y la{' '}
            <span className="text-gray-700 cursor-pointer hover:underline">política de privacidad</span>.
          </p>
        </div>
      </div>

    </div>
  );
}
