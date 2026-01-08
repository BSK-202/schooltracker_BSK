import { useState } from 'react';
import { X, Bus, School, User, Calendar, MapPin, Phone, Gauge, Wrench, Image as ImageIcon, Edit } from 'lucide-react';

interface BusDetails {
  id: number;
  licence_plate: string;
  model: string;
  capacity: number;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  year?: number;
  color?: string;
  insurance_expiry?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  fuel_level?: number;
  school?: {
    id: number;
    name: string;
    address: string;
    phone?: string;
    email?: string;
  };
  driver?: {
    id: number;
    full_name: string;
    phone: string;
    email?: string;
    license_number?: string;
    license_expiry?: string;
  };
}

interface BusDetailsProps {
  bus: BusDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (id: number) => void;
}

export default function BusDetails({ bus, isOpen, onClose, onEdit }: BusDetailsProps) {
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !bus) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non défini';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b z-10">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Détails du Bus</h2>
                  <p className="text-gray-500 text-sm">{bus.licence_plate}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(bus.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Colonne 1: Photo et informations principales */}
              <div className="lg:col-span-2 space-y-6">
                {/* Photo */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Photo du bus</h3>
                    {!bus.photo_url && (
                      <span className="text-sm text-gray-500">Aucune photo</span>
                    )}
                  </div>
                  {bus.photo_url && !imageError ? (
                    <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={bus.photo_url} 
                        alt={bus.licence_plate}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-64 rounded-lg bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Informations générales */}
                <div className="bg-white border rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-4">Informations générales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Plaque d'immatriculation</div>
                      <div className="font-medium">{bus.licence_plate}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Modèle</div>
                      <div className="font-medium">{bus.model}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Capacité</div>
                      <div className="font-medium">{bus.capacity} places</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Statut</div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        bus.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {bus.is_active ? 'Actif' : 'Inactif'}
                      </div>
                    </div>
                    {bus.year && (
                      <div>
                        <div className="text-sm text-gray-500">Année</div>
                        <div className="font-medium">{bus.year}</div>
                      </div>
                    )}
                    {bus.color && (
                      <div>
                        <div className="text-sm text-gray-500">Couleur</div>
                        <div className="font-medium">{bus.color}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* École */}
                {bus.school && (
                  <div className="bg-white border rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <School className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-lg">École affectée</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-500">Nom de l'école</div>
                        <div className="font-medium">{bus.school.name}</div>
                      </div>
                      {bus.school.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <div className="text-sm text-gray-500">Adresse</div>
                            <div className="font-medium">{bus.school.address}</div>
                          </div>
                        </div>
                      )}
                      {bus.school.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-500">Téléphone</div>
                            <div className="font-medium">{bus.school.phone}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Colonne 2: Informations supplémentaires */}
              <div className="space-y-6">
                {/* Chauffeur */}
                {bus.driver && (
                  <div className="bg-white border rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-lg">Chauffeur assigné</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-500">Nom complet</div>
                        <div className="font-medium">{bus.driver.full_name}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-500">Téléphone</div>
                          <div className="font-medium">{bus.driver.phone}</div>
                        </div>
                      </div>
                      {bus.driver.email && (
                        <div>
                          <div className="text-sm text-gray-500">Email</div>
                          <div className="font-medium">{bus.driver.email}</div>
                        </div>
                      )}
                      {bus.driver.license_number && (
                        <div>
                          <div className="text-sm text-gray-500">Permis n°</div>
                          <div className="font-medium">{bus.driver.license_number}</div>
                        </div>
                      )}
                      {bus.driver.license_expiry && (
                        <div>
                          <div className="text-sm text-gray-500">Expiration permis</div>
                          <div className="font-medium">{formatDate(bus.driver.license_expiry)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Maintenance et assurance */}
                <div className="bg-white border rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-4">Entretien et Assurance</h3>
                  <div className="space-y-4">
                    {bus.next_maintenance && (
                      <div className="flex items-start gap-3">
                        <Wrench className="w-5 h-5 text-orange-500 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-500">Prochaine maintenance</div>
                          <div className="font-medium">{formatDate(bus.next_maintenance)}</div>
                        </div>
                      </div>
                    )}
                    {bus.last_maintenance && (
                      <div>
                        <div className="text-sm text-gray-500">Dernière maintenance</div>
                        <div className="font-medium">{formatDate(bus.last_maintenance)}</div>
                      </div>
                    )}
                    {bus.insurance_expiry && (
                      <div>
                        <div className="text-sm text-gray-500">Expiration assurance</div>
                        <div className="font-medium text-red-600">
                          {formatDate(bus.insurance_expiry)}
                        </div>
                      </div>
                    )}
                    {bus.fuel_level !== undefined && (
                      <div className="flex items-start gap-3">
                        <Gauge className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm text-gray-500 mb-1">Niveau carburant</div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                bus.fuel_level > 50 ? 'bg-green-500' : 
                                bus.fuel_level > 20 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${bus.fuel_level}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{bus.fuel_level}%</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="bg-white border rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-lg">Dates</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500">Date d'ajout</div>
                      <div className="font-medium">{formatDate(bus.created_at)}</div>
                    </div>
                    {bus.updated_at && (
                      <div>
                        <div className="text-sm text-gray-500">Dernière modification</div>
                        <div className="font-medium">{formatDate(bus.updated_at)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}