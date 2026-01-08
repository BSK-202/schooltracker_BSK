"use client";

import { useState, useEffect } from 'react';
import { Users, UserPlus, Bell, Filter, Download, X } from 'lucide-react';
import ParentTable from '@/components/parents/ParentTable';
import ParentFormModal from '@/components/parents/ParentFormModal';
import ParentDetails from '@/components/parents/ParentDetails';
import { useParents } from '@/hooks/useParents';
import { Parent } from '@/services/api/parents';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function ParentsPage() {
  const {
    parents,
    loading,
    error,
    meta,
    fetchParents,
    createParent,
    updateParent,
    deleteParent,
    getParentById,
    clearError,
  } = useParents();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (error) {
      showNotification(error, 'error');
      clearError();
    }
  }, [error, clearError]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    const notification: Notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleCreateParent = async (data: any) => {
    const result = await createParent(data);
    
    if (result.success) {
      showNotification("Parent créé avec succès", 'success');
      setIsFormModalOpen(false);
    } else {
      showNotification( 'Erreur lors de la création', 'error');
    }
  };

  const handleUpdateParent = async (data: any) => {
    if (!editingParent?.id) return;
    
    const result = await updateParent(editingParent.id, data);
    
    if (result.success) {
      showNotification("Parent modifié avec succès", 'success');
      setIsFormModalOpen(false);
      setEditingParent(null);
    } else {
      showNotification('Erreur lors de la modification', 'error');
    }
  };

  const handleDeleteParent = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce parent ?')) {
      return;
    }

    const result = await deleteParent(id);
    
    if (result.success) {
      showNotification(result.message || 'Parent supprimé avec succès', 'success');
    } else {
      showNotification(result.error || 'Erreur lors de la suppression', 'error');
    }
  };

  const handleViewParent = async (id: number) => {
    const result = await getParentById(id);
    
    if (result.success) {
      setSelectedParent(result.data);
      setIsDetailsOpen(true);
    } else {
      showNotification(result.error || 'Erreur lors du chargement des détails', 'error');
    }
  };

  const handleEditClick = (parent: Parent) => {
    setEditingParent(parent);
    setIsFormModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingParent(null);
    setIsFormModalOpen(true);
  };

  const handleExportData = () => {
    showNotification('Export des parents en cours...', 'info');
    // Implémentez l'export des données ici
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center gap-3 px-4 py-3 border rounded-lg shadow-lg ${
              notification.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : notification.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex-1">{notification.message}</div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="p-1 hover:opacity-70"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Parents</h1>
              </div>
              <p className="text-gray-600">
                Gérez les parents et leurs enfants dans le système de transport scolaire
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                Exporter
              </button>
              <button
                onClick={handleCreateClick}
                className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg font-bold hover:opacity-90"
              >
                <UserPlus className="w-4 h-4" />
                Nouveau parent
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-800">Total Parents</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{meta?.total || 0}</p>
                </div>
                <Users className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            
           
            
            
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <ParentTable
          parents={parents}
          onEdit={handleEditClick}
          onDelete={handleDeleteParent}
          onView={handleViewParent}
          onCreate={handleCreateClick}
          loading={loading}
        />

        {/* Pagination */}
        {/* {meta && meta.total > meta.perPage && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => fetchParents(meta.page - 1)}
              disabled={meta.page === 1}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="text-sm">
              Page {meta.page} sur {Math.ceil(meta.total / meta.perPage)}
            </span>
            <button
              onClick={() => fetchParents(meta.page + 1)}
              disabled={meta.page >= Math.ceil(meta.total / meta.perPage)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )} */}
      </div>

      {/* Modals */}
      <ParentFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingParent(null);
        }}
        onSubmit={editingParent ? handleUpdateParent : handleCreateParent}
        initialData={editingParent || undefined}
        loading={loading}
      />

      {selectedParent && (
        <ParentDetails
          parent={selectedParent}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedParent(null);
          }}
          onEdit={() => {
            setIsDetailsOpen(false);
            handleEditClick(selectedParent);
          }}
        />
      )}
    </div>
  );
}