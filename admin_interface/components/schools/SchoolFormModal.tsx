// components/schools/SchoolFormModal.tsx
import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import dynamic from 'next/dynamic';

// Import dynamique de la carte pour éviter les problèmes SSR
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
});

interface SchoolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
}

export default function SchoolFormModal({ isOpen, onClose, onSubmit, initialData }: SchoolFormModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    address: initialData?.address || '',
    coordinates: initialData?.geom?.coordinates?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(
    initialData?.geom?.coordinates ? 
    [initialData.geom.coordinates[1], initialData.geom.coordinates[0]] : 
    null
  );

  // Initialiser la localisation avec l'adresse si fournie
  useEffect(() => {
    if (initialData?.geom?.coordinates && !selectedLocation) {
      setSelectedLocation([initialData.geom.coordinates[1], initialData.geom.coordinates[0]]);
    }
  }, [initialData, selectedLocation]);

  // Fonction pour géocoder l'adresse
  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setSelectedLocation([parseFloat(lat), parseFloat(lon)]);
        setFormData({
          ...formData,
          address: display_name,
          coordinates: `${lon}, ${lat}`
        });
      } else {
        alert('Adresse non trouvée. Veuillez essayer une recherche plus précise.');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche d\'adresse:', error);
      alert('Erreur lors de la recherche d\'adresse');
    } finally {
      setLoading(false);
    }
  };

  // Gérer le clic sur la carte
  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation([lat, lng]);
    setFormData({
      ...formData,
      coordinates: `${lng}, ${lat}`
    });
    
    // Récupérer l'adresse inverse
    handleReverseGeocode(lat, lng);
  };

  // Géocodage inverse pour obtenir l'adresse à partir des coordonnées
  const handleReverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();

      if (data.display_name) {
        setFormData(prev => ({
          ...prev,
          address: data.display_name
        }));
      }
    } catch (error) {
      console.error('Erreur lors du géocodage inverse:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!selectedLocation) {
        alert('Veuillez sélectionner un emplacement sur la carte');
        setLoading(false);
        return;
      }

      const [lat, lng] = selectedLocation;
      
      await onSubmit({
        name: formData.name,
        address: formData.address,
        geom: {
          type: 'Point',
          coordinates: [lng, lat] // Format: [longitude, latitude]
        }
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">
            {initialData ? 'Modifier l\'école' : 'Ajouter une école'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section informations */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nom de l'école *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border rounded-lg"
                placeholder="École Internationale Anfa"
                required
                minLength={3}
                maxLength={100}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Rechercher une adresse
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 p-2 border rounded-lg"
                  placeholder="Saisissez une adresse..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchAddress())}
                />
                <button
                  type="button"
                  onClick={handleSearchAddress}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
                  disabled={loading}
                >
                  <Search className="w-4 h-4" />
                  {loading ? 'Recherche...' : 'Chercher'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Adresse *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full p-2 border rounded-lg"
                placeholder="L'adresse sera automatiquement remplie"
                required
                minLength={10}
                maxLength={255}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Coordonnées GPS (longitude, latitude) *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.coordinates}
                  onChange={(e) => setFormData({...formData, coordinates: e.target.value})}
                  className="flex-1 p-2 border rounded-lg"
                  placeholder="Cliquez sur la carte pour sélectionner"
                  required
                  readOnly
                />
                {selectedLocation && (
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    Sélectionné ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Cliquez sur la carte pour sélectionner l'emplacement exact. Format: longitude, latitude
              </p>
            </div>
          </div>

          {/* Section carte */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Sélectionnez l'emplacement sur la carte *
            </label>
            <div className="border rounded-lg overflow-hidden">
              <MapComponent
                center={selectedLocation || [33.5731, -7.5898]}
                zoom={selectedLocation ? 15 : 12}
                height="300px"
                onMapClick={handleMapClick}
                markers={selectedLocation ? [{
                  id: 1,
                  position: selectedLocation,
                  address: formData.address || 'Emplacement sélectionné'
                }] : []}
              />
            </div>
            <p className="text-xs text-gray-500">
              Cliquez sur la carte pour positionner l'école. Utilisez la recherche d'adresse pour trouver rapidement un lieu.
            </p>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 font-semibold"
              disabled={loading || !selectedLocation}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {initialData ? 'Modification...' : 'Création...'}
                </span>
              ) : (
                initialData ? 'Modifier' : 'Créer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}