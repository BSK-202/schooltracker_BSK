import { RouteCard } from "./RouteCard"
import { FormattedRoute } from "@/hooks/useRoutes"

interface RouteListProps {
  routes: FormattedRoute[]
  loading: boolean
  onViewDetails: (route: FormattedRoute) => void
  onToggleStatus: (route: FormattedRoute) => void
  onDelete: (route: FormattedRoute) => void
}

export default function RouteList({ 
  routes, 
  loading, 
  onViewDetails, 
  onToggleStatus, 
  onDelete 
}: RouteListProps) {
  if (loading && routes.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="flex gap-4">
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (routes.length === 0) {
    return (
      <div className="text-center py-12 border rounded-xl">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Aucun trajet trouvé</h3>
        <p className="text-gray-600">Commencez par créer votre premier trajet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {routes.map((route) => (
        <RouteCard
          key={route.id}
          route={route}
          onViewDetails={() => onViewDetails(route)}
          onToggleStatus={() => onToggleStatus(route)}
          onDelete={() => onDelete(route)}
        />
      ))}
    </div>
  )
}