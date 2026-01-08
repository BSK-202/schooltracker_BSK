
import { useState, useEffect, useRef } from 'react';
import { X, User, Phone, Camera, User as UserMale, User as UserFemale, Upload } from 'lucide-react';

interface ParentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: {
    id?: number;
    full_name?: string;
    phone?: string;
    sexe?: boolean;
    photo?: string;
  };
  loading?: boolean;
}

export default function ParentFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  loading = false 
}: ParentFormModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    sexe: true,
    photo: '',
    photo_file: null as File | null,
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setIsEditMode(true);
      setFormData({
        full_name: initialData.full_name || '',
        phone: initialData.phone || '',
        sexe: initialData.sexe !== undefined ? initialData.sexe : true,
        photo: initialData.photo || '',
        photo_file: null,
      });
      setPhotoPreview(initialData.photo || '');
    } else {
      setIsEditMode(false);
      setFormData({
        full_name: '',
        phone: '',
        sexe: true,
        photo: '',
        photo_file: null,
      });
      setPhotoPreview('');
    }
  }, [initialData]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.match('image.*')) {
        alert('Veuillez sélectionner une image (JPG, PNG, etc.)');
        return;
      }

      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La taille de l\'image ne doit pas dépasser 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        photo_file: file,
        photo: '', // Effacer l'URL si un fichier est sélectionné
      }));

      // Créer un preview
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
      photo: '',
    }));
    setPhotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Préparer les données pour l'envoi
    const submitData = {
      ...formData
    };

    await onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">
              {isEditMode ? 'Modifier le parent' : 'Ajouter un parent'}
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
          {/* Informations du parent */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Informations du parent</h3>
            
            {/* Photo de profil */}
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
                
                {/* Upload de fichier */}
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
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Ex: Fatima Zahra"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Téléphone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="+212 6 XX XX XX XX"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Sexe *</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, sexe: true})}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg font-bold transition-colors ${
                      formData.sexe 
                        ? 'bg-blue-50 border-blue-500 text-blue-700' 
                        : 'hover:bg-gray-50'
                    }`}
                    disabled={loading}
                  >
                    <UserMale className="w-4 h-4" />
                    Homme
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, sexe: false})}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg font-bold transition-colors ${
                      !formData.sexe 
                        ? 'bg-pink-50 border-pink-500 text-pink-700' 
                        : 'hover:bg-gray-50'
                    }`}
                    disabled={loading}
                  >
                    <UserFemale className="w-4 h-4" />
                    Femme
                  </button>
                </div>
              </div>
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
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (isEditMode ? 'Modification...' : 'Création...') 
                : (isEditMode ? 'Modifier' : 'Créer le parent')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
