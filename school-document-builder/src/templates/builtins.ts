import type { SchoolDocument, TableData, TableRow } from '../types/document'
import { uid } from '../utils/id'
import {
  newBlankDocument,
  newCell,
  newDate,
  newHeading,
  newKeyValue,
  newLine,
  newList,
  newParagraph,
  newSignature,
  newTableElement,
} from '../utils/factory'

export interface BuiltinTemplate {
  id: string
  name: string
  description: string
  docType: string
  build: () => SchoolDocument
}

function row(cells: string[], opts: { header?: boolean; total?: boolean } = {}): TableRow {
  return {
    id: uid('row'),
    isHeader: !!opts.header,
    isTotalRow: !!opts.total,
    cells: cells.map((text) => newCell(text, !!opts.header)),
  }
}

function simpleTable(header: string[], dataRows: string[][], opts: { totalRow?: string[] } = {}): TableData {
  const cols = header.length
  const rows: TableRow[] = [row(header, { header: true }), ...dataRows.map((r) => row(r))]
  if (opts.totalRow) rows.push(row(opts.totalRow, { total: true }))
  return {
    columns: Array.from({ length: cols }, () => ({ id: uid('col'), widthPct: 100 / cols })),
    rows,
    borders: 'all',
    autoSerial: false,
  }
}

/** Complex two-level merged header table: कक्षा-वार जातिवार (SC/ST/OBC/OC) बालक/बालिका विवरण */
function casteWiseTable(): TableData {
  const catCols = ['SC', 'ST', 'OBC', 'OC', 'कुल']
  const header0: string[] = ['क्रमांक', 'कक्षा', 'बालक', '', '', '', '', 'बालिका', '', '', '', '', 'योग']
  const header1: string[] = ['', '', ...catCols, ...catCols, '']
  const cols = header0.length

  const r0 = row(header0, { header: true })
  r0.cells[0].rowspan = 2
  r0.cells[1].rowspan = 2
  r0.cells[2].colspan = 5
  for (let i = 3; i <= 6; i++) r0.cells[i].merged = true
  r0.cells[7].colspan = 5
  for (let i = 8; i <= 11; i++) r0.cells[i].merged = true
  r0.cells[12].rowspan = 2

  const r1 = row(header1, { header: true })
  r1.cells[0].merged = true
  r1.cells[1].merged = true
  r1.cells[12].merged = true

  const classes = ['1', '2', '3', '4', '5']
  const dataRows = classes.map((cls, idx) =>
    row([String(idx + 1), `कक्षा ${cls}`, '', '', '', '', '', '', '', '', '', '', '']),
  )

  const totalRow = row(['', 'योग', '', '', '', '', '', '', '', '', '', '', ''], { total: true })

  return {
    columns: Array.from({ length: cols }, () => ({ id: uid('col'), widthPct: 100 / cols })),
    rows: [r0, r1, ...dataRows, totalRow],
    borders: 'all',
    autoSerial: false,
  }
}

/**
 * Complex multi-level merged header table matching the school's physical माहवार जातिवार
 * (month-wise, caste-wise) register — कक्षावार दर्ज संख्या, SC/ST/OBC/GEN, उपस्थिति,
 * दाखिल-खारिज-शेष एवं बैगा जाति, हर समूह में बालक(B)/बालिका(G)/योग(T) उप-स्तंभ सहित।
 */
