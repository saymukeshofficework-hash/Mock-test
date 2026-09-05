import { useState } from 'react'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Icon from '../components/Icon'
import WhatsAppButton from '../components/WhatsAppButton'
import { site } from '../data/site'
import { generalMessage } from '../lib/whatsapp'

export default function Contact() {
  const [sent, setSent] = useState(false)

  return (
    <>
      <SEO title="Contact" description="Get in touch with Mukesh Dahiya about classes, courses or study material." />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} />
      <div className="container-page py-14 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">Contact</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Have a question about classes, courses or study material? Get in touch.</p>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="card flex flex-col gap-3 border-emerald-500/30 bg-emerald-50/60 p-5 dark:bg-emerald-500/10">
                <div className="flex items-center gap-4">
                  <Icon name="whatsapp" className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="font-semibold text-navy-900 dark:text-white">Have questions about courses, notes or online classes?</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Chat directly on WhatsApp for a quick response.</p>
                  </div>
                </div>
                <WhatsAppButton message={generalMessage()} label="Chat on WhatsApp" className="self-start" />
              </div>
              <div className="card flex items-center gap-4 p-5">
                <Icon name="mail" className="h-5 w-5 text-brand-600 dark:text-cyan-300" />
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Email</p>
                  <p className="text-sm font-medium text-navy-800 dark:text-slate-100">{site.contact.email || 'To be added'}</p>
                </div>
              </div>
              <div className="card flex items-center gap-4 p-5">
                <Icon name="phone" className="h-5 w-5 text-brand-600 dark:text-cyan-300" />
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Phone</p>
                  <p className="text-sm font-medium text-navy-800 dark:text-slate-100">{site.contact.phone || 'To be added'}</p>
                </div>
              </div>
              <div className="card flex items-center gap-4 p-5">
                <Icon name="mapPin" className="h-5 w-5 text-brand-600 dark:text-cyan-300" />
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Address</p>
                  <p className="text-sm font-medium text-navy-800 dark:text-slate-100">{site.contact.address || 'To be added'}</p>
                </div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                setSent(true)
              }}
              className="card space-y-4 p-6"
            >
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Name</label>
                <input id="name" required className="input" />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Email</label>
                <input id="email" type="email" required className="input" />
              </div>
              <div>
                <label htmlFor="message" className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Message</label>
                <textarea id="message" required rows={4} className="input" />
              </div>
              <button type="submit" className="btn-primary w-full">
                Send Message
              </button>
              {sent && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  This form is not yet connected to an email service. Please reach out via the email/phone above once available.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
