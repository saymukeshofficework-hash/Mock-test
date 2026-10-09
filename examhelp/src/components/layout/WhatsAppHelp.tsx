import { site } from "@/lib/site";

/** Floating WhatsApp help button (issues with payment, download, tests). */
export function WhatsAppHelp() {
  if (!site.contact.whatsapp) return null;
  const msg = encodeURIComponent("नमस्ते TETTESTHUB, मुझे सहायता चाहिए: ");
  return (
    <a
      href={`${site.contact.whatsapp}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp पर सहायता / Help on WhatsApp"
      className="fixed bottom-[160px] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-4 ring-white transition hover:scale-105 lg:bottom-6"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor" aria-hidden="true">
        <path d="M16.04 3C9.4 3 4 8.36 4 14.97c0 2.11.56 4.17 1.62 5.98L4 29l8.25-1.6a12.1 12.1 0 0 0 3.79.6C22.68 28 28 22.64 28 16.03 28 9.42 22.68 3 16.04 3Zm0 22.83c-1.24 0-2.46-.2-3.62-.6l-.26-.09-4.9.95.97-4.73-.17-.27a9.7 9.7 0 0 1-1.5-5.12c0-5.38 4.12-9.76 9.48-9.76 5.27 0 9.74 4.37 9.74 9.76s-4.47 9.86-9.74 9.86Zm5.35-7.32c-.29-.15-1.73-.85-2-.95-.27-.1-.46-.15-.66.15-.19.29-.76.95-.93 1.14-.17.2-.34.22-.63.07-.29-.14-1.24-.45-2.36-1.45-.87-.77-1.46-1.73-1.63-2.02-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.49.1-.19.05-.37-.02-.51-.07-.15-.66-1.58-.9-2.16-.24-.57-.48-.49-.66-.5h-.56c-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.43 0 1.43 1.05 2.82 1.19 3.01.15.2 2.06 3.14 4.99 4.4.7.3 1.24.48 1.67.62.7.22 1.34.19 1.85.12.56-.08 1.73-.71 1.97-1.39.24-.68.24-1.27.17-1.39-.07-.12-.27-.2-.56-.34Z" />
      </svg>
    </a>
  );
}
