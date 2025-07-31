import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // For development, use ethereal email or console logging
    if (process.env.NODE_ENV === 'development') {
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
    } else {
      // For production, configure with real SMTP settings
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      }
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.APP_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
    
    const emailOptions: EmailOptions = {
      to: email,
      subject: 'Restablecer contraseña - DevCourses',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Restablecer contraseña</h2>
          <p>Hola,</p>
          <p>Recibiste este email porque solicitaste restablecer tu contraseña en DevCourses.</p>
          <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Restablecer contraseña
            </a>
          </div>
          <p>Este enlace expira en 1 hora por seguridad.</p>
          <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            DevCourses - Educación inclusiva en desarrollo web
          </p>
        </div>
      `,
    };

    await this.sendEmail(emailOptions);
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      console.log('Email transporter not configured. Email would be sent:', options);
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@devcourses.com',
        ...options,
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Email sent (development mode):', info);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}

export const emailService = new EmailService();