
import { useState, useEffect } from 'react';
import { X, User, Phone, School as SchoolIcon } from 'lucide-react'; // Renommez ici
import driverService, { School } from '@/services/api/drivers'; // Gardez l'interface

interface DriverFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: {
    id?: number;
    full_name?: string;
    phone?: string;
    school_id?: number;
  };
  loading?: boolean;
}

export default function DriverFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  loading = false 
}: DriverFormModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    school_id: '' as string | number,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSchools();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setIsEditMode(true);
      setFormData({
        full_name: initialData.full_name || '',
        phone: initialData.phone || '',
        school_id: initialData.school_id || '',
      });
    } else {
      setIsEditMode(false);
      setFormData({
        full_name: '',
        phone: '',
        school_id: '',
      });
    }
  }, [initialData]);

  const fetchSchools = async () => {
    try {
      setLoadingSchools(true);
      const response = await driverService.getSchools();
      setSchools(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des écoles:', error);
    } finally {
      setLoadingSchools(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Préparer les données avec school_id comme number si sélectionné
    const submitData = {
      ...formData,
      school_id: formData.school_id ? Number(formData.school_id) : undefined,
    };
    
    await onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">
              {isEditMode ? 'Modifier le chauffeur' : 'Ajouter un chauffeur'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              Nom complet *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Ex: Ahmed Benali"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">
              Téléphone *
            </label>
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
            <label className="text-sm font-semibold">
              École assignée
            </label>
            <div className="relative">
              {/* Utilisez SchoolIcon ici */}
              <SchoolIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={formData.school_id}
                onChange={(e) => setFormData({...formData, school_id: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black appearance-none bg-white"
                disabled={loading || loadingSchools}
              >
                <option value="">Sélectionner une école...</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                    {school.address ? ` - ${school.address}` : ''}
                  </option>
                ))}
              </select>
              {loadingSchools && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Optionnel. Sélectionnez l'école à laquelle ce chauffeur sera assigné.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
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
              disabled={loading || loadingSchools}
              className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (isEditMode ? 'Modification...' : 'Création...') 
                : (isEditMode ? 'Modifier' : 'Créer le chauffeur')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}