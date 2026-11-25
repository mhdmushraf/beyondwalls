import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import SEOHead, { PAGE_SEO } from "@/components/SEOHead";
import LegalShell from "@/components/site/LegalShell";
import { PRICING } from "@/components/site/sections";

export default function Terms() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [hash]);

  return (
    <LegalShell title="Terms of service" updated="November 2026">
      <SEOHead {...PAGE_SEO.terms} />
      <h2>1. Who we are</h2>
      <p>BeyondWalls ("we", "us") is operated by Linkzone Global FZ-LLC, in5 Tech, Dubai Internet City, Dubai, UAE (DDA licence 107603). By creating an account or using the website, apps or TV player ("Service") you agree to these terms.</p>

      <h2>2. The Service</h2>
      <p>BeyondWalls lets venues run digital signage on their screens (menus, prices, playlists, QR codes) and, if they choose, offer spare ad slots to advertisers through a marketplace. Advertisers and agencies can book those slots and receive proof-of-play and QR-scan reporting.</p>

      <h2>3. Accounts</h2>
      <p>You must give accurate details, including business documents we ask for to verify your business. You are responsible for activity under your account and for keeping your sign-in secure. You may delete your account at any time from the app or at <a href="/delete-account">beyondwalls.ae/delete-account</a>.</p>

      <h2>4. Plans and fees for venues</h2>
      <ul>
        <li><strong>Ads only</strong> — free. Your screen plays ads you approve.</li>
        <li><strong>Signage + Ads</strong> — AED {PRICING.signageAds} per screen per month (founding price, locked for 12 months).</li>
        <li><strong>Signage only</strong> — AED {PRICING.signageOnly} per screen per month (founding price, locked for 12 months). No ads are shown.</li>
        <li><strong>B.One player</strong> — AED {PRICING.bone} one-off, optional, with a 12-month warranty.</li>
      </ul>
      <p>Plans are monthly with no minimum term; you can cancel any time and the plan ends at the end of the paid month. Screen fees are first deducted from your ad earnings; any balance is charged to your payment method. Prices exclude VAT.</p>

      <h2 id="venue-agreement">5. Venue agreement — ads and earnings</h2>
      <ul>
        <li>You must own or be authorised to use every screen and venue you register.</li>
        <li>Every marketplace ad needs your approval before it plays. You can block categories and brands.</li>
        <li>You receive <strong>{PRICING.venueShare}%</strong> of the booking value of marketplace ads that play on your screens. Partner venues that receive free hardware agree a 60/40 or 50/50 share in writing.</li>
        <li>For direct deals — advertisers you sell to yourself and collect payment from — we charge a <strong>{PRICING.directDealFee}%</strong> platform fee on the deal value.</li>
        <li>Earnings become available after the booked period has played. You can request payouts to a bank account in your business's name; we may hold payouts while we verify details or investigate fraud or non-delivery.</li>
        <li>You agree to keep screens powered and online during your stated opening hours. Bookings that do not play may be refunded to the advertiser and are not paid out.</li>
      </ul>

      <h2>6. Advertisers and agencies</h2>
      <ul>
        <li>Prices are set per screen per week by each venue and shown before you pay. Payment is taken when you book.</li>
        <li>If a venue declines your ad, the amount for that screen is refunded in full to your original payment method.</li>
        <li>You are responsible for your creative and must hold the rights to everything in it.</li>
        <li>Agencies and Connect partners may book for clients; partners keep {PRICING.connectShare}% under their partner agreement.</li>
      </ul>

      <h2 id="advertising-rules">7. Advertising rules</h2>
      <p>Ads must follow UAE law and media content standards. We and the venue may reject or remove any ad. Not allowed: alcohol, tobacco and vaping, adult content, gambling, political or religious campaigning, weapons, unlicensed medical or financial claims, and anything misleading, offensive or infringing. Videos and images must match the screen's format; we check this on upload.</p>

      <h2>8. Your content</h2>
      <p>You keep ownership of content you upload. You give us a licence to store, process and display it on the screens you choose, only to provide the Service.</p>

      <h2>9. Acceptable use</h2>
      <p>Do not misuse the Service: no illegal use, no interfering with screens or systems, no unauthorised access, no impersonation, and no inflating plays or QR scans.</p>

      <h2>10. Availability and liability</h2>
      <p>We work to keep screens and the Service running but do not guarantee uninterrupted service. To the extent the law allows, we are not liable for indirect or consequential losses, and our total liability is limited to the fees you paid us in the 12 months before the claim.</p>

      <h2>11. Suspension and termination</h2>
      <p>We may suspend or close accounts that break these terms. Amounts you owe remain due, and earnings from fraudulent activity are not paid.</p>

      <h2>12. Changes</h2>
      <p>We may update these terms. We will notify you of material changes in the app or by email before they take effect.</p>

      <h2>13. Law</h2>
      <p>These terms are governed by the laws of the United Arab Emirates as applied in the Emirate of Dubai, and the Dubai courts have jurisdiction.</p>

      <h2>14. Contact</h2>
      <p>beyondwalls@linkzoneglobal.com · +971 55 614 0067 (WhatsApp)</p>
    </LegalShell>
  );
}
