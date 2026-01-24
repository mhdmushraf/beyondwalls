// HTML Email Templates for BeyondWalls
// Modern, responsive email designs

export const EmailTemplates = {
  // Base template wrapper
  baseTemplate(content, preheader = "") {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>BeyondWalls</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .preheader { display: none; max-height: 0; overflow: hidden; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9;">
  <span class="preheader" style="display: none; max-height: 0; overflow: hidden;">${preheader}</span>
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  },

  // Header with gradient
  header() {
    return `
<tr>
  <td style="background: linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #8b5cf6 100%); padding: 40px 40px 30px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center">
          <div style="background-color: rgba(255,255,255,0.2); width: 64px; height: 64px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="3" width="20" height="14" rx="2" stroke="white" stroke-width="2"/>
              <path d="M2 7L12 13L22 7" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">BeyondWalls</h1>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500;">Advertise Beyond Boundaries</p>
        </td>
      </tr>
    </table>
  </td>
</tr>
    `.trim();
  },

  // Footer
  footer() {
    return `
<tr>
  <td style="background-color: #1e293b; padding: 32px 40px; text-align: center;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
            📧 <a href="mailto:info@beyondwalls.ae" style="color: #a78bfa; text-decoration: none;">info@beyondwalls.ae</a><br>
            📞 <a href="tel:+971556140067" style="color: #a78bfa; text-decoration: none;">+971 55 614 0067</a><br>
            💬 <a href="https://wa.me/971556140067" style="color: #a78bfa; text-decoration: none;">WhatsApp Support</a>
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-top: 20px;">
          <p style="margin: 0 0 12px; color: #64748b; font-size: 12px;">Follow us on social media</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
            <tr>
              <td style="padding: 0 8px;"><a href="https://instagram.com/beyondwalls.ae" style="color: #a78bfa; text-decoration: none; font-size: 20px;">📷</a></td>
              <td style="padding: 0 8px;"><a href="https://linkedin.com/company/beyondwalls" style="color: #a78bfa; text-decoration: none; font-size: 20px;">💼</a></td>
              <td style="padding: 0 8px;"><a href="https://twitter.com/beyondwalls" style="color: #a78bfa; text-decoration: none; font-size: 20px;">🐦</a></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-top: 20px;">
          <p style="margin: 0; color: #475569; font-size: 11px;">
            © ${new Date().getFullYear()} BeyondWalls. All rights reserved.<br>
            <a href="https://beyondwalls.ae/terms" style="color: #64748b; text-decoration: none;">Terms</a> • 
            <a href="https://beyondwalls.ae/privacy" style="color: #64748b; text-decoration: none;">Privacy</a>
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>
    `.trim();
  },

  // Welcome email
  welcome(userName, userRole) {
    const content = `
${this.header()}
<tr>
  <td style="padding: 40px;">
    <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 24px; font-weight: 700;">Welcome to BeyondWalls! 🎉</h2>
    <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">Dear ${userName},</p>
    
    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #0ea5e9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0; color: #0c4a6e; font-size: 15px; line-height: 1.6;">
        <strong>🎯 Your account is under review</strong><br>
        Our team will verify your information within 24-48 hours. You'll receive a confirmation email once approved!
      </p>
    </div>

    <h3 style="margin: 24px 0 16px; color: #0f172a; font-size: 18px; font-weight: 600;">💡 While You Wait</h3>
    ${userRole === 'advertiser' ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="padding: 12px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td width="40" valign="top" style="padding-right: 12px;">
                <div style="background-color: #ddd6fe; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px;">📺</div>
              </td>
              <td style="color: #475569; font-size: 15px; line-height: 1.5;">Explore 500+ premium screens across UAE</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td width="40" valign="top" style="padding-right: 12px;">
                <div style="background-color: #ddd6fe; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px;">🎯</div>
              </td>
              <td style="color: #475569; font-size: 15px; line-height: 1.5;">Plan your first campaign strategy</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td width="40" valign="top" style="padding-right: 12px;">
                <div style="background-color: #ddd6fe; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px;">💡</div>
              </td>
              <td style="color: #475569; font-size: 15px; line-height: 1.5;">Check out our advertising tips & best practices</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ` : `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="padding: 12px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td width="40" valign="top" style="padding-right: 12px;">
                <div style="background-color: #dcfce7; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px;">💰</div>
              </td>
              <td style="color: #475569; font-size: 15px; line-height: 1.5;">Learn about our 70% revenue share model</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td width="40" valign="top" style="padding-right: 12px;">
                <div style="background-color: #dcfce7; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px;">📄</div>
              </td>
              <td style="color: #475569; font-size: 15px; line-height: 1.5;">Prepare your venue documentation</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td width="40" valign="top" style="padding-right: 12px;">
                <div style="background-color: #dcfce7; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px;">⭐</div>
              </td>
              <td style="color: #475569; font-size: 15px; line-height: 1.5;">Explore venue owner success stories</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    `}

    <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-top: 32px;">
      <h3 style="margin: 0 0 16px; color: #0f172a; font-size: 18px; font-weight: 600;">🌟 Why BeyondWalls?</h3>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 8px 0; color: #475569; font-size: 14px;">✓ Self-serve platform - Launch in 30 minutes</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #475569; font-size: 14px;">✓ No long-term contracts</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #475569; font-size: 14px;">✓ Real-time analytics & reporting</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #475569; font-size: 14px;">✓ AI-powered campaign optimization</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #475569; font-size: 14px;">✓ 24/7 customer support</td>
        </tr>
      </table>
    </div>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 32px;">
      <tr>
        <td align="center">
          <a href="https://beyondwalls.ae" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px;">Visit Dashboard</a>
        </td>
      </tr>
    </table>
  </td>
</tr>
${this.footer()}
    `;
    return this.baseTemplate(content, "Welcome to BeyondWalls - Your account is being reviewed");
  },

  // Campaign approved
  campaignApproved(userName, campaignName, screenName, venueName, city, startDate, endDate) {
    const content = `
${this.header()}
<tr>
  <td style="padding: 40px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background: linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; margin-bottom: 16px;">✅</div>
      <h2 style="margin: 0; color: #0f172a; font-size: 28px; font-weight: 700;">Campaign Approved!</h2>
    </div>
    
    <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">Dear ${userName},</p>
    
    <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-left: 4px solid #10b981; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
      <p style="margin: 0; color: #065f46; font-size: 16px; font-weight: 600; line-height: 1.6;">
        🎉 Great news! Your campaign is now live and reaching audiences.
      </p>
    </div>

    <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 20px; color: #0f172a; font-size: 18px; font-weight: 600;">📋 Campaign Details</h3>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-size: 13px; font-weight: 500;">CAMPAIGN NAME</span><br>
            <span style="color: #0f172a; font-size: 15px; font-weight: 600;">${campaignName}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-size: 13px; font-weight: 500;">SCREEN & LOCATION</span><br>
            <span style="color: #0f172a; font-size: 15px; font-weight: 600;">📺 ${screenName}</span><br>
            <span style="color: #64748b; font-size: 14px;">📍 ${venueName}, ${city}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0;">
            <span style="color: #64748b; font-size: 13px; font-weight: 500;">CAMPAIGN DURATION</span><br>
            <span style="color: #0f172a; font-size: 15px; font-weight: 600;">📅 ${startDate} → ${endDate}</span>
          </td>
        </tr>
      </table>
    </div>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 32px;">
      <tr>
        <td align="center">
          <a href="https://beyondwalls.ae/MyBookings" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px; margin-right: 12px;">View Campaign</a>
          <a href="https://beyondwalls.ae/AnalyticsDashboard" style="display: inline-block; background-color: #f1f5f9; color: #475569; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px;">Track Analytics</a>
        </td>
      </tr>
    </table>
  </td>
</tr>
${this.footer()}
    `;
    return this.baseTemplate(content, `${campaignName} is now live!`);
  },

  // Email Verification Template
  emailVerification(userName, verificationLink) {
    const content = `
${this.header()}
<tr>
  <td style="padding: 50px 40px; text-align: center;">
    <div style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); width: 100px; height: 100px; border-radius: 24px; margin: 0 auto 32px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 20px 40px rgba(124, 58, 237, 0.25);">
      <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    </div>
    
    <h2 style="color: #0f172a; font-size: 32px; font-weight: 700; margin: 0 0 16px; letter-spacing: -0.5px;">
      Welcome to BeyondWalls! 🎉
    </h2>
    
    <p style="color: #64748b; font-size: 17px; line-height: 1.6; margin: 0 0 40px; max-width: 480px; margin-left: auto; margin-right: auto;">
      Hi <strong style="color: #0f172a;">${userName}</strong>, you're just one click away from revolutionizing your advertising experience.
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
      <tr>
        <td align="center">
          <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-weight: 600; font-size: 17px; box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3); transition: all 0.3s;">
            ✓ Verify Your Email
          </a>
        </td>
      </tr>
    </table>

    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 16px; padding: 24px; margin: 32px 0; text-align: left;">
      <p style="color: #0c4a6e; font-size: 15px; font-weight: 600; margin: 0 0 16px;">
        🚀 What's next after verification?
      </p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 8px 0; color: #0369a1; font-size: 14px;">
            ✨ Launch digital advertising campaigns across UAE
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #0369a1; font-size: 14px;">
            📊 Access real-time analytics and insights
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #0369a1; font-size: 14px;">
            💰 Manage your wallet and bookings effortlessly
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #0369a1; font-size: 14px;">
            🎯 Reach highly targeted audiences in premium venues
          </td>
        </tr>
      </table>
    </div>

    <div style="margin-top: 40px; padding: 24px; background: #fef3c7; border-radius: 12px; border-left: 4px solid #f59e0b;">
      <p style="color: #78350f; font-size: 14px; margin: 0; text-align: left;">
        <strong style="display: block; margin-bottom: 8px;">⏰ Time-Sensitive</strong>
        This verification link will expire in <strong>24 hours</strong> for your security. Please verify your email as soon as possible.
      </p>
    </div>

    <div style="margin-top: 32px; padding-top: 32px; border-top: 2px solid #e2e8f0;">
      <p style="color: #94a3b8; font-size: 13px; margin: 0 0 12px; text-align: center;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="margin: 0;">
        <a href="${verificationLink}" style="color: #7c3aed; font-size: 12px; word-break: break-all; text-decoration: none;">${verificationLink}</a>
      </p>
    </div>

    <div style="margin-top: 32px; padding: 20px; background: #f8fafc; border-radius: 12px;">
      <p style="color: #64748b; font-size: 13px; margin: 0; text-align: center;">
        Didn't create an account? You can safely ignore this email.
      </p>
    </div>
  </td>
