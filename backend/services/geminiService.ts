
import { GoogleGenAI } from "@google/genai";
import { SafetyStatus, PoliceStation } from "../types";

// Export LocalIncident interface as it is used in SafetyMap.tsx
export interface LocalIncident {
  title: string;
  uri: string;
  source: string;
  date: string;
}

// Fixed initialization to use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getSafetyScore(
  lat: number,
  lng: number,
  city: string
) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze safety for a woman at coordinates ${lat}, ${lng} in ${city}, India. Consider time of day (assume current). Provide status (SAFE, CAUTION, DANGER), a score (0-100), and a brief suggestion. Return response as a natural safety audit.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "Unable to retrieve AI analysis.";
    const status = text.includes("DANGER") ? SafetyStatus.DANGER : text.includes("CAUTION") ? SafetyStatus.CAUTION : SafetyStatus.SAFE;
    
    // Extracting URLs from grounding metadata if available
    const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Search Source",
      uri: chunk.web?.uri || "#"
    })) || [];

    return {
      status,
      reason: text,
      score: status === SafetyStatus.SAFE ? 90 : 40,
      links
    };
  } catch (error) {
    console.error("Gemini Safety Score Error:", error);
    return null;
  }
}

export const getRecentIncidents = async (city: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `List 3 recent news incidents related to women's safety in ${city}, India. Provide brief titles and context.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links: LocalIncident[] = chunks.map((c: any) => ({
      title: c.web?.title || "News Update",
      uri: c.web?.uri || "#",
      source: "Google Search",
      date: new Date().toLocaleDateString()
    }));

    return {
      text: response.text || "No recent incidents found in the local grid.",
      links
    };
  } catch (error) {
    return { text: "Local intelligence grid offline.", links: [] };
  }
};

export const findNearestPoliceStations = async (lat: number, lng: number): Promise<PoliceStation[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find 3 nearest police stations to ${lat}, ${lng} in India. Return as a JSON array of objects with: name, lat, lng, address, phone, distance.`,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const stations = JSON.parse(response.text || "[]");
    return stations.map((s: any) => ({
      ...s,
      duration: "Calculated via GPS"
    }));
  } catch (error) {
    return [];
  }
};
