/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Users, 
  Send, 
  LayoutDashboard, 
  Settings as SettingsIcon,
  MapPin,
  Globe,
  Mail,
  Phone,
  ArrowRight,
  Trash2,
  ExternalLink,
  MessageCircle,
  FileText,
  LogIn,
  LogOut,
  Loader2
} from 'lucide-react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Toaster, toast } from 'sonner';
import { CocrearLogo, CocrearHero } from './components/CocrearBrand';
import { LeadSearch } from './components/LeadSearch';
import { auth } from './lib/firebase';

// Types
import { Lead } from './types.ts';
import * as db from './lib/storage';

const MAPS_API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'leads' | 'campaign' | 'settings'>('home');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [customMapsApiKey, setCustomMapsApiKey] = useState(localStorage.getItem('google_maps_api_key') || '');

  const effectiveMapsKey = customMapsApiKey || MAPS_API_KEY;
  const isMapsKeyConfigured = Boolean(effectiveMapsKey) && effectiveMapsKey !== 'YOUR_API_KEY';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) {
        refreshLeads();
      } else {
        setLeads([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const refreshLeads = async () => {
    const data = await db.getLeads();
    setLeads(data);
  };

  const handleSaveLead = async (lead: Lead) => {
    try {
      await db.saveLead(lead);
      await refreshLeads();
      toast.success('Lead guardado exitosamente');
    } catch (error) {
      console.error('Error saving lead:', error);
      toast.error('Error al guardar el lead. Verifique los permisos.');
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await db.deleteLead(id);
      await refreshLeads();
      toast.success('Lead eliminado');
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Error al eliminar el lead');
    }
  };

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.code === 'auth/unauthorized-domain') {
        toast.error('Dominio no autorizado', {
          description: 'Este dominio no está en la lista de dominios autorizados de Firebase Auth. Debes agregarlo en la Consola de Firebase.'
        });
        console.warn('Para solucionar esto: \n1. Ve a Firebase Console > Authentication > Settings > Authorized domains \n2. Agrega este dominio: ' + window.location.hostname);
      } else {
        toast.error('Error al iniciar sesión: ' + error.message);
      }
    }
  };

  const logout = () => signOut(auth);

  const [template, setTemplate] = useState(`Hola, un gusto saludarte. Soy de Cocrear Córdoba. Te contacto porque somos proveedores integrales para el sector {categoria}.

Queremos que sepas que alquilamos y realizamos mantenimientos de maquinarias. Somos tu aliado estratégico para equipar a todo tu equipo con soluciones integrales:

• ALQUILER DE MAQUINARIA Y EQUIPO:
- Hormigón: Hormigoneras, vibradores, reglas y allanadoras.
- Compactación: Pisones canguro, planchas y rodillos (hasta 400kg).
- Energía: Generadores y grupos electrógenos (hasta 500 kVA).
- Altura: Andamios tubulares, puntales y electro guinches.
- Demolición y Corte: Martillos demoledores y cortadoras de pavimento.
- Terminaciones: Pulidoras de pisos y máquinas de pintar.

• SERVICIO TÉCNICO ESPECIALIZADO:
- Reparación técnica de Compresores e Hidrolavadoras (todas las marcas).
- Provisión de repuestos originales para maquinaria de construcción.

• INSUMOS, EPP E INDUMENTARIA:
- Seguridad: Calzado, guantes, cascos y anteojos.
- Ropa de Trabajo: Pantalones, camisas y mamelucos.
- Herramientas manuales y elementos de señalización.

Te adjunto nuestra propuesta detallada en PDF para que veas cómo podemos ayudarte a optimizar costos y cuidar a tu personal. Si no deseas recibir más info, solo avísame. ¡Saludos!`);

  const startWhatsApp = (phone: string, name: string, city: string = 'su ciudad', category: string = 'su rubro') => {
    const cleanPhone = phone.replace(/\D/g, '');
    const personalizedMessage = template
      .replace(/{nombre}/g, name)
      .replace(/{ciudad}/g, city)
      .replace(/{categoria}/g, category);
    
    const message = encodeURIComponent(personalizedMessage);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const sendEmail = (email: string, name: string, city: string = 'su ciudad', category: string = 'su rubro') => {
    const personalizedMessage = template
      .replace(/{nombre}/g, name)
      .replace(/{ciudad}/g, city)
      .replace(/{categoria}/g, category);
    
    const subject = encodeURIComponent(`Propuesta Comercial para ${name}`);
    const body = encodeURIComponent(personalizedMessage);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('google_maps_api_key', customMapsApiKey);
    toast.success('Configuración guardada', {
      description: 'Es posible que deba recargar la página para que los cambios en la API Key surtan efecto por completo.'
    });
  };

  const runCampaign = (mode: 'whatsapp' | 'email') => {
    if (mode === 'whatsapp') {
      const leadsWithPhone = leads.filter(l => !!l.phone);
      if (leadsWithPhone.length === 0) {
        toast.error('No hay leads con teléfono para iniciar la campaña.');
        return;
      }
      toast.info(`Iniciando secuencia WhatsApp para ${leadsWithPhone.length} leads.`);
      const first = leadsWithPhone[0];
      startWhatsApp(first.phone!, first.name, first.address, first.category);
    } else {
      const leadsWithEmail = leads.filter(l => !!l.email);
      if (leadsWithEmail.length === 0) {
        toast.error('No hay leads con email registrado para esta campaña.');
        return;
      }
      toast.info(`Iniciando secuencia Email para ${leadsWithEmail.length} leads.`);
      const first = leadsWithEmail[0];
      sendEmail(first.email!, first.name, first.address, first.category);
    }
  };

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    try {
      await db.saveLead(editingLead);
      await refreshLeads();
      setEditingLead(null);
      toast.success('Lead actualizado');
    } catch (error) {
      toast.error('Error al actualizar lead');
    }
  };

  const previewProposal = () => {
    if (leads.length === 0) {
      toast.error('Necesita al menos un lead para generar una vista previa.');
      return;
    }
    setShowPreviewModal(true);
  };

  const getPersonalizedMessage = (l: Lead) => {
    return template
      .replace(/{nombre}/g, l.name)
      .replace(/{ciudad}/g, l.address.split(',')[1]?.trim() || l.address)
      .replace(/{categoria}/g, l.category);
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0B]">
        <Loader2 className="animate-spin text-orange-600" size={40} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-6 text-center">
        <CocrearLogo />
        <div className="mt-12 max-w-md w-full bg-[#141417] p-10 rounded-3xl shadow-2xl border border-white/5">
          <h1 className="text-3xl font-black mb-4 text-white">Bienvenido a Lead Gen</h1>
          <p className="text-white/40 mb-8">Gestione sus prospectos y campañas de outreach comercial de manera profesional.</p>
          <button 
            onClick={login}
            className="w-full flex items-center justify-center gap-3 bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-500 transition shadow-lg shadow-orange-900/20"
          >
            <LogIn size={20} />
            Continuar con Google
          </button>
        </div>
        <p className="mt-8 text-white/20 text-sm italic">Copyright © 2024 Cocrear.ar</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={effectiveMapsKey} version="weekly">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* API Key Missing Warning */}
      {!isMapsKeyConfigured && activeTab === 'search' && (
        <div className="bg-orange-600/10 border-b border-orange-500/20 px-4 py-3 text-center">
          <p className="text-sm font-medium text-orange-400 flex items-center justify-center gap-2">
            <SettingsIcon size={16} />
            Configuración requerida: Para usar el buscador, agregue su <strong>GOOGLE_MAPS_PLATFORM_KEY</strong> en la <button onClick={() => setActiveTab('settings')} className="underline font-bold">pestaña de Configuración</button>.
          </p>
        </div>
      )}
      
      {/* PDF Preview Simulation Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white text-slate-900 w-full max-w-2xl h-[90vh] max-h-[1000px] rounded-xl shadow-2xl overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* PDF Header Mockup */}
              <div className="bg-[#141417] p-5 flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500 p-2 rounded-lg">
                    <FileText size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold leading-tight">Propuesta_Cocrear_2024.pdf</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">Escaneado & Verificado</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPreviewModal(false)} 
                  className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 transition"
                >
                  <Trash2 size={18} className="text-white/40" />
                </button>
              </div>
              
              <div className="p-8 md:p-16 font-serif overflow-y-auto flex-1 bg-[#f9fafb] relative">
                {/* PDF Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                  <div className="text-[150px] font-black -rotate-45 text-slate-200 uppercase">COCREAR</div>
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-16">
                    <div className="flex flex-col">
                      <div className="text-orange-600 font-black text-3xl tracking-tighter mb-1">COCREAR.AR</div>
                      <div className="text-[9px] text-gray-400 font-sans font-bold uppercase tracking-[0.2em]">Agencia de Inteligencia Digital</div>
                    </div>
                    <div className="text-right text-[10px] text-gray-400 font-sans uppercase tracking-widest leading-relaxed">
                      Fecha: {new Date().toLocaleDateString()}<br />
                      Ref: 24-{leads[0]?.id.substring(0, 8)}<br />
                      Página: 01 / 01
                    </div>
                  </div>

                  <div className="mb-12">
                    <div className="h-1 w-20 bg-orange-600 mb-6"></div>
                    <h1 className="text-4xl font-bold mb-4 tracking-tight leading-none text-slate-900">Propuesta de Transformación Digital</h1>
                    <p className="text-sm text-gray-400 italic">Documento confidencial preparado para: <span className="text-slate-900 font-bold not-italic">{leads[0]?.name}</span></p>
                  </div>

                  <div className="whitespace-pre-wrap text-base leading-loose text-slate-700 mb-16 font-medium">
                    {leads[0] ? getPersonalizedMessage(leads[0]) : ''}
                  </div>

                  <div className="border-t border-gray-200 pt-12 grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Impacto Proyectado</p>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 w-4/5"></div>
                      </div>
                      <p className="text-[11px] text-gray-500 font-sans">+85% Alcance en {leads[0]?.address.split(',')[1]?.trim() || 'su zona'}</p>
                    </div>
                    <div className="space-y-3 text-right">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Validado por</p>
                      <div className="font-serif italic text-lg text-slate-800">Cocrear Team AI</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#141417] p-8 flex flex-col items-center gap-4">
                <p className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-black">Fin de la Vista Previa del Documento</p>
                <button 
                  onClick={() => setShowPreviewModal(false)}
                  className="bg-orange-600 text-white px-12 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-orange-500 transition shadow-xl shadow-orange-900/20"
                >
                  Regresar al Panel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {editingLead && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setEditingLead(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#141417] text-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-white/10 max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-white/5 p-6 border-b border-white/5 flex justify-between items-center shrink-0">
                <h3 className="text-xl font-bold">Editar Lead</h3>
                <button onClick={() => setEditingLead(null)} className="text-white/40 hover:text-white">
                  <Trash2 size={20} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto">
                <form onSubmit={handleUpdateLead} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Nombre de Empresa</label>
                    <input 
                      className="w-full p-4 bg-black/40 border border-white/10 rounded-xl outline-none focus:border-orange-500 transition"
                      value={editingLead.name}
                      onChange={e => setEditingLead({...editingLead, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Email de Contacto</label>
                    <input 
                      className="w-full p-4 bg-black/40 border border-white/10 rounded-xl outline-none focus:border-orange-500 transition"
                      placeholder="ejemplo@empresa.com"
                      value={editingLead.email || ''}
                      onChange={e => setEditingLead({...editingLead, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Sector / Categoría</label>
                    <input 
                      className="w-full p-4 bg-black/40 border border-white/10 rounded-xl outline-none focus:border-orange-500 transition text-orange-400 font-bold"
                      value={editingLead.category}
                      onChange={e => setEditingLead({...editingLead, category: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Teléfono (WhatsApp)</label>
                    <input 
                      className="w-full p-4 bg-black/40 border border-white/10 rounded-xl outline-none focus:border-orange-500 transition"
                      value={editingLead.phone || ''}
                      onChange={e => setEditingLead({...editingLead, phone: e.target.value})}
                    />
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setEditingLead(null)}
                      className="flex-1 py-4 bg-white/5 rounded-xl font-bold hover:bg-white/10 transition"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 bg-orange-600 rounded-xl font-bold hover:bg-orange-500 transition"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-[#0A0A0B] text-slate-200 font-sans pb-20">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0B]/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-8">
                <CocrearLogo />
                <div className="hidden md:flex items-center gap-1">
                  <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} label="Inicio" />
                  <NavButton active={activeTab === 'search'} onClick={() => setActiveTab('search')} label="Buscador" />
                  <NavButton active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} label="Mis Leads" />
                  <NavButton active={activeTab === 'campaign'} onClick={() => setActiveTab('campaign')} label="Campañas PDF" />
                  <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Configuración" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end mr-1 text-right">
                  <span className="text-xs font-bold text-white tracking-tight">{user.displayName}</span>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">{leads.length} leads guardados</span>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-white/10" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-300"></div>
                )}
                <div className="h-4 w-px bg-white/10 mx-1" />
                <button 
                  onClick={logout}
                  className="p-2 text-white/40 hover:text-red-500 transition"
                  title="Cerrar Sesión"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Content */}
        <main>
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CocrearHero />
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard 
                      icon={<Search className="text-orange-500" />}
                      title="Búsqueda Inteligente"
                      description="Encuentre carpinterías, metalúrgicas y más usando la potencia de Google Maps."
                    />
                    <FeatureCard 
                      icon={<Users className="text-orange-500" />}
                      title="Gestión de Leads"
                      description="Guarde los contactos, clasifíquelos y tenga una base de datos organizada."
                    />
                    <FeatureCard 
                      icon={<Send className="text-orange-500" />}
                      title="Envíos Masivos Seguros"
                      description="Automatice sus propuestas con intervalos de tiempo para proteger su WhatsApp Business."
                    />
                  </div>
                  <div className="mt-16 text-center">
                    <button 
                      onClick={() => setActiveTab('search')}
                      className="inline-flex items-center gap-3 bg-orange-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-orange-500 transition shadow-xl shadow-orange-900/40"
                    >
                      EMPEZAR RECOPILACIÓN <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mx-auto max-w-7xl px-4 py-12"
              >
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Recopilador de Leads</h2>
                    <p className="text-white/40 text-sm italic mt-1 font-medium">Capture contactos directos de empresas para su campaña.</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-right">
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Total Guardados</p>
                      <p className="text-2xl font-mono text-orange-500 leading-none mt-1">{leads.length}</p>
                    </div>
                  </div>
                </div>
                <LeadSearch onSaveLead={handleSaveLead} savedLeadIds={leads.map(l => l.id)} />
              </motion.div>
            )}

            {activeTab === 'leads' && (
              <motion.div
                key="leads"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mx-auto max-w-7xl px-4 py-12"
              >
                <div className="flex items-center justify-between mb-10 font-sans">
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Mis Bases de Datos</h2>
                    <p className="text-white/40 text-sm mt-1">leads recolectados inteligentemente por Cocrear.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('campaign')}
                    className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-500 transition flex items-center gap-2 shadow-lg shadow-orange-900/20"
                  >
                    CONFIGURAR CAMPAÑA <Send size={18} />
                  </button>
                </div>

                {leads.length > 0 ? (
                  <div className="bg-[#141417] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 text-white/40 text-[10px] uppercase tracking-widest">
                          <th className="py-5 px-6 font-bold">Empresa</th>
                          <th className="py-5 px-6 font-bold text-center">Nicho</th>
                          <th className="py-5 px-6 font-bold">Contacto Principal</th>
                          <th className="py-5 px-6 font-bold text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {leads.map(lead => (
                          <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.02] transition group">
                            <td className="py-5 px-6">
                              <div className="font-bold text-white">{lead.name}</div>
                              <div className="text-[11px] text-white/40 flex items-center gap-1 mt-0.5">
                                <MapPin size={10} /> {lead.address}
                              </div>
                            </td>
                            <td className="py-5 px-6 text-center">
                              <span className="bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase text-orange-400">
                                {lead.category}
                              </span>
                            </td>
                            <td className="py-5 px-6">
                              <div className="flex flex-col gap-1.5">
                                <div className="text-white/60 font-mono text-xs flex items-center gap-2">
                                  <Phone size={14} className="text-white/20" />
                                  {lead.phone || 'No registrado'}
                                </div>
                                <div className="text-white/60 text-xs flex items-center gap-2">
                                  <Mail size={14} className="text-white/20" />
                                  {lead.email || 'Click para agregar'}
                                </div>
                                {lead.website && (
                                  <a href={lead.website} target="_blank" className="text-[11px] text-orange-400 font-medium flex items-center gap-1 hover:text-orange-300 transition">
                                    <Globe size={12} /> Sitio Web
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button 
                                  onClick={() => setEditingLead(lead)}
                                  className="p-2 text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg hover:bg-orange-500/20"
                                  title="Editar Lead"
                                >
                                  <FileText size={18} />
                                </button>
                                {lead.phone && (
                                  <button 
                                    onClick={() => startWhatsApp(lead.phone!, lead.name, lead.address, lead.category)}
                                    className="p-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20"
                                    title="WhatsApp Business"
                                  >
                                    <MessageCircle size={18} />
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDeleteLead(lead.id)}
                                  className="p-2 text-white/20 hover:text-red-500 bg-white/5 border border-white/10 rounded-lg hover:border-red-500/30"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-24 text-center bg-[#141417] rounded-3xl border border-dashed border-white/10 shadow-2xl">
                    <Users size={64} className="mx-auto text-white/5 mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-2">Sin leads recolectados</h3>
                    <p className="text-white/40 mb-10 max-w-sm mx-auto">Su base de datos está vacía. Use el motor de búsqueda para encontrar nuevas oportunidades.</p>
                    <button 
                      onClick={() => setActiveTab('search')}
                      className="bg-white/5 border border-white/10 text-white px-10 py-3 rounded-xl font-bold hover:bg-white/10 transition"
                    >
                      ABRIR BUSCADOR
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'campaign' && (
              <motion.div
                key="campaign"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mx-auto max-w-7xl px-4 py-12"
              >
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-3xl font-bold text-white tracking-tight mb-10">Configuración de Campaña PDF</h2>
                  
                  {leads.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#141417] border border-white/5 p-6 rounded-2xl shadow-xl">
                          <h3 className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-6">Estado de Envío</h3>
                          <div className="space-y-4">
                            <div className="p-4 bg-[#0A0A0B] rounded-xl border border-white/5">
                              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Emails Disponibles</p>
                              <p className="text-3xl font-mono text-white leading-none">{leads.filter(l => !!l.email).length}</p>
                            </div>
                            <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">WhatsApp Cola</p>
                              <p className="text-3xl font-mono text-white leading-none">{leads.filter(l => !!l.phone).length}</p>
                            </div>
                            <div className="p-4 bg-orange-600/10 rounded-xl border border-orange-600/20">
                              <p className="text-[10px] text-orange-400 uppercase font-bold tracking-widest mb-1">Protección Anti-Block</p>
                              <p className="text-xl font-bold text-orange-400 leading-none italic">Máxima Activada</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#141417] border border-white/5 p-6 rounded-2xl shadow-xl">
                          <div className="flex justify-between items-center mb-4">
                            <label className="text-[11px] text-white/40 font-bold uppercase tracking-widest">Intervalo</label>
                            <span className="text-xs font-mono text-orange-500">180s - 300s</span>
                          </div>
                          <div className="h-1.5 w-full bg-black rounded-full overflow-hidden mb-6">
                            <div className="h-full bg-orange-600 w-3/4 shadow-[0_0_10px_rgba(234,88,12,0.4)]"></div>
                          </div>
                          <p className="text-[10px] text-white/30 leading-relaxed italic">El sistema esperará un tiempo aleatorio entre estos parámetros para simular comportamiento humano.</p>
                        </div>
                      </div>

                      <div className="lg:col-span-8 bg-[#141417] border border-white/5 p-8 rounded-3xl shadow-2xl space-y-8">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-widest text-white/40 mb-3">Mensaje Personalizado (Cocrear AI)</label>
                          <textarea 
                            className="w-full h-48 p-5 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-orange-500/50 transition font-sans text-sm text-white/80 leading-relaxed"
                            value={template}
                            onChange={(e) => setTemplate(e.target.value)}
                          />
                        </div>

                        {leads.length > 0 && (
                          <div className="p-6 bg-orange-600/5 rounded-2xl border border-orange-500/10">
                            <h4 className="text-[10px] text-orange-500 uppercase font-black tracking-widest mb-4">Vista Previa Dinámica ({leads[0].name})</h4>
                            <div className="text-sm text-white/60 font-sans leading-relaxed whitespace-pre-wrap italic">
                              {getPersonalizedMessage(leads[0])}
                            </div>
                          </div>
                        )}

                        <div className="p-6 bg-white/[0.02] rounded-2xl border border-dashed border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-orange-600 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-900/40">
                              <FileText size={24} />
                            </div>
                            <div>
                              <p className="font-bold text-white">Propuesta_Ecom_2024.pdf</p>
                              <p className="text-[10px] text-orange-400 uppercase tracking-widest font-black mt-0.5">Auto-Generada</p>
                            </div>
                          </div>
                          <button 
                            onClick={previewProposal}
                            className="text-xs font-bold text-white/40 hover:text-white transition uppercase tracking-widest"
                          >
                            Vista Previa
                          </button>
                        </div>

                        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <button 
                            onClick={() => runCampaign('whatsapp')}
                            className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-orange-500 transition shadow-2xl shadow-orange-900/40 flex items-center justify-center gap-3"
                          >
                            ENVIAR WHATSAPP <MessageCircle size={24} />
                          </button>
                          <button 
                            onClick={() => runCampaign('email')}
                            className="w-full bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black text-lg hover:bg-white/10 transition shadow-2xl flex items-center justify-center gap-3"
                          >
                            ENVIAR POR EMAIL <Mail size={24} />
                          </button>
                          <p className="sm:col-span-2 mt-2 text-center text-white/20 text-xs italic font-medium leading-relaxed">
                            Se iniciará la secuencia de contacto personalizada. Por favor, mantenga la calma y el intervalo para asegurar su reputación comercial.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-24 text-center bg-[#141417] rounded-3xl border border-dashed border-white/10 shadow-2xl">
                      <Users size={64} className="mx-auto text-white/5 mb-6" />
                      <h3 className="text-2xl font-bold text-white mb-2">Lista de Envío Vacía</h3>
                      <p className="text-white/40 mb-10 max-w-sm mx-auto">Primero debe buscar y guardar empresas con número de contacto válido para iniciar una campaña.</p>
                      <button 
                        onClick={() => setActiveTab('search')}
                        className="bg-orange-600 text-white px-10 py-3 rounded-xl font-bold"
                      >
                        RECOPILAR DATOS
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mx-auto max-w-2xl px-4 py-12"
              >
                <div className="bg-[#141417] border border-white/5 rounded-3xl p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-orange-600/20 p-3 rounded-2xl">
                      <SettingsIcon className="text-orange-500" size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Configuración del Sistema</h2>
                      <p className="text-white/40 text-sm">Ajustes técnicos y llaves de acceso para las herramientas de Cocrear.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-8">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Google Maps Platform Key</label>
                        <div className="relative group">
                          <input 
                            type="password"
                            autoComplete="off"
                            className="w-full p-4 bg-black/40 border border-white/10 rounded-xl outline-none focus:border-orange-500 transition text-white font-mono placeholder:text-white/10"
                            placeholder="Alza-AIzaSy..."
                            value={customMapsApiKey}
                            onChange={(e) => setCustomMapsApiKey(e.target.value)}
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/10 group-hover:text-white/20 transition">
                            <Globe size={18} />
                          </div>
                        </div>
                        <p className="mt-3 text-[11px] text-white/30 leading-relaxed italic">
                          Esta clave es necesaria para que el Buscador de Leads pueda conectar con Google Maps. 
                          Se guarda localmente en su navegador para su privacidad.
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                      <button 
                        type="submit"
                        className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-500 transition shadow-lg shadow-orange-900/20"
                      >
                        GUARDAR CONFIGURACIÓN
                      </button>
                      <a 
                        href="https://console.cloud.google.com/google/maps-apis/credentials" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-white/20 hover:text-orange-400 text-center uppercase tracking-widest font-black transition"
                      >
                        Obtener mi API Key en Google Cloud Console
                      </a>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </APIProvider>
  );
}

function NavButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-bold tracking-tight transition-all duration-300 ${
        active ? 'text-white' : 'text-white/40 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-[#141417] border border-white/5 rounded-[2rem] shadow-2xl hover:border-orange-500/20 transition-all duration-500 group">
      <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors duration-500">
        <div className="group-hover:text-white transition-colors">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-white/40 leading-relaxed text-sm font-medium">{description}</p>
    </div>
  );
}

