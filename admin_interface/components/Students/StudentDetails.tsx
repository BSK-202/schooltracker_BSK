import { X, User, Calendar, MapPin, QrCode, Bus } from 'lucide-react';
import { Student } from '@/services/api/students';

interface StudentDetailsProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export default function StudentDetails({ student, isOpen, onClose, onEdit }: StudentDetailsProps) {
  if (!isOpen || !student) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
          <div className="sticky top-0 bg-white border-b z-10">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                  {student.photoUrl ? (
                    <img 
                      src={student.photoUrl} 
                      alt={student.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{student.fullName}</h2>
                  <p className="text-gray-500 text-sm">Élève</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {onEdit && (
                  <button
                    onClick={onEdit}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations personnelles */}
              <div className="bg-white border rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">Informations de l'élève</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Nom complet</div>
                    <div className="font-medium text-lg">{student.fullName}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">QR Code</div>
                    <div className="flex items-center gap-2 font-mono text-sm">
                      <QrCode className="w-4 h-4 text-gray-500" />
                      {student.qrCode}
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrêt de bus */}
              {student.stop && (
                <div className="bg-white border rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Bus className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-lg">Transport scolaire</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Arrêt de bus</div>
                        <div className="font-medium">{student.stop.address}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="bg-white border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-lg">Dates</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Date d'inscription</div>
                    <div className="font-medium">{formatDate(student.createdAt)}</div>
                  </div>
                  {student.updatedAt && (
                    <div>
                      <div className="text-sm text-gray-500">Dernière mise à jour</div>
                      <div className="font-medium">{formatDate(student.updatedAt)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Photo de profil */}
              <div className="bg-white border rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">Photo de profil</h3>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300">
                    {student.photoUrl ? (
                      <img 
                        src={student.photoUrl} 
                        alt={student.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="w-full">
                    <div className="text-sm text-gray-500 mb-2">URL de la photo</div>
                    <div className="font-mono text-sm break-all p-3 bg-gray-50 rounded-lg">
                      {student.photoUrl || "Aucune photo définie"}
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
