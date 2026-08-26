import { FormEvent, useState } from 'react'
import PageHero from '../components/PageHero'
import { useLanguage } from '../i18n/LanguageContext'
import { contactConfig, whatsappLink } from '../data/contact'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Contact() {
  const { locale, t } = useLanguage()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({})
  const [status, setStatus] = useState<'idle' | 'success'>('idle')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (!form.name.trim()) next.name = t('booking.required')
    if (!form.email.trim()) next.email = t('booking.required')
    else if (!EMAIL_RE.test(form.email.trim())) next.email = t('booking.invalidEmail')
    if (!form.message.trim()) next.message = t('booking.required')
    setErrors(next)
    if (Object.keys(next).length) return
    setStatus('success')
  }

  const cards = [
    { label: t('contact.phone'), value: contactConfig.phone, href: `tel:${contactConfig.phone}` },
    { label: t('contact.email'), value: contactConfig.email, href: `mailto:${contactConfig.email}` },
    { label: t('contact.whatsapp'), value: locale === 'hi' ? 'संदेश भेजें' : 'Send a message', href: whatsappLink() },
  ]

  return (
    <>
      <PageHero eyebrow={t('nav.contact')} title={t('contact.title')} description={t('contact.subtitle')} />

      <section className="bg-white py-16">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {cards.map((c) => (
                <a key={c.label} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="card p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-royal-600">{c.label}</p>
                  <p className="mt-1 break-words text-sm font-medium text-navy-900">{c.value}</p>
                </a>
              ))}
            </div>
            <div className="card p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-royal-600">{t('contact.social')}</p>
              <div className="flex flex-wrap gap-3">
                <a href={contactConfig.instagram} target="_blank" rel="noreferrer" className="btn-secondary !px-4 !py-2 text-xs">
                  Instagram
                </a>
                <a href={contactConfig.youtube} target="_blank" rel="noreferrer" className="btn-secondary !px-4 !py-2 text-xs">
                  YouTube
                </a>
                <a href={contactConfig.facebook} target="_blank" rel="noreferrer" className="btn-secondary !px-4 !py-2 text-xs">
                  Facebook
                </a>
              </div>
            </div>
          </div>

          <div className="card p-6 sm:p-8">
            <p className="mb-4 text-sm text-navy-800/70">{t('contact.formNote')}</p>
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="c-name" className="text-sm font-semibold text-navy-900">{t('booking.name')}</label>
                <input
                  id="c-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="rounded-xl border border-navy-900/15 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-xs text-rose-600">{errors.name}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="c-email" className="text-sm font-semibold text-navy-900">{t('booking.email')}</label>
                <input
                  id="c-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="rounded-xl border border-navy-900/15 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="text-xs text-rose-600">{errors.email}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="c-message" className="text-sm font-semibold text-navy-900">{t('booking.message')}</label>
                <textarea
                  id="c-message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="rounded-xl border border-navy-900/15 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
                  aria-invalid={!!errors.message}
                />
                {errors.message && <p className="text-xs text-rose-600">{errors.message}</p>}
              </div>
              <button type="submit" className="btn-primary w-fit">
                {t('contact.sendMessage')}
              </button>
              <div role="status" aria-live="polite">
                {status === 'success' && (
                  <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{t('booking.success')}</p>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
