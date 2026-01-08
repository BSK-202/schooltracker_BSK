// components/Stops/StopFormModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, MapPin, Clock, Navigation } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useStops } from '@/hooks/useStops';
import { toast } from 'sonner';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-100 animate-pulse rounded-xl" />
});

interface StopFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeId: number;
  existingStopsCount: number;
  stopToEdit?: {
    id: number;
    address: string;
    lat: number;
    lng: number;
    scheduled_time: string;
    stop_order: number;
  } | null;
}

export default function StopFormModal({
  isOpen,
  onClose,
  existingStopsCount,
  stopToEdit
}: StopFormModalProps) {
  const { createStop, updateStop, geocodeAddress, reverseGeocode } = useStops();
  
  const [formData, setFormData] = useState({
    address: '',
    lat: 33.5731,
    lng: -7.5898,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const addressInputRef = useRef<HTMLTextAreaElement>(null);

  // Initialiser le formulaire
  useEffect(() => {
    if (stopToEdit) {
      setFormData({
        address: stopToEdit.address,
        lat: stopToEdit.lat,
        lng: stopToEdit.lng,
      });
    } else {
      setFormData({
        address: '',
        lat: 33.5731,
        lng: -7.5898,
      });
    }
  }, [stopToEdit, existingStopsCount, isOpen]);

  const handleMapClick = async (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, lat, lng }));
    
    // Reverse geocoding pour obtenir l'adresse
    setIsGeocoding(true);
    const result = await reverseGeocode(lat, lng);
    setIsGeocoding(false);
    
    if (result.success && result.data) {
      setFormData(prev => ({ ...prev, address: result.data }));
    } else {
      setFormData(prev => ({ ...prev, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
    }
  };

  const handleGeocodeAddress = async () => {
    if (!formData.address.trim()) {
      toast.error('Veuillez entrer une adresse');
      return;
    }

    setIsGeocoding(true);
    const result = await geocodeAddress(formData.address);
    setIsGeocoding(false);

    if (result.success && result.data) {
      setFormData(prev => ({
        ...prev,
        lat: result.data.lat,
        lng: result.data.lng
      }));
      toast.success('Position trouvée sur la carte');
    } else {
      toast.error(result.error || 'Adresse introuvable');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.address.trim()) {
      toast.error('L\'adresse est obligatoire');
      return;
    }


    setIsSubmitting(true);

    try {
      const stopData = {
        address: formData.address.trim(),
        coordinates: [formData.lng, formData.lat] as [number, number],
      };

      let result;
      if (stopToEdit) {
        result = await updateStop(stopToEdit.id, stopData);
      } else {
        result = await createStop(stopData);
      }

      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.error || 'Une erreur est survenue');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {stopToEdit ? 'Modifier l\'arrêt' : 'Ajouter un arrêt'}
                </h2>
                <p className="text-sm text-gray-500">
                  {stopToEdit 
                    ? 'Modifiez les informations de l\'arrêt' 
                    : 'Définissez la position et l\'horaire de l\'arrêt'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Formulaire */}
              <div className="space-y-6">
                {/* Adresse */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <textarea
                      ref={addressInputRef}
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Arrêt scolaire"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      disabled={isGeocoding}
                    />
                    <button
                      type="button"
                      onClick={handleGeocodeAddress}
                      disabled={isGeocoding || !formData.address.trim()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                      {isGeocoding ? 'Recherche...' : 'Localiser sur la carte'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Cliquez sur la carte pour définir la position
                  </p>
                </div>

               

                {/* Coordonnées */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.lat}
                      onChange={(e) => setFormData(prev => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.lng}
                      onChange={(e) => setFormData(prev => ({ ...prev, lng: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Carte */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Position sur la carte
                </label>
                <div className="h-[400px] border border-gray-300 rounded-xl overflow-hidden">
                  <MapComponent
                    center={[formData.lat, formData.lng]}
                    zoom={15}
                    markers={[{
                      id: 1,
                      position: [formData.lat, formData.lng],
                      address: formData.address || 'Nouvelle position',
                    }]}
                    height="400px"
                    onMapClick={handleMapClick}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Cliquez sur la carte pour définir la position
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isGeocoding}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting 
                  ? 'Enregistrement...' 
                  : stopToEdit 
                    ? 'Mettre à jour' 
                    : 'Créer l\'arrêt'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}