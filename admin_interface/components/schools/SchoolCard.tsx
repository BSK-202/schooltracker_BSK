// components/schools/SchoolCard.tsx
import { School, MapPin, ExternalLink } from "lucide-react";

interface SchoolCardProps {
  school: {
    id: number;
    name: string;
    address: string;
    stats?: {
      busCount: number;
      studentCount: number;
      activeTripsCount: number;
    };
  };
  onViewRoutes?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function SchoolCard({ school, onViewRoutes, onEdit, onDelete }: SchoolCardProps) {
  return (
    <div className="bg-card rounded-xl border shadow-sm p-6 flex items-start gap-6 hover:shadow-md transition-shadow">
      <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center shrink-0">
        <School className="w-8 h-8 text-muted-foreground" />
      </div>
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{school.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <MapPin className="w-3 h-3" />
              {school.address}
            </div>
          </div>
          <div className="relative">
            <button 
              className="p-1.5 hover:bg-secondary rounded-lg"
              onClick={(e) => {
                // Menu déroulant pour options
                // Vous pouvez implémenter un menu déroulant ici
              }}
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 16 16">
                <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-lg font-bold">
              {school.stats?.studentCount || 0}
            </span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Élèves
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold">
              {school.stats?.activeTripsCount || 0}
            </span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Circuits
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold">
              {school.stats?.busCount || 0}
            </span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Bus
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-2">
          <button 
            onClick={() => onViewRoutes && onViewRoutes(school.id)}
            className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-bold hover:opacity-90"
          >
            Voir circuits
          </button>
          <button className="p-1.5 border rounded-lg hover:bg-secondary">
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}