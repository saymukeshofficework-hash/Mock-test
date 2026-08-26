// Architecture for astronomical/astrological calculations that require a
// real ephemeris (planetary positions, houses, dashas, panchang, doshas,
// chart matching). This site intentionally does NOT fake these results.
//
// The UI collects the required inputs and calls `calculationEngine`, which
// currently returns `NotConnected` for anything astronomical. Swap
// `notConnectedEngine` below for a real implementation (e.g. backed by a
// Swiss Ephemeris service or a licensed astrology API) to go live —
// no UI changes required.

export interface BirthDetails {
  name?: string
  date: string // YYYY-MM-DD
  time: string // HH:MM, 24-hour
  place: string
  latitude?: number
  longitude?: number
  timezone?: string
}

export type EngineResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'not_connected'; requiredInputs: (keyof BirthDetails)[] }

export interface CalculationEngine {
  computeKundli: (input: BirthDetails) => Promise<EngineResult<unknown>>
  computeDasha: (input: BirthDetails) => Promise<EngineResult<unknown>>
  computeTransit: (input: BirthDetails) => Promise<EngineResult<unknown>>
  computePanchang: (input: { date: string; place: string }) => Promise<EngineResult<unknown>>
  computeDosha: (input: BirthDetails) => Promise<EngineResult<unknown>>
  computeMatch: (a: BirthDetails, b: BirthDetails) => Promise<EngineResult<unknown>>
}

const notConnectedEngine: CalculationEngine = {
  computeKundli: async () => ({ status: 'not_connected', requiredInputs: ['date', 'time', 'place'] }),
  computeDasha: async () => ({ status: 'not_connected', requiredInputs: ['date', 'time', 'place'] }),
  computeTransit: async () => ({ status: 'not_connected', requiredInputs: ['date', 'time', 'place'] }),
  computePanchang: async () => ({ status: 'not_connected', requiredInputs: ['date', 'place'] }),
  computeDosha: async () => ({ status: 'not_connected', requiredInputs: ['date', 'time', 'place'] }),
  computeMatch: async () => ({ status: 'not_connected', requiredInputs: ['date', 'time', 'place'] }),
}

export const calculationEngine: CalculationEngine = notConnectedEngine
