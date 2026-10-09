import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqList } from "@/components/ui/FaqList";
import { PageHeader } from "@/components/ui/Primitives";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";
import { getFaqs } from "@/lib/repo";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "FAQ — TETTESTHUB",
  description: "Answers about TETTESTHUB: exams covered, ₹299 notes, accessing purchases, how exam dates are verified and affiliation.",
  path: "/faq",
});

export default async function FaqPage() {
  const lang = await getLang();
  const faqs = await getFaqs();
  return (
    <>
      <PageHeader title={tr(dict.sections.faq, lang)}>
        <Breadcrumbs items={[{ label: tr(dict.nav.home, lang), href: "/" }, { label: tr(dict.nav.faq, lang), href: "/faq" }]} />
      </PageHeader>
      <div className="container-page max-w-3xl py-10">
        <FaqList faqs={faqs} lang={lang} />
      </div>
    </>
  );
}
