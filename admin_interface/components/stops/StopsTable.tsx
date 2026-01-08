// components/Stops/StopsTable.tsx
'use client';

import { useState } from 'react';
import { Edit2, Trash2, MapPin } from 'lucide-react';
import { useStops } from '@/hooks/useStops';
import { Stop } from '@/services/api/stops';
import { toast } from 'sonner';

interface StopsTableProps {
  stops: Stop[];
  onEdit: (stop: any) => void;
  loading: boolean;
}

export default function StopsTable({ stops, onEdit, loading }: StopsTableProps) {
  const { deleteStop, getStopCoordinates } = useStops();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number, address: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'arrêt "${address}" ?`)) {
      return;
    }

    setDeletingId(id);
    const result = await deleteStop(id);
    setDeletingId(null);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error || 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="animate-pulse space-y-4 p-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex-1 h-16 bg-gray-200 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stops.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Adresse
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Latitude
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Longitude
              </th>
              <th className="w-32 px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stops.map((stop) => {
              const coordinates = getStopCoordinates(stop);
              const isDeleting = deletingId === stop.id;
              
              return (
                <tr
                  key={stop.id}
                  className={`
                    hover:bg-gray-50 transition-colors
                    ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
                  `}
                >
                  {/* Adresse */}
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {stop.address}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {stop.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Latitude */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-gray-700 bg-gray-50 px-3 py-1 rounded">
                      {coordinates.lat.toFixed(6)}
                    </span>
                  </td>

                  {/* Longitude */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-gray-700 bg-gray-50 px-3 py-1 rounded">
                      {coordinates.lng.toFixed(6)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(stop)}
                        disabled={isDeleting}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(stop.id, stop.address)}
                        disabled={isDeleting}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Résumé */}
      <div className="px-6 py-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Total : <span className="font-semibold text-gray-900">{stops.length}</span> arrêt(s)
          </span>
        </div>
      </div>
    </div>
  );
}