import { FormEvent, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { whatsappLink } from '../data/contact'

interface FormState {
  name: string
  phone: string
  email: string
  consultationType: string
  service: string
  date: string
  time: string
  message: string
}

const initialState: FormState = {
  name: '',
  phone: '',
  email: '',
  consultationType: 'astrology',
  service: '',
  date: '',
  time: '',
  message: '',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[0-9+\-\s()]{7,15}$/

interface Props {
  defaultService?: string
  defaultType?: string
}

export default function BookingForm({ defaultService, defaultType }: Props) {
  const { t } = useLanguage()
  const [form, setForm] = useState<FormState>({
    ...initialState,
    service: defaultService ?? '',
    consultationType: defaultType ?? 'astrology',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [status, setStatus] = useState<'idle' | 'success'>('idle')

  const types: [string, string][] = [
    ['astrology', t('booking.types.astrology')],
    ['tarot', t('booking.types.tarot')],
    ['handwriting', t('booking.types.handwriting')],
  ]

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) next.name = t('booking.required')
    if (!form.phone.trim()) next.phone = t('booking.required')
    else if (!PHONE_RE.test(form.phone.trim())) next.phone = t('booking.invalidPhone')
    if (!form.email.trim()) next.email = t('booking.required')
    else if (!EMAIL_RE.test(form.email.trim())) next.email = t('booking.invalidEmail')
    if (!form.date) next.date = t('booking.required')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) {
      setStatus('idle')
      return
    }
    // No booking backend is connected yet; this captures the request
    // locally and confirms to the visitor. Wire this to a real endpoint
    // (email, CRM, scheduling API) when one is available.
    setStatus('success')
  }

  return (
    <div className="card p-6 sm:p-8">
      <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-1.5 sm:col-span-1">
          <label htmlFor="name" className="text-sm font-semibold text-navy-900">
            {t('booking.name')} <span aria-hidden="true">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="rounded-xl border border-navy-900/15 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && <p id="name-error" className="text-xs text-rose-600">{errors.name}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-sm font-semibold text-navy-900">
            {t('booking.phone')} <span aria-hidden="true">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="rounded-xl border border-navy-900/15 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && <p id="phone-error" className="text-xs text-rose-600">{errors.phone}</p>}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="email" className="text-sm font-semibold text-navy-900">
            {t('booking.email')} <span aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="rounded-xl border border-navy-900/15 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && <p id="email-error" className="text-xs text-rose-600">{errors.email}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="consultationType" className="text-sm font-semibold text-navy-900">
            {t('booking.consultationType')}
          </label>
          <select
            id="consultationType"
            value={form.consultationType}
            onChange={(e) => update('consultationType', e.target.value)}
            className="rounded-xl border border-navy-900/15 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
          >
            {types.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="service" className="text-sm font-semibold text-navy-900">
            {t('booking.service')}
          </label>
          <input
            id="service"
            type="text"
            value={form.service}
            onChange={(e) => update('service', e.target.value)}
            className="rounded-xl border border-navy-900/15 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="date" className="text-sm font-semibold text-navy-900">
            {t('booking.preferredDate')} <span aria-hidden="true">*</span>
          </label>
          <input
            id="date"
            type="date"
            value={form.date}
            onChange={(e) => update('date', e.target.value)}
            className="rounded-xl border border-navy-900/15 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? 'date-error' : undefined}
          />
          {errors.date && <p id="date-error" className="text-xs text-rose-600">{errors.date}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="time" className="text-sm font-semibold text-navy-900">
            {t('booking.preferredTime')}
          </label>
          <input
            id="time"
            type="time"
            value={form.time}
            onChange={(e) => update('time', e.target.value)}
            className="rounded-xl border border-navy-900/15 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="message" className="text-sm font-semibold text-navy-900">
            {t('booking.message')}
          </label>
          <textarea
            id="message"
            rows={4}
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            className="rounded-xl border border-navy-900/15 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button type="submit" className="btn-primary">
            {t('booking.submit')}
          </button>
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-secondary">
            {t('booking.whatsapp')}
          </a>
        </div>

        <div className="sm:col-span-2" role="status" aria-live="polite">
          {status === 'success' && (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{t('booking.success')}</p>
          )}
        </div>
      </form>
    </div>
  )
}
