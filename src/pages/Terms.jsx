import React from "react";
import { Badge } from "@/components/ui/badge";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead, { PAGE_SEO } from "@/components/SEOHead";

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead {...PAGE_SEO.terms} />
      <PublicNav />

      {/* Hero */}
      <section className="pt-32 pb-12 px-6 bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-amber-100 text-slate-900 mb-6">Legal</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Terms of Service
          </h1>
          <p className="text-slate-600">Last updated: November 25, 2024</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto prose prose-slate prose-lg">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using BeyondWalls' digital out-of-home advertising platform ("Service"), 
            you agree to be bound by these Terms of Service. If you do not agree to these terms, 
            please do not use our Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            BeyondWalls provides a self-serve marketplace connecting advertisers with venue owners 
            for digital out-of-home advertising. Our platform enables:
          </p>
          <ul>
            <li>Advertisers to create and manage advertising campaigns</li>
            <li>Venue owners to register screens and earn revenue</li>
            <li>Display of advertisements on registered screens</li>
          </ul>

          <h2>3. User Accounts</h2>
          <p>
            To use our Service, you must create an account and provide accurate information. 
            You are responsible for maintaining the confidentiality of your account credentials 
            and for all activities under your account.
          </p>

          <h2>4. For Advertisers</h2>
          <h3>4.1 Campaign Content</h3>
          <p>
            You are solely responsible for your advertising content. All content must comply with 
            applicable laws and our content guidelines. We reserve the right to reject or remove 
            any content that violates these terms.
          </p>
          <h3>4.2 Payment Terms</h3>
          <p>
            Campaign costs are calculated based on screen rates and duration. Payment is required 
            upfront via wallet top-up. Refunds for cancelled campaigns are processed within 5-7 business days.
          </p>

          <h2>5. For Venue Owners</h2>
          <h3>5.1 Screen Registration</h3>
          <p>
            You must own or have authorization to use the screens you register. You are responsible 
            for maintaining screen connectivity and proper display of advertisements.
          </p>
          <h3>5.2 Revenue Share</h3>
          <p>
            Venue owners keep 100% of their screen rate. Advertisers pay a service fee on top. 
            Payments are processed weekly or monthly based on your preference.
          </p>

          <h2>6. Prohibited Activities</h2>
          <p>You may not:</p>
          <ul>
            <li>Use the Service for illegal purposes</li>
            <li>Upload harmful, offensive, or inappropriate content</li>
            <li>Interfere with the operation of the Service</li>
            <li>Attempt to gain unauthorized access to accounts or systems</li>
            <li>Misrepresent your identity or affiliation</li>
          </ul>

          <h2>7. Intellectual Property</h2>
          <p>
            The BeyondWalls platform, including its design, features, and content, is owned by 
            BeyondWalls and protected by intellectual property laws. You retain ownership of 
            content you upload but grant us a license to display it on our network.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            BeyondWalls is not liable for any indirect, incidental, or consequential damages 
            arising from your use of the Service. Our total liability shall not exceed the 
            amount paid by you in the 12 months preceding the claim.
          </p>

          <h2>9. Termination</h2>
          <p>
            We may suspend or terminate your account for violation of these terms. You may 
            close your account at any time. Outstanding payments remain due upon termination.
          </p>

          <h2>10. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the Service after 
            changes constitutes acceptance of the new terms.
          </p>

          <h2>11. Governing Law</h2>
          <p>
            These terms are governed by the laws of the United Arab Emirates. Any disputes 
            shall be resolved in the courts of Dubai.
          </p>

          <h2>12. Contact</h2>
          <p>
            For questions about these Terms, contact us at:<br />
            Email: info@linkzoneglobal.com<br />
            Phone: +971 55 614 0067
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}