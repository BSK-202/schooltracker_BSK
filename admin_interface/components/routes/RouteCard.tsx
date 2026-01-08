import { Clock, MapPin, Users, Eye, Edit, Trash2, Play, Pause } from "lucide-react"
import dynamic from "next/dynamic"

const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false })
import { FormattedRoute } from "@/hooks/useRoutes"

interface RouteCardProps {
  route: FormattedRoute
  onViewDetails: () => void
  onToggleStatus: () => void
  onDelete: () => void
}

export function RouteCard({ route, onViewDetails, onToggleStatus, onDelete }: RouteCardProps) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Informations du trajet */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-xl">{route.name}</h3>
                {route.is_active ? (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    ACTIF
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                    INACTIF
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{route.school.name}</p>
              <p className="text-xs text-gray-500 mt-1">Bus: {route.bus.licence_plate}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${route.type === "PICKUP" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                {route.type === "PICKUP" ? "RAMASSAGE" : "RETOUR"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="font-semibold">{route.scheduledStart} - {route.scheduledEnd}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{route.stopsCount} arrêts</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{route.studentsCount || 0} élèves</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onViewDetails}
              className="px-4 py-2 bg-black text-white rounded-lg text-xs font-bold hover:opacity-90 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Visualiser
            </button>
            <button className="px-4 py-2 border rounded-lg text-xs font-bold hover:bg-gray-50">
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={onDelete}
              className="px-4 py-2 border rounded-lg text-xs font-bold hover:bg-gray-50"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
            {route.is_active ? (
              <button 
                onClick={onToggleStatus}
                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
                Suspendre
              </button>
            ) : (
              <button 
                onClick={onToggleStatus}
                className="px-4 py-2 border border-green-200 text-green-600 rounded-lg text-xs font-bold hover:bg-green-50 flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Activer
              </button>
            )}
          </div>
        </div>

        {/* Mini carte */}
        <div className="lg:w-1/3 h-48 rounded-lg overflow-hidden border">
          <RouteMap stops={route.stops} height="100%" />
        </div>
      </div>
    </div>
  )
}