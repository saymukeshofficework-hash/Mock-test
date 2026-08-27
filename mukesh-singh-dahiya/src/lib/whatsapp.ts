import { contact } from '../config/contact'
import { site } from '../data/site'
import { getClass } from '../data/classes'
import { getSubject } from '../data/subjects'
import { formatINR } from './currency'
import type { Course, PaidNote, OnlineClass, Bundle } from '../data/types'

// All purchases are handled manually over WhatsApp for now — see
// src/config/contact.ts. No payment gateway is called from this file.
export function buildWhatsAppUrl(message: string): string {
  const number = contact.whatsapp.replace(/[^\d]/g, '')
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

function label(classSlug?: string, board?: string) {
  const cls = classSlug ? getClass(classSlug) : undefined
  return [cls?.label, board].filter(Boolean).join(', ')
}

export function courseMessage(course: Course): string {
  const price = course.discountPrice ?? course.price
  return [
    `Hello ${site.name.split(' ')[0]} Sir,`,
    `I am interested in enrolling in:`,
    `Course: ${course.title}`,
    course.classSlug && `Class: ${getClass(course.classSlug)?.label ?? course.classSlug}`,
    course.board && `Board: ${course.board}`,
    course.subject && `Subject: ${getSubject(course.subject)?.name ?? course.subject}`,
    price !== undefined && `Price: ${formatINR(price)}`,
    `Please share the enrollment and payment details.`,
    `Thank you.`,
  ]
    .filter(Boolean)
    .join('\n')
}

export function noteMessage(note: PaidNote): string {
  const price = note.discountPrice ?? note.price
  return [
    `Hello ${site.name.split(' ')[0]} Sir,`,
    `I would like to purchase:`,
    `Notes: ${note.title}`,
    `Class: ${getClass(note.classSlug)?.label ?? note.classSlug}`,
    `Board: ${note.board}`,
    `Subject: ${getSubject(note.subject)?.name ?? note.subject}`,
    note.chapter && `Chapter: ${note.chapter}`,
    price !== undefined && `Price: ${formatINR(price)}`,
    `Please share the payment details.`,
    `Thank you.`,
  ]
    .filter(Boolean)
    .join('\n')
}

export function onlineClassMessage(oc: OnlineClass): string {
  const price = oc.discountPrice ?? oc.price
  return [
    `Hello ${site.name.split(' ')[0]} Sir,`,
    `I am interested in joining:`,
    `Online Class: ${oc.title}`,
    `Class: ${getClass(oc.classSlug)?.label ?? oc.classSlug}`,
    `Board: ${oc.board}`,
    `Subject: ${getSubject(oc.subject)?.name ?? oc.subject}`,
    oc.days && `Batch: ${oc.days}${oc.time ? ' · ' + oc.time : ''}`,
    price !== undefined && `Fee: ${formatINR(price)}${oc.priceType ? '/' + oc.priceType : ''}`,
    `Please share the registration and payment details.`,
    `Thank you.`,
  ]
    .filter(Boolean)
    .join('\n')
}

export function bundleMessage(bundle: Bundle): string {
  const price = bundle.discountPrice ?? bundle.price
  return [
    `Hello ${site.name.split(' ')[0]} Sir,`,
    `I would like to purchase:`,
    `Bundle: ${bundle.title}`,
    label(bundle.classSlug, bundle.board) || undefined,
    bundle.subject && `Subject: ${getSubject(bundle.subject)?.name ?? bundle.subject}`,
    price !== undefined && `Price: ${formatINR(price)}`,
    `Please share the payment details.`,
    `Thank you.`,
  ]
    .filter(Boolean)
    .join('\n')
}

export function generalMessage(): string {
  return `Hello ${site.name.split(' ')[0]} Sir,\nI have a question about classes, courses or study material.`
}
