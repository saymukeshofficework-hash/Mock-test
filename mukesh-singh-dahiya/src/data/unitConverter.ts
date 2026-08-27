export interface UnitCategory {
  key: string
  label: string
  units: { key: string; label: string; toBase: number; offset?: number }[]
}

// toBase converts 1 unit to the category's base unit. Temperature uses offset (handled specially).
export const unitCategories: UnitCategory[] = [
  {
    key: 'length',
    label: 'Length',
    units: [
      { key: 'mm', label: 'Millimetre (mm)', toBase: 0.001 },
      { key: 'cm', label: 'Centimetre (cm)', toBase: 0.01 },
      { key: 'm', label: 'Metre (m)', toBase: 1 },
      { key: 'km', label: 'Kilometre (km)', toBase: 1000 },
      { key: 'in', label: 'Inch (in)', toBase: 0.0254 },
      { key: 'ft', label: 'Foot (ft)', toBase: 0.3048 },
    ],
  },
  {
    key: 'mass',
    label: 'Mass',
    units: [
      { key: 'mg', label: 'Milligram (mg)', toBase: 0.001 },
      { key: 'g', label: 'Gram (g)', toBase: 1 },
      { key: 'kg', label: 'Kilogram (kg)', toBase: 1000 },
      { key: 'lb', label: 'Pound (lb)', toBase: 453.592 },
    ],
  },
  {
    key: 'time',
    label: 'Time',
    units: [
      { key: 's', label: 'Second (s)', toBase: 1 },
      { key: 'min', label: 'Minute (min)', toBase: 60 },
      { key: 'hr', label: 'Hour (hr)', toBase: 3600 },
      { key: 'day', label: 'Day', toBase: 86400 },
    ],
  },
  {
    key: 'area',
    label: 'Area',
    units: [
      { key: 'm2', label: 'Square metre (m²)', toBase: 1 },
      { key: 'km2', label: 'Square kilometre (km²)', toBase: 1_000_000 },
      { key: 'hectare', label: 'Hectare', toBase: 10_000 },
      { key: 'acre', label: 'Acre', toBase: 4046.86 },
    ],
  },
  {
    key: 'volume',
    label: 'Volume',
    units: [
      { key: 'ml', label: 'Millilitre (mL)', toBase: 0.001 },
      { key: 'l', label: 'Litre (L)', toBase: 1 },
      { key: 'm3', label: 'Cubic metre (m³)', toBase: 1000 },
    ],
  },
  {
    key: 'speed',
    label: 'Speed',
    units: [
      { key: 'mps', label: 'Metres/second (m/s)', toBase: 1 },
      { key: 'kmph', label: 'Kilometres/hour (km/h)', toBase: 0.277778 },
      { key: 'mph', label: 'Miles/hour (mph)', toBase: 0.44704 },
    ],
  },
]