function monthwiseCasteTable(): TableData {
  const groups: { label: string; sub: string[] }[] = [
    { label: 'क्र.', sub: [] },
    { label: 'कक्षा', sub: [] },
    { label: 'दर्ज छात्र संख्या', sub: ['B', 'G', 'T'] },
    { label: 'SC', sub: ['B', 'G'] },
    { label: 'ST', sub: ['B', 'G'] },
    { label: 'OBC', sub: ['B', 'G'] },
    { label: 'GEN', sub: ['B', 'G'] },
    { label: 'कुल उपस्थित', sub: ['B', 'G', 'T'] },
    { label: 'औसत उपस्थित', sub: ['B', 'G', 'T'] },
    { label: 'दाखिल', sub: ['B', 'G', 'T'] },
    { label: 'खारिज', sub: ['B', 'G', 'T'] },
    { label: 'शेष', sub: ['B', 'G', 'T'] },
    { label: 'बैगा जाति', sub: ['B', 'G', 'T'] },
    { label: 'कार्य दिवस', sub: [] },
    { label: 'अन्य', sub: [] },
  ]

  const header0: string[] = []
  const header1: string[] = []
  groups.forEach((g) => {
    if (g.sub.length === 0) {
      header0.push(g.label)
      header1.push('')
    } else {
      header0.push(g.label, ...Array(g.sub.length - 1).fill(''))
      header1.push(...g.sub)
    }
  })
  const cols = header0.length

  const r0 = row(header0, { header: true })
  const r1 = row(header1, { header: true })
  let ci = 0
  groups.forEach((g) => {
    if (g.sub.length === 0) {
      r0.cells[ci].rowspan = 2
      r1.cells[ci].merged = true
      ci += 1
    } else {
      r0.cells[ci].colspan = g.sub.length
      for (let k = 1; k < g.sub.length; k++) r0.cells[ci + k].merged = true
      ci += g.sub.length
    }
  })

  const classRows: { label: string; total?: boolean }[] = [
    { label: 'पहली' },
    { label: 'दूसरी' },
    { label: 'तीसरी' },
    { label: 'चौथी' },
    { label: 'पांचवीं' },
    { label: 'योग प्राथ.', total: true },
    { label: 'छठवीं' },
    { label: 'सातवीं' },
    { label: 'आठवीं' },
    { label: 'योग माध्य.', total: true },
    { label: 'महायोग', total: true },
    { label: 'प्रा.+मा.', total: true },
  ]
  let serial = 0
  const dataRows = classRows.map(({ label, total }) => {
    const cells = Array.from({ length: cols }, () => '')
    cells[1] = label
    if (!total) {
      serial += 1
      cells[0] = String(serial)
    }
    return row(cells, { total: !!total })
  })

  return {
    columns: Array.from({ length: cols }, () => ({ id: uid('col'), widthPct: 100 / cols })),
    rows: [r0, r1, ...dataRows],
    borders: 'all',
    autoSerial: false,
  }
}

function studentCountTable(): TableData {
  const header = ['कक्षा', 'बालक', 'बालिका', 'कुल']
  const classes = ['1', '2', '3', '4', '5']
  const rows: TableRow[] = [row(header, { header: true })]
  classes.forEach((cls, idx) => {
    const r = row([`कक्षा ${cls}`, '', '', ''])
    r.cells[3].formula = `=B${idx + 2}+C${idx + 2}`
    rows.push(r)
  })
  rows.push(row(['योग', '', '', ''], { total: true }))
  return {
    columns: header.map(() => ({ id: uid('col'), widthPct: 25 })),
    rows,
    borders: 'all',
    autoSerial: false,
  }
}

function base(name: string, docType: string): SchoolDocument {
  return newBlankDocument(name, docType)
}

