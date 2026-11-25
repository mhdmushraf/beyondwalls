import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import SEOHead, { PAGE_SEO } from "@/components/SEOHead";
import LegalShell from "@/components/site/LegalShell";

export default function Privacy() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [hash]);

  return (
    <LegalShell title="Privacy policy" updated="November 2026">
      <SEOHead {...PAGE_SEO.privacy} />
      <h2>1. Who we are</h2>
      <p>
        Beyond Walls is run by Linkzone Global FZ-LLC, Dubai, United Arab Emirates ("we", "us").
        This policy covers the Beyond Walls website, web portal, TV player and the Beyond Walls app for iPhone and Android.
      </p>

      <h2>2. What we collect</h2>
      <ul>
        <li><strong>Account:</strong> your name, email address and password (stored hashed by our hosting provider).</li>
        <li><strong>Business:</strong> business name, type, emirate, WhatsApp number, billing email, tax registration number (TRN), trade licence number and an optional photo of the trade licence (stored privately).</li>
        <li><strong>Venues and screens:</strong> venue name, address, map pin, photos, opening hours, visitor estimates; screen names, status, the item playing and periodic screenshots of what the TV shows.</li>
        <li><strong>Content you upload:</strong> images, videos, menus, QR links and ads.</li>
        <li><strong>Messages:</strong> team chat messages and support requests.</li>
        <li><strong>Payments:</strong> invoices and payment status. Card payments are handled by Paymob; we never see or store your card number. For payouts we store the bank name, account holder and IBAN you give us.</li>
        <li><strong>App and device:</strong> a push notification token for your phone, the phone model name, and basic technical logs (for example IP address and errors) kept by our hosting provider.</li>
        <li><strong>QR scans:</strong> a count of scans per QR code and screen. We do not identify the person scanning.</li>
      </ul>
      <p>The app uses the camera or photo library only when you choose to add a trade licence photo. We do not use your location, contacts or microphone, and we do not track you across other companies' apps or websites.</p>

      <h2>3. Why we use it</h2>
      <ul>
        <li>To run your account, your screens and your bookings.</li>
        <li>To verify businesses before they go live and prevent fraud.</li>
        <li>To take payments, issue invoices and pay venues their earnings.</li>
        <li>To send notifications you need (a screen offline, an ad to review, a payment or payout).</li>
        <li>To provide support and keep the service secure.</li>
        <li>To meet legal duties, such as keeping tax records.</li>
      </ul>

      <h2>4. Who we share it with</h2>
      <ul>
        <li><strong>Base44</strong> — hosts the app, database, files and sign-in.</li>
        <li><strong>Paymob</strong> — processes card payments.</li>
        <li><strong>Expo, Apple and Google</strong> — deliver push notifications to your phone.</li>
        <li><strong>Other users, only where the service needs it:</strong> advertisers see venue names, photos, prices and audience estimates; venues see the ads booked on their screens and the advertiser's business name; your team sees what you post in team chat.</li>
        <li><strong>Authorities</strong>, when the law requires it.</li>
      </ul>
      <p>We do not sell personal information, and we do not use it for advertising profiles.</p>

      <h2>5. Security</h2>
      <p>Data is encrypted in transit (HTTPS). Access is limited by business: you only see data for businesses you belong to. Trade licences are stored as private files. The app keeps your sign-in token in the phone's secure storage.</p>

      <h2>6. How long we keep it</h2>
      <p>We keep your data while your account is active. Invoices and booking records are kept for 5 years to meet UAE tax rules. Screen screenshots are replaced as new ones arrive. When you delete your account we delete your login, profile, notifications and push tokens straight away.</p>

      <h2>7. Delete your account</h2>
      <p>
        In the app: <strong>More → Delete account</strong>. On the web: <a href="/delete-account">beyondwalls.linkzoneglobal.com/delete-account</a>.
        This removes your login and personal details and takes you off every business. Records the business must keep by law stay with the business without your login.
      </p>

      <h2>8. Your rights</h2>
      <p>You can ask to see, correct, export or delete your personal data, or object to how we use it, under the UAE Personal Data Protection Law. Contact us below; we reply within 30 days.</p>

      <h2 id="cookies">9. Cookies</h2>
      <p>The website uses essential cookies and local storage to keep you signed in and remember your settings. We do not use advertising cookies.</p>

      <h2>10. Children</h2>
      <p>Beyond Walls is a business service for people aged 18 and over. We do not knowingly collect data from children.</p>

      <h2>11. Where data is processed</h2>
      <p>Our providers may process data outside the UAE. We use providers that protect data with contracts and security safeguards.</p>

      <h2>12. Changes</h2>
      <p>We will tell you about important changes by email or in the app before they apply.</p>

      <h2>13. Contact</h2>
      <p>
        Linkzone Global FZ-LLC, Dubai, United Arab Emirates<br />
        Email: beyondwalls@linkzoneglobal.com<br />
        WhatsApp: +971 54 546 9496
      </p>
    </LegalShell>
  );
}
