import { classes } from '../data/classes'
import { subjects } from '../data/subjects'
import { resources } from '../data/resources'
import { courses } from '../data/courses'
import { paidNotes } from '../data/paidNotes'
import { bundles } from '../data/bundles'
import { onlineClasses } from '../data/onlineClasses'
import { calculators } from '../data/calculators'
import { scienceClasses, scienceNotes } from '../data/scienceNotes'
import { labExperiments, specimenSlides } from '../data/virtualLab'

export interface SearchResult {
  id: string
  title: string
  type: string
  to: string
  meta?: string
}

function buildIndex(): SearchResult[] {
  const items: SearchResult[] = []

  // 3D Virtual Biology Lab System
  items.push({
    id: 'virtual-lab-hub',
    title: '3D Virtual Biology Lab',
    type: 'Virtual Lab',
    to: '/virtual-lab',
    meta: '3D Virtual Biology Lab Simulator Microscope Cells DNA Stomata Flower Dissection WebGL',
  })

  labExperiments.forEach((exp) => {
    items.push({
      id: `virtual-lab-${exp.id}`,
      title: `${exp.title} (3D Virtual Lab)`,
      type: 'Virtual Lab',
      to: `/virtual-lab/${exp.slug}`,
      meta: `${exp.category} · ${exp.subtitle} · ${exp.classes.join(' ')} · ${exp.materials.join(' ')}`,
    })
  })

  specimenSlides.forEach((slide) => {
    items.push({
      id: `specimen-slide-${slide.id}`,
      title: `${slide.commonName} (${slide.name})`,
      type: 'Lab Specimen',
      to: '/virtual-lab/microscope',
      meta: `Microscope slide · ${slide.stain} · ${slide.cellType} · ${slide.description}`,
    })
  })

  // Science Notes System
  items.push({
    id: 'science-notes-landing',
    title: 'Science Notes (Classes 6 to 12)',
    type: 'Science Notes',
    to: '/learn/science',
    meta: 'Science Notes Classes 6 7 8 9 10 11 12 CBSE MP Board',
  })

  scienceClasses.forEach((sc) =>
    items.push({
      id: `science-class-${sc.classSlug}`,
      title: `${sc.title} (Class ${sc.numeral})`,
      type: 'Science Notes',
      to: `/learn/science/${sc.classSlug}`,
      meta: `Class ${sc.numeral} · ${sc.label} · Science Notes · CBSE & MP Board`,
    }),
  )

  scienceNotes.forEach((sn) => {
    const classNum = sn.classSlug.replace('class-', '')
    const topicList = sn.topics.map((t) => t.title).join(' ')
    const keywords = sn.keywords.join(' ')
    items.push({
      id: `science-note-${sn.id}`,
      title: `${sn.chapterName} (Class ${classNum} ${sn.subjectName})`,
      type: 'Science Note',
      to: `/learn/science/${sn.classSlug}/${sn.slug}`,
      meta: `Class ${classNum} · ${sn.subjectName} · Chapter ${sn.chapterNumber} · ${sn.shortDescription} · ${topicList} · ${keywords}`,
    })
  })

  classes.forEach((c) => items.push({ id: `class-${c.slug}`, title: c.label, type: 'Class', to: `/classes/${c.slug}` }))
  subjects.forEach((s) => items.push({ id: `subject-${s.slug}`, title: s.name, type: 'Subject', to: `/subjects/${s.slug}` }))
  resources.forEach((r) =>
    items.push({
      id: `resource-${r.id}`,
      title: r.title,
      type: r.resourceType,
      to: `/resources/${r.slug}`,
      meta: `${r.board} · ${r.subject}`,
    }),
  )
  courses.forEach((c) => items.push({ id: `course-${c.id}`, title: c.title, type: 'Course', to: `/courses/${c.slug}` }))
  paidNotes.forEach((n) => items.push({ id: `paidnote-${n.id}`, title: n.title, type: 'Premium Note', to: `/paid-notes/${n.slug}` }))
  bundles.forEach((b) => items.push({ id: `bundle-${b.id}`, title: b.title, type: 'Bundle', to: `/bundles/${b.slug}` }))
  onlineClasses.forEach((c) => items.push({ id: `oc-${c.id}`, title: c.title, type: 'Online Class', to: `/online-classes/${c.slug}` }))
  calculators.forEach((c) => items.push({ id: `calc-${c.slug}`, title: c.title, type: 'Calculator', to: `/calculators/${c.slug}` }))
  items.push({ id: 'neet', title: 'NEET Biology', type: 'NEET', to: '/neet' })
  items.push({ id: 'neet-botany', title: 'NEET Botany', type: 'NEET', to: '/neet/botany' })
  items.push({ id: 'neet-zoology', title: 'NEET Zoology', type: 'NEET', to: '/neet/zoology' })

  return items
}

const index = buildIndex()

export function search(query: string): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return index.filter((item) => item.title.toLowerCase().includes(q) || item.meta?.toLowerCase().includes(q)).slice(0, 20)
}
