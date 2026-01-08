import { useState } from 'react';
import { X, User, Phone, Mail, Bus, Calendar, Star, MapPin, Award, Shield, Clock } from 'lucide-react';

interface DriverDetails {
  id: number;
  full_name: string;
  phone: string;
  username: string;
  email?: string;
  created_at: string;
  updated_at?: string;
  assignedBus?: {
    id: number;
    licence_plate: string;
    model: string;
    capacity: number;
    photo_url?: string;
    school?: {
      id: number;
      name: string;
      address: string;
    };
  };
  stats?: {
    totalTripsCompleted: number;
    totalStudentsTransported: number;
    averageRating: number;
    totalHours: number;
    safetyScore: number;
    onTimeRate: number;
  };
  license_info?: {
    number: string;
    expiry_date: string;
    category: string;
  };
}

interface DriverDetailsProps {
  driver: DriverDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (id: number) => void;
}

export default function DriverDetails({ driver, isOpen, onClose, onEdit }: DriverDetailsProps) {
  if (!isOpen || !driver) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? `${mins}m` : ''}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="sticky top-0 bg-white border-b z-10">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Détails du Chauffeur</h2>
                  <p className="text-gray-500 text-sm">@{driver.username}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(driver.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
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

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-4">Informations personnelles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Nom complet</div>
                      <div className="font-medium text-lg">{driver.full_name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Username</div>
                      <div className="font-medium">@{driver.username}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Téléphone</div>
                        <div className="font-medium">{driver.phone}</div>
                      </div>
                    </div>
                    {driver.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-500">Email</div>
                          <div className="font-medium">{driver.email}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {driver.stats && (
                  <div className="bg-white border rounded-xl p-6">
                    <h3 className="font-semibold text-lg mb-4">Statistiques et Performance</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <div className="text-sm text-gray-500">Note moyenne</div>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold">{driver.stats.averageRating.toFixed(1)}</span>
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 mb-2">Trajets effectués</div>
                        <div className="text-2xl font-bold">{driver.stats.totalTripsCompleted}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 mb-2">Élèves transportés</div>
                        <div className="text-2xl font-bold">{driver.stats.totalStudentsTransported}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <div className="text-sm text-gray-500">Heures de conduite</div>
                        </div>
                        <div className="text-2xl font-bold">{formatTime(driver.stats.totalHours)}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-green-500" />
                          <div className="text-sm text-gray-500">Score sécurité</div>
                        </div>
                        <div className="text-2xl font-bold text-green-600">{driver.stats.safetyScore}%</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <div className="text-sm text-gray-500">Ponctualité</div>
                        </div>
                        <div className="text-2xl font-bold text-purple-600">{driver.stats.onTimeRate}%</div>
                      </div>
                    </div>
                  </div>
                )}

                {driver.assignedBus && (
                  <div className="bg-white border rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Bus className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-lg">Bus assigné</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        {driver.assignedBus.photo_url ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                            <img 
                              src={driver.assignedBus.photo_url} 
                              alt={driver.assignedBus.licence_plate}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Bus className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-lg">{driver.assignedBus.licence_plate}</div>
                          <div className="text-sm text-gray-600">{driver.assignedBus.model}</div>
                          <div className="text-sm text-gray-500">{driver.assignedBus.capacity} places</div>
                        </div>
                      </div>
                      
                      {driver.assignedBus.school && (
                        <div className="border-t pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <div className="text-sm text-gray-500">École assignée</div>
                          </div>
                          <div className="font-medium">{driver.assignedBus.school.name}</div>
                          {driver.assignedBus.school.address && (
                            <div className="text-sm text-gray-600">{driver.assignedBus.school.address}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {driver.license_info && (
                  <div className="bg-white border rounded-xl p-6">
                    <h3 className="font-semibold text-lg mb-4">Permis de conduire</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-500">Numéro du permis</div>
                        <div className="font-medium">{driver.license_info.number}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Catégorie</div>
                        <div className="font-medium">{driver.license_info.category}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Date d'expiration</div>
                        <div className={`font-medium ${
                          new Date(driver.license_info.expiry_date) < new Date()
                            ? 'text-red-600'
                            : ''
                        }`}>
                          {formatDate(driver.license_info.expiry_date)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white border rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-lg">Dates</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500">Date d'ajout</div>
                      <div className="font-medium">{formatDate(driver.created_at)}</div>
                    </div>
                    {driver.updated_at && (
                      <div>
                        <div className="text-sm text-gray-500">Dernière modification</div>
                        <div className="font-medium">{formatDate(driver.updated_at)}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white border rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-4">Informations d'accès</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500">Statut</div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        driver.assignedBus 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {driver.assignedBus ? 'Actif avec bus' : 'Disponible'}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Dernière connexion</div>
                      <div className="font-medium">Aujourd'hui 08:30</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Plateforme</div>
                      <div className="font-medium">Application Chauffeur</div>
                    </div>
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