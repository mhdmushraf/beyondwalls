import React from "react";
import { Badge } from "@/components/ui/badge";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="pt-32 pb-12 px-6 bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-amber-100 text-slate-900 mb-6">Legal</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Privacy Policy
          </h1>
          <p className="text-slate-600">Last updated: November 25, 2024</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto prose prose-slate prose-lg">
          <h2>1. Introduction</h2>
          <p>
            BeyondWalls ("we," "our," or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your 
            information when you use our digital out-of-home advertising platform.
          </p>

          <h2>2. Information We Collect</h2>
          <h3>2.1 Personal Information</h3>
          <p>We may collect:</p>
          <ul>
            <li>Name and contact information (email, phone number)</li>
            <li>Business information (company name, trade license)</li>
            <li>Emirates ID or other government-issued identification</li>
            <li>Payment and billing information</li>
            <li>Account credentials</li>
          </ul>

          <h3>2.2 Usage Information</h3>
          <p>We automatically collect:</p>
          <ul>
            <li>Device information and browser type</li>
            <li>IP address and location data</li>
            <li>Usage patterns and preferences</li>
            <li>Campaign performance data</li>
            <li>Screen status and heartbeat data</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul>
            <li>Provide and improve our services</li>
            <li>Process transactions and payments</li>
            <li>Verify user identity and prevent fraud</li>
            <li>Send service-related communications</li>
            <li>Analyze usage and optimize performance</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. Information Sharing</h2>
          <p>We may share your information with:</p>
          <ul>
            <li><strong>Service Providers:</strong> Third parties who assist in operating our platform</li>
            <li><strong>Business Partners:</strong> When necessary for campaign delivery</li>
            <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>

          <h2>5. Data Security</h2>
          <p>
            We implement industry-standard security measures including:
          </p>
          <ul>
            <li>SSL/TLS encryption for data transmission</li>
            <li>Secure data storage with access controls</li>
            <li>Regular security audits and monitoring</li>
            <li>PCI-compliant payment processing</li>
          </ul>

          <h2>6. Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as needed 
            to provide services. We may retain certain information for legal compliance, 
            dispute resolution, or enforcement of agreements.
          </p>

          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to certain processing activities</li>
            <li>Export your data in a portable format</li>
          </ul>
          <p>To exercise these rights, contact us at info@beyondwalls.ae.</p>

          <h2>8. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance user experience, analyze 
            usage, and personalize content. You can control cookie preferences through 
            your browser settings.
          </p>

          <h2>9. Third-Party Links</h2>
          <p>
            Our platform may contain links to third-party websites. We are not responsible 
            for the privacy practices of these external sites.
          </p>

          <h2>10. Children's Privacy</h2>
          <p>
            Our services are not intended for individuals under 18 years of age. We do not 
            knowingly collect personal information from children.
          </p>

          <h2>11. International Data Transfers</h2>
          <p>
            Your information may be processed in countries other than your own. We ensure 
            appropriate safeguards are in place for international data transfers.
          </p>

          <h2>12. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. We will notify you of significant 
            changes via email or through our platform.
          </p>

          <h2>13. Contact Us</h2>
          <p>
            For questions about this Privacy Policy or our data practices, contact us at:<br />
            Email: info@beyondwalls.ae<br />
            Phone: +971 55 614 0067<br />
            Address: Dubai, United Arab Emirates
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}