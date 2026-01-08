import { useState } from 'react';
import { Eye, Edit, Trash2, Search, Filter, Plus, ChevronLeft, ChevronRight, Image as ImageIcon, School, User } from 'lucide-react';

interface Bus {
  id: number;
  licence_plate: string;
  model: string;
  capacity: number;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
  school?: {
    id: number;
    name: string;
  };
  driver?: {
    id: number;
    full_name: string;
  };
}

interface BusTable {
  buses: Bus[];
  onViewDetails: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onCreate?: () => void;
  loading?: boolean;
}

export default function BusTable({ buses, onViewDetails, onEdit, onDelete, onCreate, loading }: BusTable) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filtrer les bus
  const filteredBuses = buses.filter(bus => {
    const matchesSearch = 
      bus.licence_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      selectedStatus === 'all' || 
      (selectedStatus === 'active' && bus.is_active) ||
      (selectedStatus === 'inactive' && !bus.is_active);
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBuses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBuses = filteredBuses.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
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
      {/* Barre de filtres et actions */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par plaque ou modèle..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <div className="flex gap-3">
            <select
              className="px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
            
            {onCreate && (
              <button 
                onClick={onCreate}
                className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg font-bold hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
                Ajouter un bus
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tableau simplifié */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm">Plaque</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Modèle</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Capacité</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">École</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Chauffeur</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Statut</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {currentBuses.map((bus) => (
                <tr key={bus.id} className="hover:bg-gray-50 transition-colors">
                  {/* Plaque */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-gray-900">{bus.licence_plate}</div>
                  </td>
                  
                  {/* Modèle */}
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-700">{bus.model}</div>
                  </td>
                  
                  {/* Capacité */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{bus.capacity}</span>
                      <span className="text-xs text-gray-500">places</span>
                    </div>
                  </td>
                  
                  {/* École */}
                  <td className="py-3 px-4">
                    {bus.school ? (
                      <div className="flex items-center gap-2">
                        <School className="w-4 h-4 text-gray-400" />
                        <span className="text-sm truncate max-w-[150px]">{bus.school.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  
                  {/* Chauffeur */}
                  <td className="py-3 px-4">
                    {bus.driver ? (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm truncate max-w-[120px]">{bus.driver.full_name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  
                  {/* Statut */}
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      bus.is_active 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {bus.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  
                  {/* Actions */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onViewDetails(bus.id)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                        Détails
                      </button>
                      {onEdit && (
                        <button 
                          onClick={() => onEdit(bus.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={() => onDelete(bus.id)}
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

        {/* Pagination */}
        {filteredBuses.length > itemsPerPage && (
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

        {/* Message quand aucun résultat */}
        {filteredBuses.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun bus trouvé</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Aucun résultat pour cette recherche.' 
                : 'Commencez par ajouter votre premier bus.'}
            </p>
            {onCreate && !searchTerm && (
              <button 
                onClick={onCreate}
                className="bg-black text-white px-6 py-2.5 rounded-lg font-bold hover:opacity-90"
              >
                Ajouter un bus
              </button>
            )}
          </div>
        )}
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500">Total bus</div>
          <div className="text-2xl font-bold">{buses.length}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500">Bus actifs</div>
          <div className="text-2xl font-bold text-green-600">
            {buses.filter(b => b.is_active).length}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500">Avec chauffeur</div>
          <div className="text-2xl font-bold">
            {buses.filter(b => b.driver).length}
          </div>
        </div>
      </div>
    </div>
  );
}