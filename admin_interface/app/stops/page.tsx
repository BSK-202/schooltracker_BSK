// app/admin/stops/page.tsx
"use client"

import { useState, useEffect } from 'react';
import { Plus, Map, Download, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useStops } from '@/hooks/useStops';
import StopsTable from '@/components/stops/StopsTable';
import StopFormModal from '@/components/stops/StopFormModal';
import { toast } from 'sonner';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { 
  ssr: false,
  loading: () => <div className="h-[600px] bg-gray-100 animate-pulse rounded-xl" />
});

export default function StopsPage() {
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [showForm, setShowForm] = useState(false);
  const [stopToEdit, setStopToEdit] = useState<any>(null);
  
  const {
    stops,
    loading,
    error,
    fetchStops,
    getStopCoordinates,
    getStopsForMap,
    getTotalStops,
  } = useStops();

  // Charger tous les arrêts au montage
  useEffect(() => {
    fetchStops().catch(() => {
      // Error handled by hook
    });
  }, []);

  // Gérer les erreurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleEdit = (stop: any) => {
    const coordinates = getStopCoordinates(stop);
    setStopToEdit({
      id: stop.id,
      address: stop.address,
      lat: coordinates.lat,
      lng: coordinates.lng
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setStopToEdit(null);
  };

  const handleExport = () => {
    const headers = ['ID', 'Adresse', 'Latitude', 'Longitude'];
    const csvContent = [
      headers.join(','),
      ...stops.map(stop => {
        const coords = getStopCoordinates(stop);
        return [
          stop.id,
          `"${stop.address}"`,
          coords.lat,
          coords.lng
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arrêts-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Export terminé');
  };

  // Préparer les données pour la carte
  const mapMarkers = getStopsForMap();

  const mapCenter = mapMarkers.length > 0 
    ? mapMarkers[0].position
    : [33.5731, -7.5898] as [number, number];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Arrêts de Bus</h1>
              <p className="text-gray-600 mt-2">
                Gérez tous les arrêts de bus avec leur localisation
              </p>
              {!loading && (
                <p className="text-sm text-gray-500 mt-2">
                  📍 <span className="font-semibold text-gray-900">{getTotalStops()}</span> arrêt(s) enregistré(s)
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="px-4 py-2.5 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
                disabled={loading || stops.length === 0}
              >
                <Download className="w-4 h-4" />
                Exporter CSV
              </button>
              
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/30"
                disabled={loading}
              >
                <Plus className="w-4 h-4" />
                Ajouter un arrêt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Barre de contrôle */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
                viewMode === 'map' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Map className="w-4 h-4" />
              Vue carte
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                viewMode === 'table' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Vue tableau
            </button>
          </div>
        </div>

        {/* Contenu selon le mode */}
        {loading && stops.length === 0 ? (
          <div className="bg-white rounded-xl border p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Chargement des arrêts...</p>
            </div>
          </div>
        ) : stops.length === 0 ? (
          /* État vide */
          <div className="bg-white rounded-xl border p-12">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun arrêt configuré
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Commencez par ajouter des arrêts de bus. 
                Chaque arrêt est défini par son adresse et sa position GPS.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto shadow-lg shadow-blue-600/30"
              >
                <Plus className="w-5 h-5" />
                Ajouter votre premier arrêt
              </button>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          <StopsTable
            stops={stops}
            onEdit={handleEdit}
            loading={loading}
          />
        ) : (
          /* Vue carte */
          <div className="bg-white rounded-xl border overflow-hidden shadow-lg">
            <div className="h-[600px]">
              <MapComponent
                center={mapCenter}
                markers={mapMarkers}
                height="600px"
              />
            </div>
            
            {/* Grille des arrêts sous la carte */}
            <div className="p-6 border-t bg-gradient-to-b from-gray-50 to-white">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Liste des arrêts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stops.map((stop) => {
                  const coordinates = getStopCoordinates(stop);
                  return (
                    <div 
                      key={stop.id} 
                      className="p-4 bg-white border rounded-lg hover:shadow-md cursor-pointer transition-all hover:border-blue-300"
                      onClick={() => handleEdit(stop)}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                            {stop.address}
                          </h4>
                          <div className="text-xs text-gray-500 font-mono">
                            {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-xs text-gray-400">ID: {stop.id}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(stop);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Modifier →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de formulaire */}
      <StopFormModal
        isOpen={showForm}
        onClose={handleCloseForm}
        stopToEdit={stopToEdit} routeId={0} existingStopsCount={0}      />
    </div>
  );
}