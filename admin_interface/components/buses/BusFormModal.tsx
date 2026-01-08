import { useState } from 'react';
import { X, Bus, Upload, XCircle } from 'lucide-react';

interface BusFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  schools: Array<{ id: number; name: string; }>;
  drivers: Array<{
    id: number;
    full_name: string;
    phone?: string;
    is_available?: boolean;
  }>;
}

export default function BusFormModal({ isOpen, onClose, onSubmit, schools, drivers }: BusFormModalProps) {
  const [formData, setFormData] = useState({
    licence_plate: '',
    model: '',
    capacity: '',
    school_id: '',
    driver_id: '', // Champ pour le chauffeur
    is_active: true
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      licence_plate: formData.licence_plate,
      model: formData.model,
      capacity: parseInt(formData.capacity),
      school_id: formData.school_id ? parseInt(formData.school_id) : undefined,
      driver_id: formData.driver_id ? parseInt(formData.driver_id) : undefined, // Inclure le chauffeur
      is_active: formData.is_active,
      photo: photoFile || undefined,
    };

    try {
      await onSubmit(data);
      // Réinitialiser le formulaire
      setFormData({
        licence_plate: '',
        model: '',
        capacity: '',
        school_id: '',
        driver_id: '',
        is_active: true
      });
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (error) {
      console.error('Error creating bus:', error);
      alert('Erreur lors de la création du bus');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La photo ne doit pas dépasser 5MB');
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bus className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold">Ajouter un bus</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Photo */}
          <div className="space-y-3">
            <label className="text-sm font-semibold block">
              Photo du bus (optionnel)
            </label>
            {photoPreview ? (
              <div className="relative">
                <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Ajouter une photo</span>
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG (Max. 5MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </label>
            )}
          </div>

          {/* Plaque d'immatriculation */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              Plaque d'immatriculation *
            </label>
            <input
              type="text"
              value={formData.licence_plate}
              onChange={(e) => setFormData({ ...formData, licence_plate: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Ex: 12345-A-10"
              required
            />
          </div>

          {/* Modèle et capacité */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Modèle *</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Ex: Mercedes Sprinter"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Capacité *</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Ex: 22"
                min="1"
                required
              />
            </div>
          </div>

          {/* École */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Affecter à une école (optionnel)</label>
            <select
              value={formData.school_id}
              onChange={(e) => setFormData({ ...formData, school_id: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Sélectionner une école...</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chauffeur - LISTE DÉROULANTE SIMPLE */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              Chauffeur assigné (optionnel)
            </label>
            <select
              value={formData.driver_id}
              onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Sélectionner un chauffeur...</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.full_name}
                  {driver.phone && ` (${driver.phone})`}
                </option>
              ))}
            </select>
          </div>

          {/* Statut */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Statut</label>
            <select
              value={formData.is_active ? 'active' : 'inactive'}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
              className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="active">En service</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Création...' : 'Créer le bus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}