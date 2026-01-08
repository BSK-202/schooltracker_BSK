'use client';

import { useState, useEffect } from 'react';
import BusTable from '@/components/buses/BusTable';
import BusDetails from '@/components/buses/BusDetails';
import BusFormModal from '@/components/buses/BusFormModal';
import { useBuses } from '@/hooks/useBuses';
import { useSchools } from '@/hooks/useSchools';
import { useDrivers } from '@/hooks/useDrivers';

export default function BusesPage() {
  const {
    buses,
    loading,
    error,
    createBus,
    updateBus,
    deleteBus,
    clearError
  } = useBuses();

  const { schools } = useSchools();
  const { drivers, fetchDrivers } = useDrivers();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Charger les chauffeurs au montage
  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleViewDetails = (busId: number) => {
    const bus = buses.find(b => b.id === busId);
    if (bus) {
      setSelectedBus(bus);
      setIsDetailsOpen(true);
    }
  };

  const handleEdit = (busId: number) => {
    console.log('Edit bus:', busId);
    // Pour simplifier, on va juste ouvrir les détails
    const bus = buses.find(b => b.id === busId);
    if (bus) {
      setSelectedBus(bus);
      setIsDetailsOpen(true);
    }
  };

  const handleDelete = async (busId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce bus ? Cette action est irréversible.')) {
      const result = await deleteBus(busId);
      if (result.success) {
        alert('Bus supprimé avec succès');
      } else {
        alert(`Erreur: ${result.error}`);
      }
    }
  };

  const handleCreateBus = async (data: any) => {
    const result = await createBus(data);
    if (result.success) {
      setIsModalOpen(false);
      alert('Bus créé avec succès');
    } else {
      alert(`Erreur: ${result.error}`);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Gestion des Bus</h1>
          <p className="text-gray-500 mt-1">
            {buses.length} bus • {buses.filter(b => b.is_active).length} actifs
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un bus
        </button>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-700 hover:text-red-800 font-bold">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Tableau des bus */}
      <BusTable
        buses={buses}
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={() => setIsModalOpen(true)}
        loading={loading}
      />

      {/* Modal de détails */}
      <BusDetails
        bus={selectedBus}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedBus(null);
        }}
        onEdit={handleEdit}
      />

      {/* Modal de création avec liste des chauffeurs */}
      <BusFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateBus}
        schools={schools}
        drivers={drivers} // Passez la liste des chauffeurs ici
      />
    </div>
  );
}