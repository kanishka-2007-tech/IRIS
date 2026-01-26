
import { SafetyStatus } from '../types';

/**
 * Tech Ventures - IRIS Intelligence Engine
 * Strictly implements the logic from the IRIS Assistant specifications.
 */

export interface RiskAnalysis {
  status: SafetyStatus;
  level: string;
  color: string;
  score: number;
  lighting: number;
  crowd: number;
  crimeScore: number;
  timeFactor: number;
  suggestion: string;
  area: string;
}

export interface IrisAnalysisResult {
  status: string;
  message: string;
  score: number;
  priority: string;
  color: string;
  vibration: number[];
  label: string;
}

export const backend = {
  /**
   * IRIS INDEX (LOGIC BASED – NO ML)
   * Mirroring Android implementation:
   * hour in 6..18 -> SAFE 🟢
   * hour in 18..21 -> CAUTION 🟡
   * else -> RISK 🔴
   */
  getIrisIndex: (): { label: string, color: string, status: SafetyStatus } => {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 18) {
      return { label: "SAFE 🟢", color: "emerald", status: SafetyStatus.SAFE };
    } else if (hour >= 18 && hour < 21) {
      return { label: "CAUTION 🟡", color: "amber", status: SafetyStatus.CAUTION };
    } else {
      return { label: "RISK 🔴", color: "rose", status: SafetyStatus.DANGER };
    }
  },

  irisCheckArea: (lat: number, lng: number): IrisAnalysisResult => {
    const iris = backend.getIrisIndex();
    
    const messages = {
      [SafetyStatus.SAFE]: "Daylight hours. Area visibility is high. Parameters optimal.",
      [SafetyStatus.CAUTION]: "Evening hours. Public density decreasing. Stay alert.",
      [SafetyStatus.DANGER]: "Night-time protocol active. High-risk period. Stay in lit paths."
    };

    return {
      status: iris.status,
      label: iris.label,
      message: messages[iris.status],
      score: iris.status === SafetyStatus.SAFE ? 90 : iris.status === SafetyStatus.CAUTION ? 50 : 20,
      priority: iris.status === SafetyStatus.DANGER ? "High" : "Normal",
      color: iris.color,
      vibration: iris.status === SafetyStatus.DANGER ? [1000] : [200]
    };
  },

  generateCrowdData: (centerLat: number, centerLng: number) => {
    const points = [];
    for (let i = 0; i < 150; i++) {
      const isCluster = Math.random() > 0.8;
      const spread = isCluster ? 0.005 : 0.03;
      const offsetLat = (Math.random() - 0.5) * spread; 
      const offsetLng = (Math.random() - 0.5) * spread;
      points.push({ 
        id: `u_${i}`, 
        lat: centerLat + offsetLat, 
        lng: centerLng + offsetLng, 
        lastSeen: Date.now() 
      });
    }
    return points;
  },

  calculateSafetyLevel: (userLat: number, userLng: number, crowd: any[]): RiskAnalysis => {
    const iris = backend.getIrisIndex();
    const radius = 0.0015; 
    const nearbyCount = crowd.filter(p => 
      Math.abs(p.lat - userLat) < radius && Math.abs(p.lng - userLng) < radius
    ).length;
    
    const hour = new Date().getHours();
    const isDark = hour < 6 || hour > 19;
    const lighting = isDark ? 30 : 90;
    const crowdDensity = Math.min(nearbyCount * 10, 100);
    
    return { 
      status: iris.status, 
      level: iris.label,
      color: iris.color,
      score: iris.status === SafetyStatus.SAFE ? 95 : iris.status === SafetyStatus.CAUTION ? 65 : 30,
      lighting,
      crowd: crowdDensity,
      crimeScore: iris.status === SafetyStatus.DANGER ? 80 : 20,
      timeFactor: hour,
      suggestion: iris.status === SafetyStatus.DANGER ? "Avoid unlit paths." : "Area parameters stable.",
      area: "Active Operational Grid"
    };
  }
};
