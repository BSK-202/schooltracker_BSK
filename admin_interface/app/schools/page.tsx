// app/admin/schools/page.tsx
'use client';

import { useState } from 'react';
import SchoolCard from '@/components/schools/SchoolCard';
import SchoolFormModal from '@/components/schools/SchoolFormModal';
import { useSchools } from '@/hooks/useSchools';

export default function SchoolsPage() {
  const { schools, loading, error, createSchool } = useSchools();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewRoutes = (schoolId: number) => {
    console.log('View routes for school:', schoolId);
    // Navigation vers les circuits de l'école
    // router.push(`/admin/schools/${schoolId}/routes`);
  };

  const handleEdit = (schoolId: number) => {
    console.log('Edit school:', schoolId);
    // Ouvrir modal d'édition
  };

  const handleDelete = async (schoolId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette école ?')) {
      // await deleteSchool(schoolId);
    }
  };

  const handleCreateSchool = async (data: any) => {
    const result = await createSchool(data);
    if (result.success) {
      setIsModalOpen(false);
    } else {
      alert(result.error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-10">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-bold">Erreur</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Écoles Partenaires</h1>
          <p className="text-muted-foreground mt-1">Gérez les établissements et les contrats de transport.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 shadow-sm"
        >
          Ajouter une école
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {schools.map((school) => (
          <SchoolCard
            key={school.id}
            school={school}
            onViewRoutes={handleViewRoutes}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {schools.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucune école trouvée.</p>
        </div>
      )}

      <SchoolFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSchool}
      />
    </div>
  );
}