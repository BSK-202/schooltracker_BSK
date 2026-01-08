// components/MapComponent.tsx
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes par défaut de Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapMarker {
  id: number;
  position: [number, number]; // [lat, lng]
  address: string;
}

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  height?: string;
  onMapClick?: (lat: number, lng: number) => void;
  selectedMarkerId?: number;
}

export default function MapComponent({
  center = [33.5731, -7.5898], // Casablanca par défaut
  zoom = 13,
  markers = [],
  height = '400px',
  onMapClick,
  selectedMarkerId
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialiser la carte
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Créer la carte
    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: true
    });

    // Ajouter le layer de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Créer le layer group pour les marqueurs
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Gérer les clics sur la carte
    if (onMapClick) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    mapRef.current = map;

    // Cleanup
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Mettre à jour le centre de la carte
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Mettre à jour les marqueurs
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    // Nettoyer les marqueurs existants
    markersLayerRef.current.clearLayers();

    if (markers.length === 0) return;

    // Créer une icône personnalisée pour le marqueur sélectionné
    const createCustomIcon = (isSelected: boolean) => {
      if (isSelected) {
        return L.divIcon({
          className: 'custom-marker',
          html: `
        <div style="
          background-color: #EF4444;
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          border: 3px solid white;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
      `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });
      }

      // Icône par défaut (SAFE pour Next + Turbopack)
      return L.icon({
        iconRetinaUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
    };


    // Ajouter les nouveaux marqueurs
    const positions: [number, number][] = [];

    markers.forEach((marker) => {
      const isSelected = marker.id === selectedMarkerId;
      const markerIcon = createCustomIcon(isSelected);

      const leafletMarker = L.marker(marker.position, {
        icon: markerIcon
      });

      // Créer le contenu du popup
      const popupContent = `
        <div style="min-width: 200px;">
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #1F2937;">
            📍 Arrêt
          </div>
          <div style="margin-bottom: 4px; color: #4B5563;">
            ${marker.address}
          </div>
        </div>
      `;

      leafletMarker.bindPopup(popupContent);
      leafletMarker.addTo(markersLayerRef.current!);

      positions.push(marker.position);
    });

    // Ajuster la vue pour montrer tous les marqueurs
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      mapRef.current.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15
      });
    }
  }, [markers, selectedMarkerId]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        height,
        width: '100%',
        borderRadius: '12px',
        overflow: 'hidden'
      }}
    />
  );
}