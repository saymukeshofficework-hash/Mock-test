import { BookReader } from "@/components/ca/BookReader";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Current Affairs Magazines — Read Online | पत्रिकाएँ ऑनलाइन पढ़ें",
  description:
    "मध्यप्रदेश समसामयिकी और MP हाई कोर्ट सहायक ग्रेड-3 विशेषांक — लॉगिन करके मुफ़्त ऑनलाइन पढ़ें। Read TETTESTHUB magazines online, free after login.",
  path: "/current-affairs/books",
});

export default function Page() {
  return <BookReader />;
}
