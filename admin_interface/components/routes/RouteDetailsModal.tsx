import { X, Clock, MapPin, Users, Bus, School } from "lucide-react"
import dynamic from "next/dynamic"

const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false })
import { FormattedRoute } from "@/hooks/useRoutes"

interface RouteDetailsModalProps {
  route: FormattedRoute
  isOpen: boolean
  onClose: () => void
}

export default function RouteDetailsModal({ route, isOpen, onClose }: RouteDetailsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{route.name}</h2>
            <p className="text-sm text-gray-600">Visualisation complète du trajet</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 h-[600px]">
          {/* Informations détaillées */}
          <div className="border-r p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Informations générales */}
              <div>
                <h3 className="font-bold text-lg mb-4">Informations du trajet</h3>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${route.type === "PICKUP" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                        {route.type === "PICKUP" ? "RAMASSAGE" : "RETOUR"}
                      </div>
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
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Horaires :</span>
                        <span>{route.scheduledStart} - {route.scheduledEnd}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Arrêts :</span>
                        <span>{route.stopsCount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Élèves :</span>
                        <span>{route.studentsCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bus className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Bus :</span>
                        <span>{route.bus.licence_plate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <School className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">École :</span>
                        <span>{route.school.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des arrêts */}
              <div>
                <h3 className="font-bold text-lg mb-4">Arrêts ({route.stops.length})</h3>
                <div className="space-y-3">
                  {route.stops.map((stop, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{stop.name}</p>
                          <p className="text-xs text-gray-500">{stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}</p>
                          {stop.scheduled_time && (
                            <div className="flex items-center gap-1 mt-1 text-sm text-blue-600">
                              <Clock className="w-3 h-3" />
                              <span>Arrivée prévue : {stop.scheduled_time}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Carte détaillée */}
          <div className="col-span-2">
            <RouteMap stops={route.stops} height="100%" interactive />
          </div>
        </div>
      </div>
    </div>
  )
}