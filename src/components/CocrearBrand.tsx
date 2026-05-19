import { motion } from "motion/react";
import { Link2 } from "lucide-react";

export function CocrearLogo() {
  return (
    <div className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight">
      <div className="flex bg-orange-600 w-8 h-8 rounded flex items-center justify-center font-bold text-black shadow-lg shadow-orange-600/20">
        C
      </div>
      <span className="text-white">COCREAR<span className="text-orange-500">.AR</span></span>
    </div>
  );
}

export function CocrearHero() {
  return (
    <div className="relative overflow-hidden bg-[#0A0A0B] py-24 sm:py-32 border-b border-white/5">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-orange-600/10 rounded-full blur-[120px] opacity-50" />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl lg:text-center"
        >
          <h2 className="text-xs uppercase tracking-[0.2em] text-orange-500 font-bold mb-4">Lead Generator Pro</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Expande tu red de negocios con inteligencia
          </p>
          <p className="mt-6 text-lg leading-8 text-white/60">
            Encuentre clientes potenciales en Google Maps y Redes Sociales de forma automática. 
            Capture contactos, genere propuestas en PDF y gestione sus campañas de WhatsApp Business.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
