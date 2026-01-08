"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import dynamic from "next/dynamic"
import { useRoutes } from "@/hooks/useRoutes"
import { useSchools } from "@/hooks/useSchools"
import { useBuses } from "@/hooks/useBuses"
import { useStops } from "@/hooks/useStops"
import RouteList from "@/components/routes/RouteList"
import CreateRouteModal from "@/components/routes/CreateRouteModal"
import RouteDetailsModal from "@/components/routes/RouteDetailsModal"

// Composant dynamique pour la carte
const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false })

export default function RoutesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<any>(null)
  
  // Initialiser les hooks
  const routesHook = useRoutes()
  const schoolsHook = useSchools()
  const busesHook = useBuses()
  const stopsHook = useStops()

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        routesHook.fetchRoutes(),
        schoolsHook.fetchSchools(),
        busesHook.fetchBuses(),
        stopsHook.fetchStops()
      ])
    }
    
    loadData()
  }, [])

  // Gestion des erreurs
  useEffect(() => {
    if (routesHook.error) {
      console.error("Erreur routes:", routesHook.error)
    }
    if (schoolsHook.error) {
      console.error("Erreur écoles:", schoolsHook.error)
    }
    if (busesHook.error) {
      console.error("Erreur bus:", busesHook.error)
    }
  }, [routesHook.error, schoolsHook.error, busesHook.error])

  const handleViewDetails = (route: any) => {
    setSelectedRoute(route)
  }

  const handleToggleStatus = async (route: any) => {
    const result = await routesHook.toggleRouteStatus(route.id, !route.is_active)
    if (result.success) {
      alert(`Route ${route.is_active ? 'suspendue' : 'activée'} avec succès`)
    } else {
      alert(`Erreur: ${result.error}`)
    }
  }

  const handleDeleteRoute = async (route: any) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le trajet "${route.name}" ?`)) {
      const result = await routesHook.deleteRoute(route.id)
      if (result.success) {
        alert(result.message)
      } else {
        alert(`Erreur: ${result.error}`)
      }
    }
  }

  if (routesHook.loading && routesHook.routes.length === 0) {
    return (
      <div className="p-6 lg:p-10 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des trajets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trajets & Circuits</h1>
          <p className="text-muted-foreground mt-1">
            Planifiez et gérez les itinéraires de ramassage et de retour scolaire.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-black text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Créer un trajet
        </button>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-3 flex-wrap">
        <button className="px-4 py-2 bg-black text-white rounded-lg text-xs font-bold">
          Tous ({routesHook.routes.length})
        </button>
        <button className="px-4 py-2 bg-secondary text-foreground rounded-lg text-xs font-semibold hover:bg-muted">
          Ramassage ({routesHook.routes.filter(r => r.type === "PICKUP").length})
        </button>
        <button className="px-4 py-2 bg-secondary text-foreground rounded-lg text-xs font-semibold hover:bg-muted">
          Retour ({routesHook.routes.filter(r => r.type === "DROPOFF").length})
        </button>
      </div>

      {/* Liste des routes */}
      <RouteList
        routes={routesHook.routes}
        loading={routesHook.loading}
        onViewDetails={handleViewDetails}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteRoute}
      />

      {/* Modal de création */}
      {showCreateModal && (
        <CreateRouteModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false)
          }}
          schools={schoolsHook.schools}
          buses={busesHook.buses}
          stops={stopsHook.stops}
          onCreate={async (formData) => {
            const result = await routesHook.createRoute(routesHook.prepareCreateData(formData))
            if (result.success) {
              alert(result.message || "Trajet créé avec succès")
              setShowCreateModal(false)
              return true
            } else {
              alert(`Erreur: ${result.error}`)
              return false
            }
          }}
        />
      )}

      {/* Modal de détails */}
      {selectedRoute && (
        <RouteDetailsModal
          route={selectedRoute}
          isOpen={!!selectedRoute}
          onClose={() => setSelectedRoute(null)}
        />
      )}
    </div>
  )
}