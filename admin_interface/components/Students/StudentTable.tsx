import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import {
  Eye,
  Edit,
  Trash2,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  QrCode,
} from 'lucide-react';
import { Student } from '@/services/api/students';

interface StudentTableProps {
  students: Student[];
  onEdit?: (student: Student) => void;
  onDelete?: (id: number) => void;
  onView?: (id: number) => void;
  onCreate?: () => void;
  loading?: boolean;
}

export default function StudentTable({
  students,
  onEdit,
  onDelete,
  onView,
  onCreate,
  loading,
}: StudentTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.qrCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // Supprimé: recherche par nom de parent
      // student.parents?.parent1?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // student.parents?.parent2?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.stop?.address.toLowerCase().includes(searchTerm.toLowerCase()); // Ajouté

    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, QR code ou adresse d'arrêt..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex gap-3">
            {onCreate && (
              <button
                onClick={onCreate}
                className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg font-bold hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
                Ajouter un élève
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm">Élève</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">QR Code</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Arrêt</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Date d'ajout</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {currentStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                        {student.photoUrl ? (
                          <img
                            src={student.photoUrl}
                            alt={student.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{student.fullName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <div className="w-16 h-16 flex items-center justify-center">
                        <QRCodeSVG
                          value={student.qrCode}
                          size={64}
                          level="H" // Niveau de correction d'erreur
                          includeMargin={false}
                          className="border rounded"
                        />
                      </div>
                     
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {student.stop?.address || 'Non assigné'}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-600">
                      {formatDate(student.createdAt)}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {onView && (
                        <button
                          onClick={() => onView(student.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(student)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(student.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length > itemsPerPage && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-700">
              Page <span className="font-medium">{currentPage}</span> sur{' '}
              <span className="font-medium">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {filteredStudents.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun élève trouvé</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? 'Aucun résultat pour cette recherche.'
                : 'Commencez par ajouter votre premier élève.'}
            </p>
            {onCreate && !searchTerm && (
              <button
                onClick={onCreate}
                className="bg-black text-white px-6 py-2.5 rounded-lg font-bold hover:opacity-90"
              >
                Ajouter un élève
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
