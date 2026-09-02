export interface SpecimenSlide {
  id: string
  name: string
  commonName: string
  stain: string
  cellType: 'plant' | 'animal' | 'microbe' | 'tissue'
  description: string
  keyObservations: string[]
  magnificationNotes: {
    '4x': string
    '10x': string
    '40x': string
    '100x': string
  }
}

export interface OrganelleInfo {
  id: string
  name: string
  cellKind: 'plant' | 'animal' | 'both'
  function: string
  structure: string
  neetFocus: string
  color: string
}

export interface LabQuizQuestion {
  question: string
  options: string[]
  answer: number
  explanation: string
}

export interface LabExperiment {
  id: string
  slug: string
  title: string
  subtitle: string
  badge: string
  icon: string
  category: 'Microscopy' | 'Cytology' | 'Molecular Biology' | 'Plant Physiology' | 'Plant Anatomy'
  classes: string[]
  description: string
  aim: string
  principle: string
  materials: string[]
  procedure: string[]
  observations: string[]
  precautions: string[]
  teacherNotes: string
  quiz: LabQuizQuestion[]
}

export const specimenSlides: SpecimenSlide[] = [
  {
    id: 'onion-peel',
    name: 'Allium cepa Epidermal Peel',
    commonName: 'Onion Peel Cells',
    stain: 'Dilute Iodine Solution / Safranin',
    cellType: 'plant',
    description: 'Classic plant epidermal tissue showing rectangular, compact cells with distinct cell walls and peripheral nuclei.',
    keyObservations: [
      'Hexagonal/rectangular brick-like cells arranged closely with no intercellular spaces.',
      'Prominent outer rigid cell wall and thin inner plasma membrane.',
      'Large central vacuole pushing the cytoplasm and nucleus towards the periphery.',
      'Deeply stained spherical nucleus visible on the side of each cell.',
    ],
    magnificationNotes: {
      '4x': 'Low power field of view showing a honeycomb lattice of plant cell layers.',
      '10x': 'Individual rectangular cell outlines clearly distinguished with faint central vacuole boundaries.',
      '40x': 'High resolution showing distinct double cell walls, granular cytoplasm, and dense nucleolus.',
      '100x': 'Detailed view of the middle lamella, cell junctions, and chromatin threads inside the stained nucleus.',
    },
  },
  {
    id: 'human-cheek',
    name: 'Stratified Squamous Buccal Epithelium',
    commonName: 'Human Cheek Cells',
    stain: '0.5% Methylene Blue Solution',
    cellType: 'animal',
    description: 'Animal epithelial cells scraped gently from the inner lining of the mouth, lacking rigid cell walls.',
    keyObservations: [
      'Irregular polygonal/flat scale-like cells scattered individually or in small clusters.',
      'Absence of cell wall; bordered only by a thin, flexible plasma membrane.',
      'Centrally located, prominent dark-blue stained nucleus.',
      'Dense cytoplasm without large vacuoles or chloroplasts.',
    ],
    magnificationNotes: {
      '4x': 'Clusters of faint translucent polygonal cells scattered across the methylene blue film.',
      '10x': 'Individual cheek cells visible with central circular blue nuclei and delicate cell boundaries.',
      '40x': 'Clear view of granular cytoplasm, folded cell membranes, and nuclear pore envelope.',
      '100x': 'Deep magnification showing nuclear chromatin network and bacterial flora on cell surface.',
    },
  },
  {
    id: 'stomata-peel',
    name: 'Bryophyllum / Tradescantia Leaf Epidermis',
    commonName: 'Leaf Stomata & Guard Cells',
    stain: '1% Safranin Solution',
    cellType: 'plant',
    description: 'Lower epidermis of leaf displaying stomatal apparatus: kidney-shaped guard cells, pore, and subsidiary cells.',
    keyObservations: [
      'Epidermal cells are wavy, irregular, and lack chloroplasts.',
      'Stomatal pore is flanked by two specialized kidney-shaped guard cells.',
      'Guard cells contain green chloroplasts, unlike ordinary epidermal cells.',
      'Inner wall of guard cell facing the pore is thick and inelastic, while outer wall is thin and elastic.',
    ],
    magnificationNotes: {
      '4x': 'Wavy jigsaw puzzle-like epidermal cell boundaries with tiny stomatal dots.',
      '10x': 'Pairs of guard cells clearly identifiable across the epidermal field.',
      '40x': 'Stomatal aperture clearly visible along with chloroplast grains inside both guard cells.',
      '100x': 'Detailed view of differentially thickened guard cell inner wall and microfibril radial micellation.',
    },
  },
  {
    id: 'blood-smear',
    name: 'Human Peripheral Blood Smear',
    commonName: 'Human Blood Cells (RBCs & WBCs)',
    stain: 'Leishman / Giemsa Stain',
    cellType: 'tissue',
    description: 'Mammalian blood connective tissue displaying abundant biconcave erythrocytes, leukocytes, and thrombocytes.',
    keyObservations: [
      'Red Blood Cells (Erythrocytes) are biconcave, circular discs lacking nuclei.',
      'White Blood Cells (Leukocytes) possess multi-lobed purple-stained nuclei (Neutrophils, Lymphocytes, Monocytes).',
      'Platelets (Thrombocytes) appear as tiny purple fragments between cells.',
      'Plasma forms the clear extracellular fluid background.',
    ],
    magnificationNotes: {
      '4x': 'Uniform pinkish-red lawn of microscopic blood cells.',
      '10x': 'Abundant pale-centred RBCs with occasional larger, darkly nucleated WBCs.',
      '40x': 'Distinct biconcave shape of RBCs and multi-lobed nuclei of Neutrophils clearly visible.',
      '100x': 'Oil immersion view showing fine cytoplasmic granules in eosinophils and basophils.',
    },
  },
  {
    id: 'spirogyra',
    name: 'Spirogyra Vegetative Filament',
    commonName: 'Green Algae (Water Silk)',
    stain: 'Light Iodine Stain',
    cellType: 'plant',
    description: 'Filamentous unbranched green alga characterized by ribbon-like spiral chloroplasts with pyrenoids.',
    keyObservations: [
      'Long, unbranched cylindrical filaments divided by transverse septa.',
      'Prominent spiral or ribbon-shaped chloroplast running continuously along the cell.',
      'Circular pyrenoids (starch-storing protein bodies) embedded along the chloroplast ribbon.',
      'Central nucleus suspended by cytoplasmic strands in a large central vacuole.',
    ],
    magnificationNotes: {
      '4x': 'Green tangled threads resembling fine silk.',
      '10x': 'Individual cells within filaments showing helical green bands.',
      '40x': 'Spiral twists of chloroplast, shiny pyrenoids, and cell wall clearly delineated.',
      '100x': 'Detailed view of pyrenoid starch sheaths and cytoplasmic bridges anchoring the nucleus.',
    },
  },
]

