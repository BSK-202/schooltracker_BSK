'use client';

import { useState } from 'react';
import DriverTable from '@/components/drivers/DriverTable';
import DriverFormModal from '@/components/drivers/DriverFormModal';
import { useDrivers } from '@/hooks/useDrivers';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function DriversPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    drivers,
    loading,
    error,
    createDriver,
    updateDriver,
    deleteDriver
  } = useDrivers();

  const handleEdit = (driver: any) => {
    setEditingDriver(driver);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ?')) {
      const result = await deleteDriver(id);
      if (result.success) {
        setSuccessMessage(result.message);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(result.error || null);
      }
    }
  };

  const handleCreate = () => {
    setEditingDriver(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    let result;

    if (editingDriver) {
      result = await updateDriver(editingDriver.id, data);
    } else {
      result = await createDriver(data);
    }

    if (result.success) {
      setSuccessMessage(result.message || null);
      setIsFormOpen(false);
      setEditingDriver(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage(result.error|| null);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDriver(null);
  };

  return (
    <div className="p-6 lg:p-10 space-y-8">
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="flex items-center gap-3 bg-green-50 text-green-800 px-4 py-3 rounded-lg border border-green-200 shadow-lg max-w-md">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="flex items-center gap-3 bg-red-50 text-red-800 px-4 py-3 rounded-lg border border-red-200 shadow-lg max-w-md">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chauffeurs</h1>
          <p className="text-gray-500 mt-1">Gérez votre personnel de conduite.</p>
        </div>
      </div>

      <DriverTable
        drivers={drivers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        loading={loading}
      />

      <DriverFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingDriver}
        loading={loading}
      />
    </div>
  );
}