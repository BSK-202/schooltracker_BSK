// src/tracking/dto/tracking-response.dto.ts
import { TypeTrajet } from '../../admin/trajets/entities/trajet.entity';

// Exportez toutes les interfaces
export interface SchoolInfo {
  id: number;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

export interface StopInfo {
  id: number;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

export interface BusInfo {
  id: number;
  licencePlate: string;
  capacity: number;
  photoUrl: string | null;
  isActive: boolean;
  school: SchoolInfo | null;
}

export interface RouteStopInfo {
  id: number;
  address: string;
  latitude: number | null;
  longitude: number | null;
  order: number;
  scheduledTime: string;
  type: TypeTrajet;
  isChildStop: boolean;
}

export interface ChildInfo {
  id: number;
  name: string;
  photoUrl: string | null;
  qrCode: string;
  stop: StopInfo | null;
  bus: BusInfo | null;
  busText: string;
}

export interface TrajetInfo {
  id: number;
  nom: string;
  type: TypeTrajet;
  heureDebut: string;
  heureFin: string;
}

export interface RouteInfo {
  trajet: TrajetInfo | null;
  stops: RouteStopInfo[];
  totalStops: number;
  hasActiveRoute: boolean;
}

export interface ParentInfo {
  id: number;
  name: string;
  phone: string;
}

// DTOs de réponse complets
export class SchoolsResponseDto {
  message: string;
  schools: Array<{
    id: number;
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    childrenCount: number;
    childrenIds: number[];
    childrenNames: string[];
  }>;
  totalSchools: number;
  hasMultipleSchools: boolean;
}

export class ChildrenResponseDto {
  message: string;
  children: Array<{
    id: number;
    name: string;
    photoUrl: string | null;
    qrCode: string;
    bus: BusInfo | null;
    stop: StopInfo | null;
    school: SchoolInfo | null;
    busText: string;
    hasBus: boolean;
    hasRoute: boolean;
  }>;
  totalChildren: number;
  hasChildren: boolean;
}

export class ChildTrackingResponseDto {
  message: string;
  child: ChildInfo;
  route: RouteInfo;
  school: SchoolInfo | null;
  parents: {
    parent1: ParentInfo | null;
    parent2: ParentInfo | null;
  };
}

export class TrackingSummaryResponseDto {
  message: string;
  schools: Array<{
    id: number;
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    childrenCount: number;
    childrenIds: number[];
    childrenNames: string[];
  }>;
  children: Array<{
    id: number;
    name: string;
    photoUrl: string | null;
    qrCode: string;
    bus: BusInfo | null;
    stop: StopInfo | null;
    school: SchoolInfo | null;
    busText: string;
    hasBus: boolean;
    hasRoute: boolean;
  }>;
  summary: {
    totalSchools: number;
    totalChildren: number;
    hasMultipleSchools: boolean;
    hasChildren: boolean;
  };
}