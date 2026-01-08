"use client"

import { useEffect, useRef } from "react"

interface Stop {
  lat: number
  lng: number
  name: string
}

interface RouteMapProps {
  stops: Stop[]
  path?: [number, number][]  // Ajoutez cette ligne
  height?: string
  interactive?: boolean
}

export default function RouteMap({ stops, height = "400px", interactive = true }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const polylineRef = useRef<L.Polyline | null>(null)
  const initializedRef = useRef(false)

  // Fonction pour créer une icône SVG personnalisée
  const createCustomIcon = (L: any, index: number = 0) => {
    return L.divIcon({
      html: `
        <div style="
          background: #3b82f6;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">
          ${index + 1}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    })
  }

  // Fonction pour créer une icône d'école
  const createSchoolIcon = (L: any) => {
    return L.divIcon({
      html: `
        <div style="
          background: #10b981;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          🏫
        </div>
      `,
      className: 'school-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    })
  }

  useEffect(() => {
    // Ne charger que côté client
    if (typeof window === 'undefined' || !mapRef.current) return

    const initMap = async () => {
      const L = await import("leaflet")

      // Nettoyer la carte existante
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
        initializedRef.current = false
      }

      // Nettoyer les références
      markersRef.current = []
      polylineRef.current = null

      // Vérifier si nous avons des arrêts valides
      const validStops = stops.filter(stop =>
        stop && typeof stop.lat === 'number' && typeof stop.lng === 'number'
      )

      if (validStops.length === 0) {
        // Afficher une carte par défaut
        const defaultCenter: [number, number] = [33.5731, -7.5898] // Casablanca
        const map = L.map(mapRef.current!).setView(defaultCenter, 12)
        leafletMapRef.current = map

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map)

        // Ajouter un marqueur par défaut
        const marker = L.marker(defaultCenter, {
          icon: createSchoolIcon(L)
        })
          .addTo(map)
          .bindPopup("<b>Aucun arrêt</b><br>Ajoutez des arrêts pour voir le trajet")

        marker.openPopup()
        markersRef.current = [marker]
        initializedRef.current = true
        return
      }

      // Créer la nouvelle carte centrée sur le premier arrêt
      const firstStop = validStops[0]
      const map = L.map(mapRef.current!).setView([firstStop.lat, firstStop.lng], 13)
      leafletMapRef.current = map

      // Ajouter les tuiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      // Ajouter les marqueurs avec icônes personnalisées
      validStops.forEach((stop, index) => {
        const isSchool = index === 0 // Premier arrêt = école
        const icon = isSchool ? createSchoolIcon(L) : createCustomIcon(L, index)

        const marker = L.marker([stop.lat, stop.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 200px">
              <b>${isSchool ? '🏫 École' : `🚌 Arrêt ${index}`}</b><br>
              <strong>${stop.name}</strong><br>
              <small>${stop.lat.toFixed(4)}, ${stop.lng.toFixed(4)}</small>
            </div>
          `)

        markersRef.current.push(marker)

        // Ouvrir le popup du premier arrêt (l'école)
        if (index === 0) {
          marker.openPopup()
        }
      })

      // Dessiner une ligne entre les arrêts
      if (validStops.length >= 2) {
        const latlngs = validStops.map(stop => [stop.lat, stop.lng] as [number, number])
        const polyline = L.polyline(latlngs, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.8,
          lineJoin: 'round',
          dashArray: validStops.length > 2 ? '10, 10' : undefined
        }).addTo(map)

        polylineRef.current = polyline

        // Ajuster la vue pour inclure tous les marqueurs
        const bounds = L.latLngBounds(latlngs)
        map.fitBounds(bounds.pad(0.1))
      }

      // Configurer l'interactivité
      if (!interactive) {
        map.dragging.disable()
        map.touchZoom.disable()
        map.doubleClickZoom.disable()
        map.scrollWheelZoom.disable()
        map.boxZoom.disable()
        map.keyboard.disable()
      }

      initializedRef.current = true
    }

    // Délai pour éviter les conflits
    const timer = setTimeout(() => {
      initMap()
    }, 100)

    // Cleanup
    return () => {
      clearTimeout(timer)

      if (leafletMapRef.current) {
        try {
          // Supprimer la polyline
          if (polylineRef.current && leafletMapRef.current.hasLayer(polylineRef.current)) {
            leafletMapRef.current.removeLayer(polylineRef.current)
          }
          polylineRef.current = null

          // Supprimer les marqueurs
          markersRef.current.forEach(marker => {
            if (marker && leafletMapRef.current?.hasLayer(marker)) {
              leafletMapRef.current.removeLayer(marker)
            }
          })
          markersRef.current = []

          // Supprimer la carte
          leafletMapRef.current.off()
          leafletMapRef.current.remove()
          leafletMapRef.current = null

        } catch (error) {
          console.warn("Cleanup error:", error)
        } finally {
          initializedRef.current = false
        }
      }
    }
  }, [stops, interactive])

  // Ajouter du CSS pour les marqueurs personnalisés
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .custom-marker, .school-marker {
        background: transparent !important;
        border: none !important;
      }
      
      .leaflet-popup-content {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .leaflet-popup-content-wrapper {
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  if (stops.length === 0) {
    return (
      <div
        className="rounded-lg bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-300"
        style={{ height }}
      >
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-2">Aucun arrêt à afficher</p>
          <p className="text-gray-500 text-sm">Ajoutez des arrêts pour visualiser le trajet</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      style={{
        height,
        width: "100%",
        minHeight: "200px"
      }}
      className="rounded-lg overflow-hidden border border-gray-200 bg-white"
    />
  )
}