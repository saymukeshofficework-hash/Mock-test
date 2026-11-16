import { MovedToMainSite } from "./Moved";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Magazines moved | पत्रिकाएँ",
  description: "पत्रिकाएँ अब tettesthub.in/current-affairs-ebook.html पर पढ़ें। Magazines are now on the main site e-book page.",
  path: "/current-affairs/books",
});

export default function Page() {
  return <MovedToMainSite />;
}
