
export enum SafetyStatus {
  SAFE = 'SAFE',
  CAUTION = 'CAUTION',
  DANGER = 'DANGER'
}

export enum SOSCategory {
  FAMILY = 'family',
  POLICE = 'police'
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  priority: number;
  isVerified: boolean;
}

export interface UserProfile {
  name: string;
  phone: string;
  city: string;
  photoUrl?: string;
  isRegistered: boolean;
}

export interface SafetyZone {
  lat: number;
  lng: number;
  status: SafetyStatus;
  reason: string;
  radius: number;
  crowdCount: number;
}

export interface PoliceStation {
  name: string;
  lat: number;
  lng: number;
  distance: string;
  duration: string;
  phone: string;
  address: string;
}

export interface CrowdPoint {
  id: string;
  lat: number;
  lng: number;
  lastSeen: number;
}

export interface SOSLog {
  timestamp: number;
  category: SOSCategory;
  location: { lat: number, lng: number };
  contactsNotified: string[];
  audioRecordingId?: string;
}
