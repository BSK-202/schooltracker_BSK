'use client';

import { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Users,
  AlertCircle,
  CheckCircle // Ajoutez cette importation

} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStudents } from "@/hooks/useStudents"
import StudentTable from "@/components/Students/StudentTable"
import StudentFormModal from "@/components/Students/StudentFormModal"
import StudentDetails from "@/components/Students/StudentDetails"

export default function StudentsPage() {
  const { 
    students, 
    loading, 
    error,
    fetchStudents, 
    createStudent, 
    updateStudent, 
    deleteStudent,
    getStudentById,
    clearError
  } = useStudents();
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Afficher les notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    if (type === 'error') {
      clearError();
    }
  };

  const handleCreateStudent = async (data: any) => {
    const result = await createStudent(data);
    
    if (result.success) {
      showNotification('success', 'Élève créé avec succès');
      setIsFormModalOpen(false);
    } else {
      showNotification('error', 'Erreur lors de la création');
    }
  };

  const handleUpdateStudent = async (data: any) => {
    if (!editingStudent) return;
    
    const result = await updateStudent(editingStudent.id, data);
    
    if (result.success) {
      showNotification('success', 'Élève mis à jour avec succès');
      setIsFormModalOpen(false);
      setEditingStudent(null);
    } else {
      showNotification('error', 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élève ?')) {
      const result = await deleteStudent(id);
      
      if (result.success) {
        showNotification('success', 'Élève supprimé avec succès');
      } else {
        showNotification('error', result.error || 'Erreur lors de la suppression');
      }
    }
  };

  const handleViewStudent = async (id: number) => {
    const result = await getStudentById(id);
    
    if (result.success) {
      setSelectedStudent(result.data);
      setIsDetailsModalOpen(true);
    } else {
      showNotification('error', result.error || 'Erreur lors de la récupération');
    }
  };

  const handleEditStudent = (student: any) => {
    setEditingStudent(student);
    setIsFormModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border animate-in slide-in-from-right-5 duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle className={`w-5 h-5 ${notification.type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
            <div>
              <h4 className="font-semibold">
                {notification.type === 'success' ? 'Succès' : 'Erreur'}
              </h4>
              <p className="text-sm mt-1">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Élèves</h1>
          <p className="text-muted-foreground">Suivi des inscriptions et liens avec les parents.</p>
        </div>
        <Button 
          className="bg-black text-white hover:bg-black/90"
          onClick={() => {
            setEditingStudent(null);
            setIsFormModalOpen(true);
          }}
        >
          <UserPlus className="mr-2 h-4 w-4" /> 
          Ajouter un Élève
        </Button>
      </div>

      {/* Message d'erreur global */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <Button 
            onClick={() => fetchStudents()} 
            className="mt-3"
            variant="outline"
            size="sm"
          >
            Réessayer
          </Button>
        </div>
      )}

      {/* Statistique simple */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Élèves</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{students.length}</div>
          <p className="text-xs text-muted-foreground">Tous les élèves inscrits</p>
        </CardContent>
      </Card>

      {/* Tableau des élèves */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Élèves</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentTable
            students={students}
            loading={loading}
            onCreate={() => {
              setEditingStudent(null);
              setIsFormModalOpen(true);
            }}
            onEdit={handleEditStudent}
            onDelete={handleDeleteStudent}
            onView={handleViewStudent}
          />
        </CardContent>
      </Card>

      {/* Modales */}
      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingStudent(null);
        }}
        onSubmit={editingStudent ? handleUpdateStudent : handleCreateStudent}
        initialData={editingStudent}
        loading={loading}
      />

      <StudentDetails
        student={selectedStudent}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedStudent(null);
        }}
      />
    </div>
  );
}