export const organelleData: OrganelleInfo[] = [
  {
    id: 'nucleus',
    name: 'Nucleus & Chromatin',
    cellKind: 'both',
    function: 'Directs all cellular metabolic activities and houses the genetic blueprint (DNA).',
    structure: 'Double membrane (nuclear envelope) with nuclear pores, nucleoplasm, nucleolus, and chromatin network.',
    neetFocus: 'Perinuclear space is 10 to 50 nm. Nucleolus is the site of active ribosomal RNA (rRNA) synthesis.',
    color: '#3b82f6',
  },
  {
    id: 'mitochondria',
    name: 'Mitochondrion (Powerhouse)',
    cellKind: 'both',
    function: 'Sites of aerobic cellular respiration, generating cellular energy currency (ATP).',
    structure: 'Sausage-shaped double membrane organelle. Inner membrane is folded into finger-like cristae bearing F0-F1 ATP synthases.',
    neetFocus: 'Contains 70S ribosomes, circular DNA molecule, and divides by binary fission (endosymbiotic origin).',
    color: '#ef4444',
  },
  {
    id: 'chloroplast',
    name: 'Chloroplast (Plastid)',
    cellKind: 'plant',
    function: 'Traps solar radiation to synthesize carbohydrates through photosynthesis.',
    structure: 'Double membrane envelope enclosing stroma matrix, thylakoid discs stacked into grana, and stroma lamellae.',
    neetFocus: 'Light reaction occurs in thylakoid membranes; Dark reaction (Calvin cycle) occurs in the stroma. Has 70S ribosomes.',
    color: '#10b981',
  },
  {
    id: 'vacuole',
    name: 'Central Vacuole',
    cellKind: 'plant',
    function: 'Maintains turgor pressure, stores water, sap, excretory products, and pigments (anthocyanins).',
    structure: 'Occupies up to 90% of the plant cell volume; bounded by a specialized semi-permeable membrane called the Tonoplast.',
    neetFocus: 'Tonoplast actively pumps ions against concentration gradient into vacuole; sap has higher osmotic pressure than cytoplasm.',
    color: '#06b6d4',
  },
  {
    id: 'endoplasmic-reticulum',
    name: 'Endoplasmic Reticulum (ER)',
    cellKind: 'both',
    function: 'Rough ER (with ribosomes) synthesizes proteins; Smooth ER synthesizes lipids, steroidal hormones, and detoxifies drugs.',
    structure: 'Extensive interconnected network of membranous tubules and flattened sacs (cisternae) continuous with nuclear envelope.',
    neetFocus: 'Sarcoplasmic reticulum in muscle cells stores Ca²⁺ ions. Detoxification involves Cytochrome P450 enzymes.',
    color: '#8b5cf6',
  },
  {
    id: 'golgi-apparatus',
    name: 'Golgi Apparatus',
    cellKind: 'both',
    function: 'Packaging, modifying, and sorting proteins and lipids received from ER for secretion or intracellular delivery.',
    structure: 'Series of parallel curved membranous cisternae with a convex forming/cis face and concave maturing/trans face.',
    neetFocus: 'Major site of formation of glycoproteins (glycosylation) and glycolipids. Discovered by Camillo Golgi (1898).',
    color: '#f59e0b',
  },
  {
    id: 'cell-wall',
    name: 'Cell Wall & Middle Lamella',
    cellKind: 'plant',
    function: 'Provides structural rigidity, protection from osmotic bursting, and maintains definite shape.',
    structure: 'Primary wall (cellulose, hemicellulose, pectin) and secondary wall (lignin, suberin). Cemented by Calcium pectate middle lamella.',
    neetFocus: 'Plasmodesmata traverse cell walls, connecting cytoplasm of neighboring cells for symplastic transport.',
    color: '#84cc16',
  },
  {
    id: 'plasma-membrane',
    name: 'Plasma Membrane',
    cellKind: 'both',
    function: 'Selectively permeable barrier regulating entry and exit of ions, nutrients, and waste products.',
    structure: 'Quasi-fluid phospholipid bilayer with embedded integral and peripheral proteins (Fluid Mosaic Model, Singer & Nicolson 1972).',
    neetFocus: 'Lipid bilayer composed of phosphoglycerides with polar hydrophilic heads facing outwards and hydrophobic tails inwards.',
    color: '#14b8a6',
  },
]

