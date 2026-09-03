// Detailed GIS coordinates representing the continuous path of the Sone (Son) River (~784 km)
// Tracing from its origin at Amarkantak, MP through UP and Bihar to its confluence with the Ganges near Maner / Patna.

export interface RiverCoordinate {
  lat: number;
  lng: number;
  name?: string;
  state?: 'MP' | 'UP' | 'JH' | 'BR';
}

export const SONE_RIVER_CONFIG = {
  riverName: 'Sone River',
  hindiName: 'सोन नदी',
  alternativeNames: ['Son River', 'Shona'],
  lengthKm: 784,
  basinAreaSqKm: 65110,
  origin: {
    name: 'Amarkantak, Anuppur, Madhya Pradesh',
    lat: 22.678,
    lng: 81.761,
  },
  confluence: {
    name: 'Ganges Confluence near Maner, Patna, Bihar',
    lat: 25.688,
    lng: 84.885,
  },
  // Proximity warning thresholds in kilometers (configurable)
  proximityThresholds: {
    riverfrontCriticalKm: 2.0, // High immediate risk if river is overflowing
    veryCloseKm: 5.0,         // Elevated caution
    nearRiverKm: 10.0,        // River awareness zone
    regionalNoticeKm: 25.0,    // Regional basin zone
  },
  // Major administrative divisions along the Sone basin
  basinDivisions: [
    { name: 'Rewa Division', state: 'Madhya Pradesh', districts: ['Rewa', 'Sidhi', 'Singrauli'] },
    { name: 'Shahdol Division', state: 'Madhya Pradesh', districts: ['Shahdol', 'Anuppur', 'Umaria'] },
    { name: 'Vindhyachal / Mirzapur', state: 'Uttar Pradesh', districts: ['Sonbhadra'] },
    { name: 'Palamu Division', state: 'Jharkhand', districts: ['Garhwa', 'Palamu'] },
    { name: 'Patna / Magadh Division', state: 'Bihar', districts: ['Rohtas', 'Aurangabad', 'Arwal', 'Bhojpur', 'Patna'] },
  ],
};

// Polyline coordinates along the entire course of the Sone River
export const SONE_RIVER_POLYLINE: [number, number][] = [
  // 1. Origin near Amarkantak (Anuppur, MP)
  [22.678, 81.761], // Amarkantak
  [22.782, 81.795],
  [22.915, 81.821],
  [23.054, 81.782], // Gaurela / Anuppur border
  [23.142, 81.685], // Anuppur
  [23.235, 81.562], // Burhar
  [23.321, 81.448], // Amlai
  [23.442, 81.425], // South-east of Shahdol
  [23.552, 81.408], // Shahdol / Jaisinghnagar road crossing
  [23.642, 81.395],
  [23.672, 81.388], // Directly adjacent to user coordinate (23.67, 81.39) - 0.2 km!
  [23.705, 81.352],
  [23.718, 81.285],
  [23.718, 81.208], // Directly adjacent to user coordinate (23.72, 81.19) - 1.8 km!
  [23.752, 81.216],
  [23.795, 81.235],
  [23.865, 81.268],
  [23.942, 81.298],
  
  // 2. Shahdol / Bansagar Dam Region (MP)
  [24.025, 81.272],
  [24.081, 81.258],
  [24.167, 81.294], // Bansagar Dam Reservoir
  [24.234, 81.385],
  [24.289, 81.512],
  [24.341, 81.642],
  
  // 3. Rewa / Sidhi Division (MP) - Rewa gauge region
  [24.398, 81.782],
  [24.442, 81.931],
  [24.485, 82.084],
  [24.512, 82.245],
  [24.538, 82.412],
  [24.549, 82.589],
  [24.561, 82.742],
  [24.572, 82.895],
  
  // 4. Uttar Pradesh (Sonbhadra / Chopan)
  [24.558, 83.031],
  [24.524, 83.025], // Chopan Bridge
  [24.535, 83.184],
  [24.562, 83.342],
  [24.591, 83.498],
  [24.624, 83.612],
  
  // 5. Entering Bihar / Jharkhand border
  [24.665, 83.742],
  [24.712, 83.845],
  [24.768, 83.921],
  
  // 6. Rohtas / Aurangabad (Indrapuri Barrage & Dehri-on-Sone)
  [24.812, 83.985],
  [24.845, 84.032], // Indrapuri Barrage
  [24.908, 84.184], // Dehri-on-Sone (Rohtas / Aurangabad border)
  [24.975, 84.225],
  [25.048, 84.268],
  [25.112, 84.312], // Daudnagar
  
  // 7. Arwal / Bhojpur / Patna
  [25.185, 84.368],
  [25.261, 84.425], // Arwal
  [25.334, 84.489],
  [25.412, 84.558], // Sandesh
  [25.498, 84.642],
  [25.568, 84.731], // Koelwar Bridge
  [25.625, 84.802],
  [25.688, 84.885], // Maner / Confluence with River Ganga
];

// High-risk flood-prone zones (buffer zones based on historical CWC inundation models)
export const SONE_FLOOD_ZONES = [
  {
    id: 'zone-rewa-downstream',
    name: 'Rewa Division Basin Flood Plains',
    center: [24.485, 82.084] as [number, number],
    radiusMeters: 7500,
    severity: 'HIGH_RISK',
    description: 'Low-lying river terraces and confluence channels near Rewa/Sidhi border',
  },
  {
    id: 'zone-chopan-valley',
    name: 'Chopan Sonbhadra Gorge & Basin',
    center: [24.524, 83.025] as [number, number],
    radiusMeters: 6000,
    severity: 'WARNING',
    description: 'Narrow gorge susceptible to sudden discharge surges from upstream dams',
  },
  {
    id: 'zone-dehri-indrapuri',
    name: 'Indrapuri & Dehri-on-Sone Floodplain',
    center: [24.908, 84.184] as [number, number],
    radiusMeters: 8000,
    severity: 'DANGER',
    description: 'Major barrage discharge plains impacting Rohtas and Aurangabad lowlands',
  },
  {
    id: 'zone-koelwar-maner',
    name: 'Koelwar & Maner Delta Inundation Zone',
    center: [25.568, 84.731] as [number, number],
    radiusMeters: 9000,
    severity: 'DANGER',
    description: 'Backwater backflow zone during high Ganga-Sone synchronized flood stage',
  },
];
