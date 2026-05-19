import React, { useState, useEffect } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Search, MapPin, Globe, Phone, Plus, Loader2, Mail } from 'lucide-react';
import { Lead } from '../types';

interface LeadSearchProps {
  onSaveLead: (lead: Lead) => void;
  savedLeadIds: string[];
}

export function LeadSearch({ onSaveLead, savedLeadIds }: LeadSearchProps) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<google.maps.places.Place[]>([]);
  
  const placesLib = useMapsLibrary('places');
  const map = useMap();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setCategoryName(query); // Default category name to search query

    // Dynamic mock results based on query
    const mockData: any[] = [
      {
        id: 'mock-1',
        displayName: `${query} San José`,
        formattedAddress: `Calle Falsa 123, ${location || 'Córdoba'}, AR`,
        nationalPhoneNumber: '+54 9 351 123 4567',
        websiteURI: 'https://ejemplo.com',
        email: 'contacto@sanjose.com.ar',
      },
      {
        id: 'mock-2',
        displayName: `Taller de ${query} El Algarrobo`,
        formattedAddress: `Av. Siempre Viva 742, ${location || 'Córdoba'}, AR`,
        nationalPhoneNumber: '+54 9 351 987 6543',
        email: 'taller@algarrobo.com',
      },
      {
        id: 'mock-3',
        displayName: `${query} Herrero S.A.`,
        formattedAddress: `Sector Industrial, ${location || 'Buenos Aires'}, AR`,
        nationalPhoneNumber: '+54 9 11 4444 5555',
        websiteURI: 'https://herrero-sa.com.ar',
        email: 'ventas@herrero-sa.com.ar',
      }
    ];

    // Simulate network delay
    setTimeout(() => {
      setResults(mockData);
      setIsSearching(false);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
          <input 
            type="text" 
            placeholder="Ej: Metalúrgicas, Carpinterías..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-[#141417] border border-white/10 rounded-2xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 text-white outline-none transition shadow-2xl"
          />
        </div>
        <div className="md:w-64 relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
          <input 
            type="text" 
            placeholder="Ciudad (Opcional)" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-[#141417] border border-white/10 rounded-2xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 text-white outline-none transition shadow-2xl"
          />
        </div>
        <button 
          type="submit"
          disabled={isSearching || !query}
          className="bg-orange-600 hover:bg-orange-500 text-white px-10 py-4 rounded-2xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20"
        >
          {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          INICIAR BÚSQUEDA
        </button>
      </form>

      {/* Category Name Override */}
      {results.length > 0 && (
        <div className="bg-orange-600/10 border border-orange-500/20 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h4 className="text-white font-bold mb-1">Nombre del Rubro</h4>
            <p className="text-white/40 text-xs">Este nombre reemplazará <span className="text-orange-500 font-mono">{'{categoria}'}</span> en sus mensajes personalizados.</p>
          </div>
          <div className="w-full md:w-80">
            <input 
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-orange-500 outline-none transition font-bold"
              placeholder="Ej: Metalúrgico"
            />
          </div>
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((place: any) => {
          const isSaved = savedLeadIds.includes(place.id!);
          
          return (
            <div key={place.id} className="bg-[#141417] border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col justify-between hover:border-orange-500/30 transition-all">
              <div>
                <h3 className="font-bold text-lg mb-2 line-clamp-1 text-white">{place.displayName}</h3>
                <p className="text-white/40 text-sm flex items-start gap-2 mb-4 h-10 line-clamp-2">
                  <MapPin size={14} className="mt-1 flex-shrink-0" />
                  {place.formattedAddress}
                </p>
                
                <div className="space-y-2 mb-6">
                  {place.websiteURI && (
                    <a href={place.websiteURI} target="_blank" className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition hover:underline">
                      <Globe size={14} />
                      Sitio Web
                    </a>
                  )}
                  {place.nationalPhoneNumber && (
                    <div className="flex items-center gap-2 text-sm text-white/60 font-mono">
                      <Phone size={14} />
                      {place.nationalPhoneNumber}
                    </div>
                  )}
                  {place.email && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Mail size={14} />
                      {place.email}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  if (!isSaved) {
                    onSaveLead({
                      id: place.id!,
                      name: place.displayName!,
                      address: place.formattedAddress!,
                      phone: place.nationalPhoneNumber || undefined,
                      email: place.email || undefined,
                      website: place.websiteURI || undefined,
                      category: categoryName || query,
                      status: 'saved',
                      createdAt: 0
                    });
                  }
                }}
                disabled={isSaved}
                className={`w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                  isSaved 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default' 
                  : 'bg-white/5 text-white/80 hover:bg-orange-600 hover:text-white border border-white/10'
                }`}
              >
                {isSaved ? 'Guardado' : <><Plus size={18} /> Guardar Lead</>}
              </button>
            </div>
          );
        })}
      </div>

      {results.length === 0 && !isSearching && (
        <div className="py-20 text-center bg-[#141417]/50 rounded-3xl border border-dashed border-white/10">
          <div className="inline-flex p-6 bg-white/5 rounded-full text-white/10 mb-6">
            <Search size={48} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No se encontraron resultados</h3>
          <p className="text-white/40">Intente buscar una categoría de negocio diferente.</p>
        </div>
      )}
    </div>
  );
}
