import { Mail, MessageCircle, Phone, Send } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHeader } from "@/components/ui/Primitives";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({ title: "Contact TETTESTHUB", description: "Get in touch with the TETTESTHUB team.", path: "/contact" });

export default async function ContactPage() {
  const lang = await getLang();
  // Contact details appear only when configured through environment variables.
  const channels = [
    site.contact.email && { Icon: Mail, label: site.contact.email, href: `mailto:${site.contact.email}` },
    site.contact.phone && { Icon: Phone, label: site.contact.phone, href: `tel:${site.contact.phone.replace(/\s/g, "")}` },
    site.contact.whatsapp && { Icon: MessageCircle, label: "WhatsApp", href: site.contact.whatsapp },
    site.contact.telegram && { Icon: Send, label: "Telegram", href: site.contact.telegram },
  ].filter(Boolean) as { Icon: typeof Mail; label: string; href: string }[];

  return (
    <>
      <PageHeader
        title={tr(dict.nav.contact, lang)}
        subtitle={lang === "hi" ? "प्रश्न, सुझाव या सहायता — हमें लिखें।" : "Questions, suggestions or support — write to us."}
      >
        <Breadcrumbs items={[{ label: tr(dict.nav.home, lang), href: "/" }, { label: tr(dict.nav.contact, lang), href: "/contact" }]} />
      </PageHeader>
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
        <ContactForm lang={lang} />
        <aside className="space-y-4">
          {channels.length > 0 && (
            <ul className="card divide-y divide-ink-100">
              {channels.map(({ Icon, label, href }) => (
                <li key={href}>
                  <a href={href} className="flex items-center gap-3 p-4 font-medium text-ink-900 hover:text-brand-700" {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    <Icon className="h-5 w-5 text-brand-600" aria-hidden="true" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <p className="rounded-xl bg-brand-50 p-4 text-sm text-ink-700">{tr(dict.disclaimer.affiliation, lang)}</p>
        </aside>
      </div>
    </>
  );
}
