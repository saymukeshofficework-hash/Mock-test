import type { CalculatorConfig } from './types'

const f = (n: number, digits = 4) => Math.round(n * 10 ** digits) / 10 ** digits

export const calculators: CalculatorConfig[] = [
  // ── Mathematics ─────────────────────────────────────────
  {
    slug: 'percentage',
    title: 'Percentage Calculator',
    category: 'Mathematics',
    description: 'Find what percentage one value is of another.',
    formula: 'Percentage = (Value / Total) × 100',
    fields: [{ key: 'value', label: 'Value' }, { key: 'total', label: 'Total' }],
    compute: ({ value, total }) => ({ 'Percentage (%)': f((value / total) * 100) }),
  },
  {
    slug: 'average',
    title: 'Average Calculator',
    category: 'Mathematics',
    description: 'Calculate the average of two numbers (add more terms as needed).',
    formula: 'Average = Sum of values / Count',
    fields: [{ key: 'a', label: 'Value 1' }, { key: 'b', label: 'Value 2' }, { key: 'c', label: 'Value 3 (optional, 0 to skip)' }],
    compute: ({ a, b, c }) => {
      const vals = [a, b, c].filter((v) => !Number.isNaN(v))
      const nonZero = c === 0 ? [a, b] : vals
      return { Average: f(nonZero.reduce((s, v) => s + v, 0) / nonZero.length) }
    },
  },
  {
    slug: 'ratio',
    title: 'Ratio Simplifier',
    category: 'Mathematics',
    description: 'Simplify a ratio of two numbers to its lowest terms.',
    formula: 'Simplified Ratio = A/HCF(A,B) : B/HCF(A,B)',
    fields: [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }],
    compute: ({ a, b }) => {
      const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y))
      const h = gcd(Math.round(a), Math.round(b)) || 1
      return { 'Simplified Ratio (A)': a / h, 'Simplified Ratio (B)': b / h }
    },
  },
  {
    slug: 'profit-loss',
    title: 'Profit & Loss Calculator',
    category: 'Mathematics',
    description: 'Calculate profit/loss and profit/loss percentage.',
    formula: 'Profit % = ((Selling Price − Cost Price) / Cost Price) × 100',
    fields: [{ key: 'cost', label: 'Cost Price' }, { key: 'selling', label: 'Selling Price' }],
    compute: ({ cost, selling }) => {
      const diff = selling - cost
      return {
        [diff >= 0 ? 'Profit' : 'Loss']: f(Math.abs(diff)),
        [diff >= 0 ? 'Profit %' : 'Loss %']: f((Math.abs(diff) / cost) * 100),
      }
    },
  },
  {
    slug: 'simple-interest',
    title: 'Simple Interest Calculator',
    category: 'Mathematics',
    description: 'Calculate simple interest and total amount.',
    formula: 'SI = (P × R × T) / 100',
    fields: [{ key: 'principal', label: 'Principal', unit: '₹' }, { key: 'rate', label: 'Rate', unit: '% p.a.' }, { key: 'time', label: 'Time', unit: 'years' }],
    compute: ({ principal, rate, time }) => {
      const si = (principal * rate * time) / 100
      return { 'Simple Interest': f(si, 2), 'Total Amount': f(principal + si, 2) }
    },
  },
  {
    slug: 'compound-interest',
    title: 'Compound Interest Calculator',
    category: 'Mathematics',
    description: 'Calculate compound interest, compounded annually.',
    formula: 'A = P × (1 + R/100)^T',
    fields: [{ key: 'principal', label: 'Principal', unit: '₹' }, { key: 'rate', label: 'Rate', unit: '% p.a.' }, { key: 'time', label: 'Time', unit: 'years' }],
    compute: ({ principal, rate, time }) => {
      const amount = principal * (1 + rate / 100) ** time
      return { 'Total Amount': f(amount, 2), 'Compound Interest': f(amount - principal, 2) }
    },
  },
  {
    slug: 'discount',
    title: 'Discount Calculator',
    category: 'Mathematics',
    description: 'Calculate the final price after a percentage discount.',
    formula: 'Final Price = MRP × (1 − Discount% / 100)',
    fields: [{ key: 'mrp', label: 'MRP', unit: '₹' }, { key: 'discount', label: 'Discount', unit: '%' }],
    compute: ({ mrp, discount }) => ({ 'Final Price': f(mrp * (1 - discount / 100), 2), 'Amount Saved': f(mrp * (discount / 100), 2) }),
  },
  {
    slug: 'speed-distance-time',
    title: 'Speed, Distance & Time Calculator',
    category: 'Mathematics',
    description: 'Find speed given distance and time.',
    formula: 'Speed = Distance / Time',
    fields: [{ key: 'distance', label: 'Distance', unit: 'km' }, { key: 'time', label: 'Time', unit: 'hours' }],
    compute: ({ distance, time }) => ({ 'Speed (km/h)': f(distance / time) }),
  },
  {
    slug: 'hcf',
    title: 'HCF Calculator',
    category: 'Mathematics',
    description: 'Find the Highest Common Factor of two numbers.',
    formula: 'HCF(A, B) via Euclidean algorithm',
    fields: [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }],
    compute: ({ a, b }) => {
      const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y))
      return { HCF: gcd(Math.abs(Math.round(a)), Math.abs(Math.round(b))) }
    },
  },
  {
    slug: 'lcm',
    title: 'LCM Calculator',
    category: 'Mathematics',
    description: 'Find the Lowest Common Multiple of two numbers.',
    formula: 'LCM(A, B) = (A × B) / HCF(A, B)',
    fields: [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }],
    compute: ({ a, b }) => {
      const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y))
      const h = gcd(Math.abs(Math.round(a)), Math.abs(Math.round(b))) || 1
      return { LCM: Math.abs(Math.round(a) * Math.round(b)) / h }
    },
  },
  {
    slug: 'rectangle-area-perimeter',
    title: 'Rectangle Area & Perimeter Calculator',
    category: 'Mathematics',
    description: 'Calculate area and perimeter of a rectangle.',
    formula: 'Area = L × W, Perimeter = 2 × (L + W)',
    fields: [{ key: 'length', label: 'Length' }, { key: 'width', label: 'Width' }],
    compute: ({ length, width }) => ({ Area: f(length * width), Perimeter: f(2 * (length + width)) }),
  },
  {
    slug: 'cuboid-volume',
    title: 'Cuboid Volume Calculator',
    category: 'Mathematics',
    description: 'Calculate the volume of a cuboid.',
    formula: 'Volume = L × W × H',
    fields: [{ key: 'length', label: 'Length' }, { key: 'width', label: 'Width' }, { key: 'height', label: 'Height' }],
    compute: ({ length, width, height }) => ({ Volume: f(length * width * height) }),
  },
  // ── Physics ─────────────────────────────────────────────
  {
    slug: 'speed-physics',
    title: 'Speed Calculator',
    category: 'Physics',
    description: 'Calculate speed from distance and time.',
    formula: 'Speed = Distance / Time',
    fields: [{ key: 'distance', label: 'Distance', unit: 'm' }, { key: 'time', label: 'Time', unit: 's' }],
    compute: ({ distance, time }) => ({ 'Speed (m/s)': f(distance / time) }),
  },
  {
    slug: 'force',
    title: 'Force Calculator (F = ma)',
    category: 'Physics',
    description: 'Calculate force from mass and acceleration.',
    formula: 'F = m × a',
    fields: [{ key: 'mass', label: 'Mass', unit: 'kg' }, { key: 'acceleration', label: 'Acceleration', unit: 'm/s²' }],
    compute: ({ mass, acceleration }) => ({ 'Force (N)': f(mass * acceleration) }),
  },
  {
    slug: 'work',
    title: 'Work Done Calculator',
    category: 'Physics',
    description: 'Calculate work done by a force over a distance.',
    formula: 'W = F × d',
    fields: [{ key: 'force', label: 'Force', unit: 'N' }, { key: 'distance', label: 'Distance', unit: 'm' }],
    compute: ({ force, distance }) => ({ 'Work (J)': f(force * distance) }),
  },
  {
    slug: 'power',
    title: 'Power Calculator',
    category: 'Physics',
    description: 'Calculate power from work done and time taken.',
    formula: 'P = W / t',
    fields: [{ key: 'work', label: 'Work', unit: 'J' }, { key: 'time', label: 'Time', unit: 's' }],
    compute: ({ work, time }) => ({ 'Power (W)': f(work / time) }),
  },
  {
    slug: 'pressure',
    title: 'Pressure Calculator',
    category: 'Physics',
    description: 'Calculate pressure from force and area.',
    formula: 'P = F / A',
    fields: [{ key: 'force', label: 'Force', unit: 'N' }, { key: 'area', label: 'Area', unit: 'm²' }],
    compute: ({ force, area }) => ({ 'Pressure (Pa)': f(force / area) }),
  },
  {
    slug: 'density',
    title: 'Density Calculator',
    category: 'Physics',
    description: 'Calculate density from mass and volume.',
    formula: 'ρ = m / V',
    fields: [{ key: 'mass', label: 'Mass', unit: 'kg' }, { key: 'volume', label: 'Volume', unit: 'm³' }],
    compute: ({ mass, volume }) => ({ 'Density (kg/m³)': f(mass / volume) }),
  },
  {
    slug: 'ohms-law',
    title: "Ohm's Law Calculator",
    category: 'Physics',
    description: 'Calculate voltage from current and resistance.',
    formula: 'V = I × R',
    fields: [{ key: 'current', label: 'Current', unit: 'A' }, { key: 'resistance', label: 'Resistance', unit: 'Ω' }],
    compute: ({ current, resistance }) => ({ 'Voltage (V)': f(current * resistance) }),
  },
  {
    slug: 'electrical-power',
    title: 'Electrical Power Calculator',
    category: 'Physics',
    description: 'Calculate electrical power from voltage and current.',
    formula: 'P = V × I',
    fields: [{ key: 'voltage', label: 'Voltage', unit: 'V' }, { key: 'current', label: 'Current', unit: 'A' }],
    compute: ({ voltage, current }) => ({ 'Power (W)': f(voltage * current) }),
  },
  {
    slug: 'kinetic-energy',
    title: 'Kinetic Energy Calculator',
    category: 'Physics',
    description: 'Calculate kinetic energy from mass and velocity.',
    formula: 'KE = ½ × m × v²',
    fields: [{ key: 'mass', label: 'Mass', unit: 'kg' }, { key: 'velocity', label: 'Velocity', unit: 'm/s' }],
    compute: ({ mass, velocity }) => ({ 'Kinetic Energy (J)': f(0.5 * mass * velocity ** 2) }),
  },
  {
    slug: 'potential-energy',
    title: 'Potential Energy Calculator',
    category: 'Physics',
    description: 'Calculate gravitational potential energy.',
    formula: 'PE = m × g × h  (g = 9.8 m/s²)',
    fields: [{ key: 'mass', label: 'Mass', unit: 'kg' }, { key: 'height', label: 'Height', unit: 'm' }],
    compute: ({ mass, height }) => ({ 'Potential Energy (J)': f(mass * 9.8 * height) }),
  },
  // ── Chemistry ───────────────────────────────────────────
  {
    slug: 'molar-mass-to-moles',
    title: 'Moles Calculator',
    category: 'Chemistry',
    description: 'Calculate the number of moles from mass and molar mass.',
    formula: 'n = mass / molar mass',
    fields: [{ key: 'mass', label: 'Mass', unit: 'g' }, { key: 'molarMass', label: 'Molar Mass', unit: 'g/mol' }],
    compute: ({ mass, molarMass }) => ({ Moles: f(mass / molarMass) }),
  },
  {
    slug: 'molarity',
    title: 'Molarity Calculator',
    category: 'Chemistry',
    description: 'Calculate molarity from moles of solute and volume of solution.',
    formula: 'M = n / V (litres)',
    fields: [{ key: 'moles', label: 'Moles of Solute' }, { key: 'volume', label: 'Volume', unit: 'L' }],
    compute: ({ moles, volume }) => ({ 'Molarity (mol/L)': f(moles / volume) }),
  },
  {
    slug: 'dilution',
    title: 'Dilution Calculator (M1V1 = M2V2)',
    category: 'Chemistry',
    description: 'Find the final volume needed for a target molarity.',
    formula: 'V2 = (M1 × V1) / M2',
    fields: [{ key: 'm1', label: 'Initial Molarity' }, { key: 'v1', label: 'Initial Volume', unit: 'L' }, { key: 'm2', label: 'Final Molarity' }],
    compute: ({ m1, v1, m2 }) => ({ 'Final Volume (L)': f((m1 * v1) / m2) }),
  },
  {
    slug: 'percentage-concentration',
    title: 'Percentage Concentration Calculator',
    category: 'Chemistry',
    description: 'Calculate mass percentage of solute in a solution.',
    formula: 'Mass % = (Mass of Solute / Mass of Solution) × 100',
    fields: [{ key: 'soluteMass', label: 'Mass of Solute', unit: 'g' }, { key: 'solutionMass', label: 'Mass of Solution', unit: 'g' }],
    compute: ({ soluteMass, solutionMass }) => ({ 'Concentration (%)': f((soluteMass / solutionMass) * 100) }),
  },
  // ── Biology / NEET ──────────────────────────────────────
  {
    slug: 'bmi',
    title: 'BMI Calculator',
    category: 'Biology / NEET',
    description: 'Calculate Body Mass Index — a standard educational health metric used in Human Physiology topics.',
    formula: 'BMI = Weight (kg) / Height (m)²',
    fields: [{ key: 'weight', label: 'Weight', unit: 'kg' }, { key: 'height', label: 'Height', unit: 'm' }],
    compute: ({ weight, height }) => ({ BMI: f(weight / height ** 2, 2) }),
  },
  {
    slug: 'punnett-ratio',
    title: 'Monohybrid Cross Ratio Helper',
    category: 'Biology / NEET',
    description: 'Estimate phenotype counts from a standard 3:1 monohybrid F2 ratio for a given sample size.',
    formula: 'Dominant : Recessive = 3 : 1',
    fields: [{ key: 'total', label: 'Total Offspring' }],
    compute: ({ total }) => ({ 'Dominant Phenotype (≈)': Math.round((total * 3) / 4), 'Recessive Phenotype (≈)': Math.round(total / 4) }),
  },
]

export function getCalculator(slug: string) {
  return calculators.find((c) => c.slug === slug)
}

export const calculatorCategories = ['Mathematics', 'Physics', 'Chemistry', 'Biology / NEET'] as const
