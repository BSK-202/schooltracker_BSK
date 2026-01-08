import { useState } from 'react';
import {
    Eye,
    Edit,
    Trash2,
    Search,
    Plus,
    ChevronLeft,
    ChevronRight,
    User,
    Phone,
    Users,
} from 'lucide-react';

// Supprimez l'interface locale Parent et Child
// Importez les interfaces depuis le service
import { Parent } from '@/services/api/parents';

interface ParentTableProps {
    parents: Parent[]; // Utilisez l'interface du service
    onEdit?: (parent: Parent) => void;
    onDelete?: (id: number) => void;
    onView?: (id: number) => void;
    onCreate?: () => void;
    loading?: boolean;
}

export default function ParentTable({
    parents,
    onEdit,
    onDelete,
    onView,
    onCreate,
    loading
}: ParentTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGender, setSelectedGender] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const filteredParents = parents.filter(parent => {
        const matchesSearch =
            parent.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            parent.phone.includes(searchTerm) 
        

        const matchesGender =
            selectedGender === 'all' ||
            (selectedGender === 'male' && parent.sexe) ||
            (selectedGender === 'female' && !parent.sexe);

        return matchesSearch && matchesGender;
    });

    const totalPages = Math.ceil(filteredParents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentParents = filteredParents.slice(startIndex, endIndex);

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
                            placeholder="Rechercher par nom, téléphone ou enfant..."
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
                            value={selectedGender}
                            onChange={(e) => {
                                setSelectedGender(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="all">Tous les parents</option>
                            <option value="male">Pères</option>
                            <option value="female">Mères</option>
                        </select>

                        {onCreate && (
                            <button
                                onClick={onCreate}
                                className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg font-bold hover:opacity-90"
                            >
                                <Plus className="w-4 h-4" />
                                Ajouter un parent
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
                                <th className="text-left py-3 px-4 font-semibold text-sm">Parent</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Téléphone</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Sexe</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Date d'ajout</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {currentParents.map((parent) => (
                                <tr key={parent.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                                                {parent.photoUrl ? (
                                                    <img
                                                        src={parent.photoUrl}
                                                        alt={parent.fullName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-gray-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{parent.fullName}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm">{parent.phone}</span>
                                        </div>
                                    </td>

                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            {parent.sexe ? (
                                                <>
                                                    <User className="w-4 h-4 text-blue-500" />
                                                    <span className="text-sm">Homme</span>
                                                </>
                                            ) : (
                                                <>
                                                    <User className="w-4 h-4 text-pink-500" />
                                                    <span className="text-sm">Femme</span>
                                                </>
                                            )}
                                        </div>
                                    </td>

                                 

                                    <td className="py-3 px-4">
                                        <div className="text-sm text-gray-600">{formatDate(parent.createdAt)}</div>
                                    </td>

                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            {onView && (
                                                <button
                                                    onClick={() => onView(parent.id)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Voir détails"
                                                >
                                                    <Eye className="w-4 h-4 text-gray-600" />
                                                </button>
                                            )}
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(parent)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-4 h-4 text-gray-600" />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(parent.id)}
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

                {filteredParents.length > itemsPerPage && (
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

                {filteredParents.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun parent trouvé</h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm
                                ? 'Aucun résultat pour cette recherche.'
                                : 'Commencez par ajouter votre premier parent.'}
                        </p>
                        {onCreate && !searchTerm && (
                            <button
                                onClick={onCreate}
                                className="bg-black text-white px-6 py-2.5 rounded-lg font-bold hover:opacity-90"
                            >
                                Ajouter un parent
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}