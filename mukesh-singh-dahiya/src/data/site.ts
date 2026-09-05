import { contact } from '../config/contact'

export const site = {
  name: 'Mukesh Dahiya',
  title: 'Teacher & Educator',
  qualifications: 'M.Sc. Botany | M.A. English | 12 Years Teaching Experience',
  scope: 'Classes 5–12 | CBSE & MP Board | English Medium',
  tagline: 'Learn Better. Understand Deeper. Achieve More.',
  intro:
    'Structured learning resources for Classes 5–12, including notes, solutions, questions, previous papers, educational calculators and dedicated NEET Biology resources.',
  bio: 'Mukesh Dahiya is an educator with 12 years of teaching experience, holding an M.Sc. in Botany and an M.A. in English. He provides structured academic learning resources for students from Classes 5 to 12 across CBSE and MP Board in English Medium, along with dedicated NEET Biology resources in Botany and Zoology.',
  credentials: [
    { label: 'M.Sc. Botany', icon: 'leaf' },
    { label: 'M.A. English', icon: 'book' },
    { label: '12 Years Teaching Experience', icon: 'clock' },
    { label: 'Classes 5–12', icon: 'graduation' },
    { label: 'CBSE + MP Board', icon: 'shield' },
    { label: 'English Medium', icon: 'globe' },
  ] as { label: string; icon: string }[],
  teacherImage: '/images/teacher/mukesh-dahiya.png',
  contact: {
    email: contact.email, // placeholder — to be provided
    phone: contact.phone, // placeholder — to be provided
    whatsapp: contact.whatsapp, // placeholder — to be provided
    address: '', // placeholder — to be provided
    social: [] as { label: string; url: string }[],
  },
}