export const labExperiments: LabExperiment[] = [
  {
    id: 'microscope',
    slug: 'microscope',
    title: '3D Compound Microscope Simulator',
    subtitle: 'Virtual Ocular Lens & Slide Examination',
    badge: 'Hardware Simulator',
    icon: 'microscope',
    category: 'Microscopy',
    classes: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'NEET'],
    description:
      'Operate an authentic laboratory compound light microscope in 3D. Mount biological slides, adjust coarse/fine focus, switch objective lenses from 4x to 100x oil immersion, and observe cellular micro-architecture.',
    aim: 'To study the parts and optical mechanics of a compound microscope and observe prepared biological slides (Plant, Animal, Blood, and Microbial cells).',
    principle:
      'A compound microscope uses two lens systems: the objective lens produces an inverted, magnified real intermediate image, which is further magnified by the ocular eyepiece lens as a virtual, enlarged final image. Total Magnification = Eyepiece Magnification × Objective Lens Magnification.',
    materials: [
      'Compound Light Microscope with revolving nosepiece',
      'Prepared biological slides (Onion peel, Human cheek cells, Stomata, Blood smear, Spirogyra)',
      'Immersion oil for 100x lens',
      'Substage condenser and iris diaphragm',
      'Lens cleaning tissue paper',
    ],
    procedure: [
      'Place the microscope on a level workbench and switch on the illumination light source.',
      'Rotate the revolving nosepiece to click the lowest power objective (4x or 10x) into optical alignment.',
      'Place the chosen prepared slide onto the mechanical stage and secure it with the stage clips.',
      'Use the coarse adjustment knob to raise the stage until the specimen comes into preliminary focus.',
      'Use the fine adjustment knob to sharpen the focal plane and reveal granular intracellular details.',
      'Adjust the condenser iris diaphragm to optimize light contrast and prevent glare.',
      'Rotate to 40x (High Power) or 100x (Oil Immersion) for deep organelle visualization.',
    ],
    observations: [
      'At 10x: Broad tissue architecture, cellular arrangement, and stained nuclei are discernible.',
      'At 40x: Cell borders, double cell walls in plant cells, nuclear membrane, and stomatal guard cells are distinct.',
      'At 100x: Fine chromatin grains, bacterial rod flora, and cellular micro-junctions are visible.',
    ],
    precautions: [
      'Always start focusing with the lowest power objective first to prevent crushing the cover slip.',
      'Never use the coarse adjustment knob when focusing under 40x or 100x objectives.',
      'Wipe the 100x objective lens with lens paper after using immersion oil to avoid sticky resin buildup.',
    ],
    teacherNotes:
      'Mukesh Sir’s Tip: In board practical exams, examiners frequently ask the difference between resolving power and magnification. Remember: Magnification makes an object appear larger; Resolving power is the ability to distinguish two closely placed points as separate entities!',
    quiz: [
      {
        question: 'If the eyepiece lens is 10x and the high power objective lens is 40x, what is the total magnification?',
        options: ['50x', '400x', '40x', '4000x'],
        answer: 1,
        explanation: 'Total magnification is calculated by multiplying eyepiece power by objective power: 10 × 40 = 400x.',
      },
      {
        question: 'Which stain is specifically used to highlight plant cell walls and starch grains in onion peel experiments?',
        options: ['Methylene Blue', 'Dilute Iodine Solution', 'Acetocarmine', 'Crystal Violet'],
        answer: 1,
        explanation: 'Iodine solution binds with starch and cell walls, staining plant cells in crisp golden-brown tones.',
      },
      {
        question: 'Why must coarse adjustment never be turned vigorously under high power (40x or 100x)?',
        options: [
          'It overheats the microscope light bulb',
          'The objective lens can strike and crack the glass slide and break the front lens element',
          'It alters the eyepiece magnification',
          'It causes the stain to fade',
        ],
        answer: 1,
        explanation: 'The working distance under high power is under 1 mm; coarse focusing risks smashing the expensive front lens into the slide.',
      },
    ],
  },
  {
    id: 'cell',
    slug: 'cell',
    title: '3D Cell Explorer — Plant & Animal Cells',
    subtitle: 'Interactive 360° Organelle Inspector',
    badge: '3D Cytology',
    icon: 'atom',
    category: 'Cytology',
    classes: ['Class 8', 'Class 9', 'Class 11', 'NEET'],
    description:
      'Explore fully textured 3D models of eukaryotic Plant and Animal cells. Orbit 360°, inspect cross-sectional cutaways, and click any organelle (Nucleus, Mitochondria, Chloroplast, Vacuole) to reveal its biochemical architecture.',
    aim: 'To compare the microscopic structural differences between Plant and Animal cells and understand organelle functions.',
    principle:
      'Eukaryotic cells are compartmentalized by intracellular membranes. Plant cells possess a rigid cellulose cell wall, plastids (chloroplasts), and a prominent central vacuole, whereas animal cells lack cell walls and plastids but possess centrioles/centrosomes for spindle formation.',
    materials: [
      'Interactive 3D Plant & Animal Cell Engine',
      'Slice view cutaway tool',
      'Organelle raycaster inspector',
    ],
    procedure: [
      'Select Plant Cell or Animal Cell using the top mode toggle.',
      'Click and drag the 3D model to rotate and observe from all angles.',
      'Use the mouse wheel or pinch gesture to zoom inside the cytoplasm.',
      'Click on any organelle (e.g. Chloroplast, Nucleus, Mitochondrion) to highlight its boundaries and read its structure and NEET points.',
      'Toggle the Cross-Section Cutaway to inspect the internal cisternae of Golgi and mitochondrial cristae.',
    ],
    observations: [
      'Plant cells have a regular polygonal shape due to the outer rigid cell wall.',
      'Animal cells show an irregular spherical contour with peripheral microvilli.',
      'Chloroplasts with stacked thylakoid grana are exclusive to plant cells.',
      'Animal cells contain small scattered vacuoles, whereas the plant cell is dominated by a giant central vacuole.',
    ],
    precautions: [
      'Notice that ribosomes and mitochondria are common to both plant and animal cells.',
      'Do not confuse the cell wall (freely permeable) with the plasma membrane (selectively permeable).',
    ],
    teacherNotes:
      'Mukesh Sir’s Botany Special: Remember that plant cell walls are cemented together by the Middle Lamella, made predominantly of Calcium and Magnesium pectate (the reason unripened fruit is hard and softens upon ripening as pectin dissolves)!',
    quiz: [
      {
        question: 'Which of the following organelles possesses its own circular DNA and 70S ribosomes?',
        options: ['Golgi apparatus', 'Mitochondria & Chloroplast', 'Lysosome', 'Endoplasmic Reticulum'],
        answer: 1,
        explanation: 'Mitochondria and chloroplasts are semi-autonomous organelles originating from primitive endosymbiotic prokaryotes.',
      },
      {
        question: 'The semi-permeable membrane enclosing the large central vacuole of plant cells is named:',
        options: ['Plasma membrane', 'Tonoplast', 'Nuclear envelope', 'Peroxisome'],
        answer: 1,
        explanation: 'The Tonoplast is the single membrane bounding the vacuole, maintaining higher solute concentration inside the vacuolar sap.',
      },
      {
        question: 'Which organelle is absent in typical plant cells but present in animal cells to organize cell division?',
        options: ['Plastids', 'Centrioles (Centrosome)', 'Mitochondria', 'Vacuole'],
        answer: 1,
        explanation: 'Centrioles are absent in higher plant cells, which form anastral mitotic spindles without centrosomes.',
      },
    ],
  },
  {
    id: 'dna',
    slug: 'dna',
    title: '3D DNA Double Helix Explorer',
    subtitle: 'Molecular Base Pairing & Replication Model',
    badge: 'Molecular Biology',
    icon: 'dna',
    category: 'Molecular Biology',
    classes: ['Class 10', 'Class 11', 'Class 12', 'NEET'],
    description:
      'Interact with an exact 3D B-DNA double helix model based on the Watson-Crick structure. Inspect complementary base pairing (A=T, G≡C), major and minor grooves, nucleotide unzipping, and hydrogen bonds.',
    aim: 'To understand the structural geometry of the DNA double helix, Chargaff’s rules, and complementary base pairing.',
    principle:
      'DNA consists of two anti-parallel polynucleotide strands coiled around a central axis into a right-handed double helix. Nitrogenous bases project inward and pair complementarily: Adenine pairs with Thymine via 2 hydrogen bonds (A=T), and Guanine pairs with Cytosine via 3 hydrogen bonds (G≡C).',
    materials: [
      '3D Parametric DNA Double Helix Renderer',
      'Base-pair color code filter',
      'Unwinding replication slider',
    ],
    procedure: [
      'Observe the continuous right-handed helical twist of the sugar-phosphate backbone.',
      'Identify the four color-coded nitrogenous bases: Adenine (Emerald), Thymine (Red), Guanine (Cyan), Cytosine (Amber).',
      'Notice the hydrogen bond indicators: 2 bonds between A & T; 3 bonds between G & C.',
      'Adjust the Rotation Speed and Unwinding sliders to observe how helicase unzips DNA during replication.',
      'Inspect the Major Groove (wide) and Minor Groove (narrow) along the helical cylinder.',
    ],
    observations: [
      'One complete helical turn spans 3.4 nm (34 Å) and contains 10 base pairs.',
      'The distance between adjacent base pairs is 0.34 nm (3.4 Å).',
      'The diameter of the double helix is uniform at 2.0 nm (20 Å) because a purine always pairs with a pyrimidine.',
    ],
    precautions: [
      'Remember that the two strands are anti-parallel: one runs 5′ → 3′ while the partner runs 3′ → 5′.',
      'Do not confuse purines (Adenine, Guanine - double ring) with pyrimidines (Cytosine, Thymine - single ring).',
    ],
    teacherNotes:
      'Mukesh Sir’s NEET Tip: Chargaff’s rule applies only to double-stranded DNA (dsDNA): Purines = Pyrimidines (A + G = T + C). If a virus has A = 20% and T = 30%, it is single-stranded DNA!',
    quiz: [
      {
        question: 'How many hydrogen bonds connect Guanine (G) and Cytosine (C) in DNA?',
        options: ['1', '2', '3', '4'],
        answer: 2,
        explanation: 'Guanine and Cytosine form three hydrogen bonds, making GC-rich DNA regions more thermally stable than AT-rich regions.',
      },
      {
        question: 'According to Watson and Crick’s B-DNA model, the pitch of one complete turn of the helix is:',
        options: ['2.0 nm', '3.4 nm', '0.34 nm', '20 nm'],
        answer: 1,
        explanation: 'One complete helical pitch is 3.4 nm (34 Å), holding roughly 10 base pairs per turn.',
      },
      {
        question: 'If a double-stranded DNA molecule contains 30% Adenine, what is the percentage of Cytosine?',
        options: ['30%', '20%', '40%', '70%'],
        answer: 1,
        explanation: 'By Chargaff’s rule: A = T = 30% (Total AT = 60%). Remaining 40% is GC, so G = 20% and C = 20%.',
      },
    ],
  },
  {
    id: 'stomata',
    slug: 'stomata',
    title: '3D Stomata & Photosynthesis Lab',
    subtitle: 'Turgor Pressure & Gas Exchange Simulator',
    badge: 'Plant Physiology',
    icon: 'leaf',
    category: 'Plant Physiology',
    classes: ['Class 7', 'Class 10', 'Class 11', 'NEET'],
    description:
      'Simulate the opening and closing mechanism of stomatal guard cells in real-time 3D. Control light intensity, water availability, and CO₂ levels to observe guard cell turgidity and measure the oxygen bubbling rate.',
    aim: 'To demonstrate the osmotic mechanism of stomatal aperture movement and observe the rate of transpiration and photosynthesis.',
    principle:
      'Stomata open when guard cells absorb water by endosmosis, become turgid, and bow outward due to their differentially thickened inner walls and radial cellulose microfibrils. Stomata close when guard cells lose water by exosmosis and become flaccid.',
    materials: [
      'Interactive 3D Stomatal Guard Cell Simulator',
      'Environmental condition sliders (Light, Water, CO₂)',
      'Real-time Oxygen Bubble Gas Rate Counter',
    ],
    procedure: [
      'Increase the Light Intensity slider from 0% (night) to 100% (bright sunlight).',
      'Observe K⁺ ion influx into guard cells causing water endosmosis.',
      'Watch the thin outer walls bulge outward, pulling the thick inner walls apart and widening the stomatal pore.',
      'Decrease the Water Availability slider to induce water stress; observe Abscisic acid (ABA) release closing the pore.',
      'Monitor the live Transpiration Rate and Photosynthetic Oxygen Bubble production graph.',
    ],
    observations: [
      'In high light and adequate water, guard cells swell, opening the pore wide for CO₂ uptake and transpiration.',
      'In darkness or severe drought, guard cells lose turgor, their inner walls straighten, and the pore closes completely.',
    ],
    precautions: [
      'Notice that guard cells are the only epidermal cells containing chloroplasts.',
      'Remember that monocots (grasses) have dumbbell-shaped guard cells, whereas dicots have kidney-shaped guard cells.',
    ],
    teacherNotes:
      'Mukesh Sir’s Botany Insight: Levitt’s Active K⁺ Transport Theory explains stomatal movement. In daylight, proton pumps expel H⁺ out of guard cells and import K⁺ ions, lowering water potential and driving osmotic water influx!',
    quiz: [
      {
        question: 'Which plant hormone causes rapid closure of stomata during drought and water stress conditions?',
        options: ['Auxin', 'Gibberellin', 'Abscisic Acid (ABA)', 'Cytokinin'],
        answer: 2,
        explanation: 'Abscisic Acid (ABA) is known as the stress hormone; it triggers rapid K⁺ efflux from guard cells causing flaccidity and stomatal closure.',
      },
      {
        question: 'Dicot plants possess guard cells that are shaped like:',
        options: ['Dumbbells', 'Kidney / Bean', 'Spheres', 'Triangles'],
        answer: 1,
        explanation: 'Dicot guard cells are kidney/bean-shaped, while monocots like grasses have dumbbell-shaped guard cells.',
      },
    ],
  },
  {
    id: 'flower',
    slug: 'flower',
    title: '3D Flower Anatomy & Dissection Lab',
    subtitle: 'Floral Whorl Peeling & Reproductive Organs',
    badge: 'Plant Anatomy',
    icon: 'sparkles',
    category: 'Plant Anatomy',
    classes: ['Class 6', 'Class 7', 'Class 10', 'Class 12', 'NEET'],
    description:
      'Perform virtual step-by-step floral dissection on a typical complete bisexual flower. Peel each whorl: Calyx (sepals), Corolla (petals), Androecium (stamens with anther/filament), and Gynoecium (pistil with ovary/ovules).',
    aim: 'To dissect and identify the essential and non-essential floral whorls of an angiosperm flower.',
    principle:
      'A complete flower consists of four concentric whorls mounted on a thalamus (receptacle): Calyx (outer protective sepals), Corolla (attractive petals), Androecium (male stamens producing pollen), and Gynoecium (female carpel/pistil housing ovules).',
    materials: [
      '3D Bisexual Flower Anatomical Model',
      'Virtual dissection peeling slider (Step 1 to Step 4)',
      'Cross-section ovary viewer',
    ],
    procedure: [
      'Examine the intact flower on the thalamus receptacle.',
      'Execute Step 1 (Dissect Calyx): Remove green sepals to expose the colorful corolla.',
      'Execute Step 2 (Dissect Corolla): Peel the petals to expose the reproductive organs inside.',
      'Execute Step 3 (Dissect Androecium): Remove stamens to observe anther bilobed theca and filament.',
      'Execute Step 4 (Inspect Gynoecium): Observe the stigma, style, and make a longitudinal slice through the ovary to view ovules attached to the placenta.',
    ],
    observations: [
      'Calyx and Corolla are non-essential/accessory whorls.',
      'Androecium and Gynoecium are essential/reproductive whorls.',
      'Anther contains microsporangia (pollen sacs) filled with powdery pollen grains.',
      'Ovary contains one or more ovules attached to the ovarian wall via the placenta.',
    ],
    precautions: [
      'Differentiate between unisexual flowers (e.g. papaya, cucumber) and bisexual flowers (e.g. hibiscus, mustard).',
      'After fertilization, the ovary matures into a fruit and the ovules develop into seeds.',
    ],
    teacherNotes:
      'Mukesh Sir’s Botany Tip: A typical angiosperm anther is bilobed and dithecous (two thecae per lobe), meaning it is tetrasporangiate (four pollen sacs in cross-section)!',
    quiz: [
      {
        question: 'Which floral whorls are considered essential for reproduction in plants?',
        options: [
          'Calyx & Corolla',
          'Androecium & Gynoecium',
          'Sepals & Petals',
          'Thalamus & Pedicel',
        ],
        answer: 1,
        explanation: 'Androecium (male stamens) and Gynoecium (female carpel) are essential because they produce the gametes and seeds.',
      },
      {
        question: 'After successful double fertilization in angiosperms, the ovary develops into the:',
        options: ['Seed', 'Fruit', 'Endosperm', 'Perisperm'],
        answer: 1,
        explanation: 'The ripened ovary becomes the fruit, while the fertilized ovules develop into seeds.',
      },
    ],
  },
]

export function getAllLabExperiments(): LabExperiment[] {
  return labExperiments
}

export function getLabExperiment(slug: string): LabExperiment | undefined {
  return labExperiments.find((e) => e.slug === slug || e.id === slug)
}

export function getSpecimenSlide(id: string): SpecimenSlide | undefined {
  return specimenSlides.find((s) => s.id === id)
}