const templates: BuiltinTemplate[] = [
  {
    id: 'general-notice',
    name: 'सामान्य सूचना',
    description: 'सामान्य विद्यालयीन सूचना हेतु प्रपत्र',
    docType: 'general-notice',
    build: () => {
      const d = base('सामान्य सूचना', 'general-notice')
      d.elements = [
        newHeading('सूचना', 1),
        { ...newKeyValue('क्रमांक', '{{document_no}}'), align: 'left' },
        { ...newDate() },
        newLine(),
        newParagraph('निम्नलिखित सूचना समस्त संबंधितों की जानकारी एवं आवश्यक कार्यवाही हेतु प्रकाशित की जाती है।'),
        newLine(),
        newSignature(),
      ]
      return d
    },
  },
  {
    id: 'office-letter',
    name: 'कार्यालयीन पत्र',
    description: 'औपचारिक कार्यालयीन पत्राचार हेतु प्रारूप',
    docType: 'office-letter',
    build: () => {
      const d = base('कार्यालयीन पत्र', 'office-letter')
      d.elements = [
        newKeyValue('क्रमांक', '{{document_no}}'),
        newDate(),
        newParagraph('सेवा में,<br/>श्रीमान् ...........................<br/>............................................'),
        { ...newParagraph('विषय: '), align: 'left' },
        newParagraph('महोदय,<br/><br/>निवेदन है कि ...........................................................................................................'),
        newSignature(),
      ]
      return d
    },
  },
  {
    id: 'meeting-minutes',
    name: 'बैठक कार्यवाही',
    description: 'विद्यालय प्रबंधन समिति/स्टाफ बैठक कार्यवाही विवरण',
    docType: 'meeting-minutes',
    build: () => {
      const d = base('बैठक कार्यवाही', 'meeting-minutes')
      d.elements = [
        newHeading('बैठक कार्यवाही विवरण', 1),
        newDate(),
        newKeyValue('स्थान', '{{place}}'),
        newParagraph('उपस्थित सदस्यों की सूची:'),
        { ...newTableElement(4, 4), table: simpleTable(['क्र.', 'नाम', 'पद', 'हस्ताक्षर'], [
          ['1', '', '', ''],
          ['2', '', '', ''],
          ['3', '', '', ''],
        ]) },
        newParagraph('चर्चा के बिंदु एवं निर्णय:'),
        newList(true),
        newSignature(),
      ]
      return d
    },
  },
  {
    id: 'student-details',
    name: 'छात्र/छात्रा विवरण',
    description: 'छात्र-छात्राओं की व्यक्तिगत जानकारी की सूची',
    docType: 'student-details',
    build: () => {
      const d = base('छात्र/छात्रा विवरण', 'student-details')
      const el = newTableElement(6, 5)
      el.table = simpleTable(
        ['नाम', 'पिता/माता का नाम', 'जन्म तिथि', 'कक्षा', 'मोबाइल नं.'],
        [ ['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', ''], ['', '', '', '', ''] ],
      )
      el.table.autoSerial = true
      d.elements = [newHeading('छात्र/छात्रा विवरण', 1), el]
      return d
    },
  },
  {
    id: 'admission-details',
    name: 'नामांकन विवरण',
    description: 'नवीन प्रवेश/नामांकन का विवरण',
    docType: 'admission-details',
    build: () => {
      const d = base('नामांकन विवरण', 'admission-details')
      const el = newTableElement(5, 4)
      el.table = simpleTable(['विद्यार्थी का नाम', 'कक्षा', 'प्रवेश दिनांक', 'जन्म प्रमाण पत्र क्र.'], [
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
      ])
      el.table.autoSerial = true
      d.elements = [newHeading('नामांकन विवरण', 1), el]
      return d
    },
  },
  {
    id: 'attendance-details',
    name: 'उपस्थिति विवरण',
    description: 'कक्षावार दैनिक/मासिक उपस्थिति विवरण',
    docType: 'attendance-details',
    build: () => {
      const d = base('उपस्थिति विवरण', 'attendance-details')
      const el = newTableElement(1, 1)
      el.table = simpleTable(
        ['कक्षा', 'दर्ज संख्या', 'उपस्थित', 'अनुपस्थित'],
        ['1', '2', '3', '4', '5'].map((c) => [`कक्षा ${c}`, '', '', '']),
        { totalRow: ['योग', '', '', ''] },
      )
      d.elements = [newHeading('उपस्थिति विवरण', 1), newDate(), el]
      return d
    },
  },
  {
    id: 'caste-wise-count',
    name: 'जातिवार छात्र संख्या',
    description: 'कक्षावार SC/ST/OBC/OC बालक-बालिका संख्या (मल्टी-लेवल हेडर)',
    docType: 'caste-wise-count',
    build: () => {
      const d = base('जातिवार विद्यार्थी संख्या', 'caste-wise-count')
      const el = newTableElement(1, 1)
      el.table = casteWiseTable()
      d.elements = [newHeading('जातिवार विद्यार्थी संख्या', 1), el]
      return d
    },
  },
  {
    id: 'monthwise-caste-report',
    name: 'माहवार जातिवार रिपोर्ट',
    description: 'कक्षावार दर्ज, SC/ST/OBC/GEN, उपस्थिति, दाखिल-खारिज-शेष व बैगा जाति की माहवार रिपोर्ट (जन शिक्षा केंद्र हेतु)',
    docType: 'monthwise-caste-report',
    build: () => {
      const d = base('माहवार जातिवार रिपोर्ट', 'monthwise-caste-report')
      d.orientation = 'landscape'
      const el = newTableElement(1, 1)
      el.table = monthwiseCasteTable()
      d.elements = [
        newKeyValue('क्रमांक', ''),
        newDate(),
        newParagraph('प्रति,<br/>श्रीमान् प्रभारी, जन शिक्षा केंद्र ......................,<br/>विषय – माहवार जातिवार माह ...................... 20.........'),
        newKeyValue('शिक्षक संख्या', ''),
        newKeyValue('प्रशिक्षित', ''),
        newKeyValue('अप्रशिक्षित', 'N.I.L.'),
        newKeyValue('अतिथि शिक्षक संख्या', ''),
        newKeyValue('प्राथ.', 'N.I.L.'),
        newKeyValue('मा.', ''),
        el,
        newSignature(),
      ]
      return d
    },
  },
  {
    id: 'pm-poshan-report',
    name: 'PM POSHAN रिपोर्ट',
    description: 'मध्यान्ह भोजन (PM POSHAN) मासिक/दैनिक प्रतिवेदन',
    docType: 'pm-poshan-report',
    build: () => {
      const d = base('PM POSHAN रिपोर्ट', 'pm-poshan-report')
      const el = newTableElement(1, 1)
      el.table = simpleTable(
        ['कक्षा', 'छात्र संख्या', 'उपस्थिति', 'भोजन प्राप्त छात्र', 'चावल/अनाज (किग्रा)', 'सब्जी', 'अन्य सामग्री', 'टिप्पणी'],
        ['1', '2', '3', '4', '5'].map((c) => [`कक्षा ${c}`, '', '', '', '', '', '', '']),
        { totalRow: ['योग', '', '', '', '', '', '', ''] },
      )
      d.elements = [newHeading('PM POSHAN मासिक रिपोर्ट', 1), newDate(), el, newSignature()]
      return d
    },
  },
  {
    id: 'inspection-report',
    name: 'विद्यालय निरीक्षण रिपोर्ट',
    description: 'निरीक्षण अधिकारी द्वारा विद्यालय निरीक्षण प्रतिवेदन',
    docType: 'inspection-report',
    build: () => {
      const d = base('विद्यालय निरीक्षण रिपोर्ट', 'inspection-report')
      const el = newTableElement(1, 1)
      el.table = simpleTable(
        ['अवलोकन बिंदु', 'अवलोकन/टिप्पणी'],
        [
          ['भवन की स्थिति', ''],
          ['स्वच्छता व्यवस्था', ''],
          ['मध्यान्ह भोजन', ''],
          ['शिक्षण कार्य', ''],
          ['अभिलेख संधारण', ''],
        ],
      )
      d.elements = [
        newHeading('विद्यालय निरीक्षण रिपोर्ट', 1),
        newDate(),
        newKeyValue('निरीक्षण अधिकारी', ''),
        el,
        newParagraph('निष्कर्ष / सुझाव:'),
        { ...newSignature(), slots: [
          { id: uid('sig'), name: '', designation: 'निरीक्षण अधिकारी', mobile: '' },
          { id: uid('sig'), name: '', designation: 'प्रधानाध्यापक', mobile: '' },
        ] },
      ]
      return d
    },
  },
  {
    id: 'staff-details',
    name: 'शिक्षक/कर्मचारी विवरण',
    description: 'विद्यालय स्टाफ की सूची, पद एवं संपर्क विवरण',
    docType: 'staff-details',
    build: () => {
      const d = base('शिक्षक/कर्मचारी विवरण', 'staff-details')
      const el = newTableElement(1, 1)
      el.table = simpleTable(['नाम', 'पद', 'मोबाइल नं.', 'हस्ताक्षर'], [
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
      ])
      el.table.autoSerial = true
      d.elements = [newHeading('शिक्षक/कर्मचारी विवरण', 1), el]
      return d
    },
  },
  {
    id: 'student-count',
    name: 'विद्यार्थी विवरण',
    description: 'कक्षा में अध्ययनरत विद्यार्थियों की संख्या (बालक/बालिका/कुल)',
    docType: 'student-count',
    build: () => {
      const d = base('विद्यार्थी विवरण', 'student-count')
      const el = newTableElement(1, 1)
      el.table = studentCountTable()
      d.elements = [newHeading('कक्षा में अध्ययनरत विद्यार्थियों की संख्या', 1), el]
      return d
    },
  },
  {
    id: 'stock-details',
    name: 'सामग्री/स्टॉक विवरण',
    description: 'विद्यालय में उपलब्ध सामग्री/स्टॉक का रिकॉर्ड',
    docType: 'stock-details',
    build: () => {
      const d = base('सामग्री/स्टॉक विवरण', 'stock-details')
      const el = newTableElement(1, 1)
      el.table = simpleTable(['सामग्री का नाम', 'मात्रा', 'इकाई', 'प्राप्ति दिनांक', 'टिप्पणी'], [
        ['', '', '', '', ''],
        ['', '', '', '', ''],
      ])
      el.table.autoSerial = true
      d.elements = [newHeading('सामग्री/स्टॉक विवरण', 1), el]
      return d
    },
  },
  {
    id: 'demand-letter',
    name: 'मांग पत्र',
    description: 'सामग्री/संसाधन हेतु मांग पत्र',
    docType: 'demand-letter',
    build: () => {
      const d = base('मांग पत्र', 'demand-letter')
      const el = newTableElement(1, 1)
      el.table = simpleTable(['सामग्री का नाम', 'मांगी गई मात्रा', 'कारण/उपयोग'], [
        ['', '', ''],
        ['', '', ''],
      ])
      el.table.autoSerial = true
      d.elements = [
        newKeyValue('क्रमांक', '{{document_no}}'),
        newDate(),
        newParagraph('सेवा में,<br/>श्रीमान् ...........................'),
        newParagraph('विषय: सामग्री हेतु मांग पत्र'),
        newParagraph('महोदय, कृपया निम्नलिखित सामग्री उपलब्ध कराने का कष्ट करें:'),
        el,
        newSignature(),
      ]
      return d
    },
  },
  {
    id: 'certificate',
    name: 'प्रमाण पत्र',
    description: 'विद्यार्थी हेतु सामान्य प्रमाण पत्र',
    docType: 'certificate',
    build: () => {
      const d = base('प्रमाण पत्र', 'certificate')
      d.border = 'gov'
      d.elements = [
        newHeading('प्रमाण पत्र', 1),
        newParagraph(
          'यह प्रमाणित किया जाता है कि {{student_name}} पिता/माता ................................. {{school_name}}, {{education_center}} की कक्षा {{class}} में अध्ययनरत है/था/थी। इसका आचरण एवं चरित्र संतोषजनक पाया गया।',
        ),
        newLine(),
        newSignature(),
      ]
      return d
    },
  },
  {
    id: 'declaration',
    name: 'घोषणा पत्र',
    description: 'स्व-घोषणा हेतु प्रारूप',
    docType: 'declaration',
    build: () => {
      const d = base('घोषणा पत्र', 'declaration')
      d.elements = [
        newHeading('घोषणा पत्र', 1),
        newParagraph('मैं, ..........................................., घोषणा करता/करती हूँ कि ...........................................................................................................'),
        newParagraph('उपरोक्त जानकारी मेरी जानकारी एवं विश्वास के अनुसार सत्य है।'),
        newSignature(),
      ]
      return d
    },
  },
  {
    id: 'application',
    name: 'आवेदन पत्र',
    description: 'सामान्य आवेदन पत्र प्रारूप',
    docType: 'application',
    build: () => {
      const d = base('आवेदन पत्र', 'application')
      d.elements = [
        newParagraph('सेवा में,<br/>श्रीमान् प्रधानाध्यापक महोदय,<br/>{{school_name}}, {{education_center}}'),
        newParagraph('विषय: ...........................................................'),
        newParagraph('महोदय,<br/><br/>सविनय निवेदन है कि ...........................................................................................................'),
        newParagraph('अतः श्रीमान जी से निवेदन है कि ...........................................................................................................'),
        newSignature(),
      ]
      return d
    },
  },
  {
    id: 'monthly-report',
    name: 'मासिक रिपोर्ट',
    description: 'माह की गतिविधियों का सारांश प्रतिवेदन',
    docType: 'monthly-report',
    build: () => {
      const d = base('मासिक रिपोर्ट', 'monthly-report')
      const el = newTableElement(1, 1)
      el.table = simpleTable(['दिनांक', 'गतिविधि/विवरण', 'टिप्पणी'], [
        ['', '', ''],
        ['', '', ''],
      ])
      el.table.autoSerial = true
      d.elements = [newHeading('मासिक रिपोर्ट', 1), newKeyValue('माह', ''), el, newSignature()]
      return d
    },
  },
  {
    id: 'statistics-report',
    name: 'सांख्यिकी रिपोर्ट',
    description: 'सामान्य सांख्यिकी/संख्यात्मक विवरण प्रतिवेदन',
    docType: 'statistics-report',
    build: () => {
      const d = base('सांख्यिकी रिपोर्ट', 'statistics-report')
      const el = newTableElement(4, 3)
      el.table = simpleTable(['विवरण', 'संख्या', 'टिप्पणी'], [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ])
      d.elements = [newHeading('सांख्यिकी रिपोर्ट', 1), el]
      return d
    },
  },
  {
    id: 'exam-report',
    name: 'परीक्षा संबंधी रिपोर्ट',
    description: 'परीक्षा परिणाम/उपस्थिति संबंधी प्रतिवेदन',
    docType: 'exam-report',
    build: () => {
      const d = base('परीक्षा संबंधी रिपोर्ट', 'exam-report')
      const el = newTableElement(1, 1)
      el.table = simpleTable(
        ['कक्षा', 'पंजीकृत', 'उपस्थित', 'उत्तीर्ण'],
        ['1', '2', '3', '4', '5'].map((c) => [`कक्षा ${c}`, '', '', '']),
        { totalRow: ['योग', '', '', ''] },
      )
      d.elements = [newHeading('परीक्षा संबंधी रिपोर्ट', 1), newKeyValue('परीक्षा का नाम', ''), el]
      return d
    },
  },
  {
    id: 'blank',
    name: 'कस्टम खाली दस्तावेज',
    description: 'शुरुआत से नया दस्तावेज़ बनाएं',
    docType: 'custom',
    build: () => base('नया दस्तावेज़', 'custom'),
  },
]

export const BUILTIN_TEMPLATES = templates

export function findBuiltinTemplate(id: string): BuiltinTemplate | undefined {
  return templates.find((t) => t.id === id)
}
