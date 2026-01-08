import { useState } from 'react';
import { Eye, Edit, Trash2, Search, Filter, Plus, ChevronLeft, ChevronRight, User, Phone, Bus, School } from 'lucide-react';


interface Driver {
    id: number;
    full_name: string;
    phone: string;
    created_at: string;
    assignedBus?: {
        id: number;
        licence_plate: string;
    };
    // Ajoutez ces propriétés
    school_id?: number;
    school?: {
        id: number;
        name: string;
        address: string;
    };
}

interface DriverTableProps {
    drivers: Driver[];
    onEdit?: (driver: Driver) => void;
    onDelete?: (id: number) => void;
    onCreate?: () => void;
    loading?: boolean;
}

export default function DriverTable({ drivers, onEdit, onDelete, onCreate, loading }: DriverTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);


    const filteredDrivers = drivers.filter(driver => {
        const matchesSearch =
            driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.phone.includes(searchTerm) ||
            (driver.school?.name.toLowerCase().includes(searchTerm.toLowerCase())) || // Recherche par nom d'école
            (driver.school?.address?.toLowerCase().includes(searchTerm.toLowerCase())); // Recherche par adresse d'école
        const matchesStatus =
            selectedStatus === 'all' ||
            (selectedStatus === 'assigned' && driver.assignedBus) ||
            (selectedStatus === 'available' && !driver.assignedBus);

        return matchesSearch && matchesStatus;
    });
    const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentDrivers = filteredDrivers.slice(startIndex, endIndex);

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
            <div className="bg-white rounded-xl border p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou téléphone..."
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
                            <option value="all">Tous les chauffeurs</option>
                            <option value="assigned">Avec bus</option>
                            <option value="available">Sans bus</option>
                        </select>

                        {onCreate && (
                            <button
                                onClick={onCreate}
                                className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg font-bold hover:opacity-90"
                            >
                                <Plus className="w-4 h-4" />
                                Ajouter un chauffeur
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
                                <th className="text-left py-3 px-4 font-semibold text-sm">Nom complet</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Téléphone</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">École assignée</th> 
                                <th className="text-left py-3 px-4 font-semibold text-sm">Date d'ajout</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {currentDrivers.map((driver) => (
                                <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{driver.full_name}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm">{driver.phone}</span>
                                        </div>
                                    </td>


                                    <td className="py-3 px-4">
                                        {driver.school ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <School className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm">{driver.school.name}</div>
                                                    {driver.school.address && (
                                                        <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                                            {driver.school.address}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">Non assigné</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="text-sm text-gray-600">{formatDate(driver.created_at)}</div>
                                    </td>

                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(driver)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-4 h-4 text-gray-600" />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(driver.id)}
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

                {filteredDrivers.length > itemsPerPage && (
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

                {filteredDrivers.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun chauffeur trouvé</h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm
                                ? 'Aucun résultat pour cette recherche.'
                                : 'Commencez par ajouter votre premier chauffeur.'}
                        </p>
                        {onCreate && !searchTerm && (
                            <button
                                onClick={onCreate}
                                className="bg-black text-white px-6 py-2.5 rounded-lg font-bold hover:opacity-90"
                            >
                                Ajouter un chauffeur
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}