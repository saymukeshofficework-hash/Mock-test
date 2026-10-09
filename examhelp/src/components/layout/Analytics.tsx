import Script from "next/script";
import { site } from "@/lib/site";

/**
 * Analytics integration points. Renders nothing until the IDs are set in the
 * environment (NEXT_PUBLIC_GA_ID, NEXT_PUBLIC_META_PIXEL_ID).
 */
export function Analytics() {
  const { gaId, metaPixelId } = site.analytics;
  const safeId = (id: string) => /^[A-Za-z0-9-]+$/.test(id);
  return (
    <>
      {gaId && safeId(gaId) && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
          </Script>
        </>
      )}
      {metaPixelId && safeId(metaPixelId) && (
        <Script id="meta-pixel" strategy="lazyOnload">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
