import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  User, 
  Camera, 
  Upload, 
  MapPin,
  QrCode,
  Loader2
} from 'lucide-react';
import { useStops } from '@/hooks/useStops';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: {
    id?: number;
    fullName?: string;
    photoUrl?: string;
    qrCode?: string;
    stopId?: number | null;
  };
  loading?: boolean;
}

export default function StudentFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  loading = false,
}: StudentFormModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    photoUrl: '',
    stopId: null as number | null,
    photo_file: null as File | null,
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Utiliser le hook useStops pour récupérer les arrêts
  const { stops, loading: loadingStops, fetchStops } = useStops();

  useEffect(() => {
    if (isOpen) {
      fetchStops();
    }
  }, [isOpen, fetchStops]);

  useEffect(() => {
    if (initialData) {
      setIsEditMode(true);
      setFormData({
        fullName: initialData.fullName || '',
        photoUrl: initialData.photoUrl || '',
        stopId: initialData.stopId || null,
        photo_file: null,
      });
      setPhotoPreview(initialData.photoUrl || '');
    } else {
      setIsEditMode(false);
      setFormData({
        fullName: '',
        photoUrl: '',
        stopId: null,
        photo_file: null,
      });
      setPhotoPreview('');
    }
  }, [initialData]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.match('image.*')) {
        alert('Veuillez sélectionner une image (JPG, PNG, etc.)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La taille de l\'image ne doit pas dépasser 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        photo_file: file,
        photoUrl: '',
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photo_file: null,
      photoUrl: '',
    }));
    setPhotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      stopId: formData.stopId || undefined,
    };

    await onSubmit(submitData);
  };

  // Préparer les arrêts pour la liste déroulante
  const formattedStops = stops.map(stop => ({
    id: stop.id,
    address: stop.address
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">
              {isEditMode ? 'Modifier l\'élève' : 'Ajouter un élève'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
            type="button"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Informations de l'élève</h3>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-gray-300">
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    title="Supprimer la photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="w-full">
                <label className="text-sm font-semibold mb-2 block">
                  Photo de profil
                </label>
                
                <div className="mb-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                    id="photo-upload"
                    disabled={loading}
                  />
                  <label
                    htmlFor="photo-upload"
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Choisir une photo
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Formats acceptés: JPG, PNG, GIF (max 5MB)
                  </p>
                </div>

                
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Nom complet *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Ex: Youssef Benali"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {isEditMode && initialData?.qrCode && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold">QR Code</label>
                  <div className="flex items-center gap-2 px-4 py-2.5 border rounded-lg bg-gray-50">
                    <QrCode className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-mono">{initialData.qrCode}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Arrêt de bus</h3>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Arrêt *</label>
              <div className="relative">
                {loadingStops && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                )}
                <select
                  value={formData.stopId || ''}
                  onChange={(e) => setFormData({...formData, stopId: e.target.value ? parseInt(e.target.value) : null})}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black appearance-none"
                  required
                  disabled={loading || loadingStops}
                >
                  <option value="">Sélectionner un arrêt</option>
                  {formattedStops.length === 0 && !loadingStops ? (
                    <option value="" disabled>
                      Aucun arrêt disponible. Veuillez d'abord créer un arrêt.
                    </option>
                  ) : (
                    formattedStops.map(stop => (
                      <option key={stop.id} value={stop.id}>
                        {stop.address}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Sélectionnez l'arrêt de bus assigné à cet élève
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border rounded-lg font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || loadingStops || formattedStops.length === 0}
              className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (isEditMode ? 'Modification...' : 'Création...') 
                : (isEditMode ? 'Modifier' : 'Créer l\'élève')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
