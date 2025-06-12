// Email service for sending verification emails
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    // Using EmailJS for client-side email sending
    // In production, you'd use a backend service
    this.apiKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
    this.apiUrl = 'https://api.emailjs.com/api/v1.0/email/send';
  }

  private createVerificationTemplate(fullName: string, verificationCode: string): EmailTemplate {
    const subject = 'Verify Your Byte2Bite Account';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Byte2Bite</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #059669, #10b981); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; }
          .header p { color: #d1fae5; margin: 10px 0 0 0; font-size: 16px; }
          .content { padding: 40px 20px; }
          .verification-box { background-color: #f0fdf4; border: 2px solid #059669; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
          .verification-code { font-size: 36px; font-weight: bold; color: #059669; letter-spacing: 8px; margin: 20px 0; font-family: 'Courier New', monospace; }
          .button { display: inline-block; background-color: #059669; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { background-color: #f9fafb; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer p { color: #6b7280; margin: 5px 0; font-size: 14px; }
          .logo { display: inline-flex; align-items: center; justify-content: center; margin-bottom: 10px; }
          .logo svg { width: 32px; height: 32px; margin-right: 10px; fill: #ffffff; }
          .warning { background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .warning p { color: #92400e; margin: 0; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
                <path d="M7 2v20"/>
                <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
              </svg>
              <h1>Byte2Bite</h1>
            </div>
            <p>Reducing Food Waste, One Byte at a Time</p>
          </div>
          
          <div class="content">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to Byte2Bite, ${fullName}!</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Thank you for joining our mission to reduce food waste and help communities in need. 
              To complete your account setup and start making a difference, please verify your email address.
            </p>
            
            <div class="verification-box">
              <h3 style="color: #059669; margin-top: 0;">Your Verification Code</h3>
              <div class="verification-code">${verificationCode}</div>
              <p style="color: #6b7280; margin-bottom: 0; font-size: 14px;">
                Enter this code in the verification screen to activate your account
              </p>
            </div>
            
            <div class="warning">
              <p><strong>Important:</strong> This verification code will expire in 24 hours. If you don't verify your email within this time, you'll need to register again.</p>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Once verified, you'll be able to:
            </p>
            <ul style="color: #4b5563; font-size: 16px; line-height: 1.8; padding-left: 20px;">
              <li>Connect with local food donors and NGOs</li>
              <li>Track your environmental impact</li>
              <li>Help reduce food waste in your community</li>
              <li>Make a meaningful difference in fighting hunger</li>
            </ul>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If you didn't create this account, please ignore this email. Your email address will not be added to our system.
            </p>
          </div>
          
          <div class="footer">
            <p><strong>Byte2Bite Team</strong></p>
            <p>Making food waste reduction accessible to everyone</p>
            <p style="margin-top: 20px;">
              Need help? Contact us at support@byte2bite.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Welcome to Byte2Bite, ${fullName}!

Thank you for joining our mission to reduce food waste and help communities in need.

Your verification code is: ${verificationCode}

Please enter this code in the verification screen to activate your account. This code will expire in 24 hours.

Once verified, you'll be able to:
- Connect with local food donors and NGOs
- Track your environmental impact  
- Help reduce food waste in your community
- Make a meaningful difference in fighting hunger

If you didn't create this account, please ignore this email.

Best regards,
The Byte2Bite Team

Need help? Contact us at support@byte2bite.com
    `;

    return { subject, html, text };
  }

  async sendVerificationEmail(email: string, fullName: string, verificationCode: string): Promise<void> {
    try {
      const template = this.createVerificationTemplate(fullName, verificationCode);
      
      // For development, we'll use a mock email service
      // In production, you would integrate with services like:
      // - SendGrid
      // - Mailgun  
      // - AWS SES
      // - Nodemailer with SMTP
      
      if (import.meta.env.DEV) {
        // Development mode - show email in console and browser
        console.log(`
🚀 BYTE2BITE - Email Verification

To: ${email}
Subject: ${template.subject}

${template.text}
        `);
        
        // Show user-friendly notification in development
        this.showDevelopmentNotification(email, verificationCode, fullName);
        
        // Also show a modal overlay for better visibility
        this.showVerificationModal(email, verificationCode, fullName);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return;
      }
      
      // Production email sending would go here
      // Example with EmailJS (client-side service):
      /*
      const emailData = {
        service_id: 'your_service_id',
        template_id: 'your_template_id', 
        user_id: this.apiKey,
        template_params: {
          to_email: email,
          to_name: fullName,
          verification_code: verificationCode,
          subject: template.subject
        }
      };
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
      */
      
      // For now, simulate successful sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send verification email. Please try again.');
    }
  }

  private showVerificationModal(email: string, code: string, fullName: string): void {
    if (typeof window !== 'undefined') {
      // Remove any existing modal
      const existingModal = document.getElementById('verification-modal');
      if (existingModal) {
        existingModal.remove();
      }

      // Create modal overlay
      const modal = document.createElement('div');
      modal.id = 'verification-modal';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50000;
        font-family: system-ui, -apple-system, sans-serif;
        animation: fadeIn 0.3s ease-out;
      `;

      modal.innerHTML = `
        <div style="
          background: white;
          border-radius: 16px;
          padding: 0;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px rgba(0,0,0,0.3);
          animation: slideUp 0.3s ease-out;
        ">
          <!-- Header -->
          <div style="
            background: linear-gradient(135deg, #059669, #10b981);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 16px 16px 0 0;
          ">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
              <svg style="width: 32px; height: 32px; margin-right: 12px;" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <h2 style="margin: 0; font-size: 24px; font-weight: bold;">📧 Verification Code</h2>
            </div>
            <p style="margin: 0; opacity: 0.9; font-size: 16px;">Development Mode - Email Simulation</p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <div style="text-align: center; margin-bottom: 25px;">
              <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 20px;">Hello ${fullName}!</h3>
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                Your verification email would be sent to:<br>
                <strong style="color: #059669;">${email}</strong>
              </p>
            </div>

            <!-- Verification Code Display -->
            <div style="
              background: linear-gradient(135deg, #f0fdf4, #dcfce7);
              border: 2px solid #059669;
              border-radius: 12px;
              padding: 25px;
              text-align: center;
              margin: 25px 0;
            ">
              <p style="color: #059669; margin: 0 0 10px 0; font-weight: 600; font-size: 14px;">
                YOUR VERIFICATION CODE
              </p>
              <div style="
                font-size: 32px;
                font-weight: bold;
                color: #059669;
                letter-spacing: 6px;
                font-family: 'Courier New', monospace;
                margin: 15px 0;
                padding: 15px;
                background: white;
                border-radius: 8px;
                border: 1px solid #059669;
              ">${code}</div>
              <button onclick="navigator.clipboard.writeText('${code}').then(() => {
                this.textContent = '✓ Copied!';
                setTimeout(() => this.textContent = '📋 Copy Code', 2000);
              })" style="
                background: #059669;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                margin-top: 10px;
              ">📋 Copy Code</button>
            </div>

            <!-- Instructions -->
            <div style="
              background: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
            ">
              <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
                <strong>💡 Development Mode:</strong><br>
                In production, this code would be sent to your email inbox. 
                For now, copy the code above and paste it in the verification form.
              </p>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; gap: 10px; margin-top: 25px;">
              <button onclick="
                navigator.clipboard.writeText('${code}').then(() => {
                  document.getElementById('verification-modal').remove();
                });
              " style="
                flex: 1;
                background: #059669;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                font-size: 14px;
              ">Copy & Close</button>
              
              <button onclick="document.getElementById('verification-modal').remove()" style="
                flex: 1;
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
                padding: 12px 20px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                font-size: 14px;
              ">Close</button>
            </div>

            <!-- Console Info -->
            <div style="
              margin-top: 20px;
              padding: 15px;
              background: #f8fafc;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
            ">
              <p style="color: #475569; margin: 0; font-size: 12px;">
                <strong>🔍 Developer Info:</strong> The verification code is also logged in the browser console (F12 → Console tab)
              </p>
            </div>
          </div>
        </div>
      `;

      // Add animation styles
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);

      // Close modal when clicking outside
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });

      // Close modal with Escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          modal.remove();
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);

      document.body.appendChild(modal);
    }
  }

  private showDevelopmentNotification(email: string, code: string, fullName: string): void {
    if (typeof window !== 'undefined') {
      // Create a more sophisticated notification for development
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #059669, #10b981);
        color: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 400px;
        font-family: system-ui, -apple-system, sans-serif;
        animation: slideIn 0.3s ease-out;
      `;
      
      notification.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <svg style="width: 24px; height: 24px; margin-right: 10px;" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          <strong>📧 Verification Email Sent!</strong>
        </div>
        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 15px;">
          <strong>To:</strong> ${email}<br>
          <strong>Name:</strong> ${fullName}
        </div>
        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 15px;">
          <div style="font-size: 12px; opacity: 0.8; margin-bottom: 5px;">Your verification code:</div>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; font-family: monospace;">${code}</div>
        </div>
        <div style="font-size: 12px; opacity: 0.8; text-align: center;">
          💡 In production, this would be sent to your email inbox
        </div>
        <button onclick="this.parentElement.remove()" style="
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          opacity: 0.7;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">×</button>
      `;
      
      // Add animation styles
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(notification);
      
      // Auto-remove after 15 seconds
      setTimeout(() => {
        if (notification.parentElement) {
          notification.style.animation = 'slideIn 0.3s ease-out reverse';
          setTimeout(() => notification.remove(), 300);
        }
      }, 15000);
    }
  }

  async sendPasswordResetEmail(email: string, fullName: string, resetToken: string): Promise<void> {
    // Similar implementation for password reset emails
    console.log(`Password reset email would be sent to ${email} with token: ${resetToken}`);
  }

  async sendWelcomeEmail(email: string, fullName: string, role: string): Promise<void> {
    // Welcome email after successful verification
    console.log(`Welcome email would be sent to ${email} for role: ${role}`);
  }
}

export const emailService = new EmailService();