</tr>
${this.footer()}
    `;
    return this.baseTemplate(content, `Verify your email to get started with BeyondWalls`);
  },

  // Admin notification for new user
  adminNewUser(userName, userEmail, userPhone, accountType, userRole, companyName = null) {
    const content = `
<tr>
  <td style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%); padding: 40px; text-align: center;">
    <div style="background-color: rgba(255,255,255,0.2); width: 64px; height: 64px; border-radius: 16px; display: inline-block; margin-bottom: 16px;">
      <span style="font-size: 32px; line-height: 64px;">🔔</span>
    </div>
    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">New User Registration</h1>
    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Action Required - Admin Panel</p>
  </td>
</tr>
<tr>
  <td style="padding: 40px;">
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
      <p style="margin: 0; color: #92400e; font-size: 15px; font-weight: 600;">
        ⚠️ A new user has registered and is awaiting your approval
      </p>
    </div>

    <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 20px; color: #0f172a; font-size: 18px; font-weight: 600;">👤 User Details</h3>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-size: 13px;">NAME</span><br>
            <span style="color: #0f172a; font-size: 15px; font-weight: 600;">${userName}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-size: 13px;">EMAIL</span><br>
            <span style="color: #0f172a; font-size: 15px; font-weight: 600;">${userEmail}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-size: 13px;">PHONE</span><br>
            <span style="color: #0f172a; font-size: 15px; font-weight: 600;">${userPhone || "N/A"}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-size: 13px;">ACCOUNT TYPE</span><br>
            <span style="color: #0f172a; font-size: 15px; font-weight: 600; text-transform: capitalize;">${accountType}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-size: 13px;">USER ROLE</span><br>
            <span style="color: #0f172a; font-size: 15px; font-weight: 600; text-transform: capitalize;">${userRole.replace('_', ' ')}</span>
          </td>
        </tr>
        ${companyName ? `
        <tr>
          <td style="padding: 10px 0;">
            <span style="color: #64748b; font-size: 13px;">COMPANY</span><br>
            <span style="color: #0f172a; font-size: 15px; font-weight: 600;">${companyName}</span>
          </td>
        </tr>
        ` : ''}
      </table>
    </div>

    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
      <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
        <strong>📅 Registration Date:</strong> ${new Date().toLocaleDateString('en-AE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center">
          <a href="https://beyondwalls.ae/AdminUserApprovals" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 600; font-size: 16px;">Review & Approve Now</a>
        </td>
      </tr>
    </table>
  </td>
</tr>
${this.footer()}
    `;
    return this.baseTemplate(content, `New user registration: ${userName}`);
  }
};