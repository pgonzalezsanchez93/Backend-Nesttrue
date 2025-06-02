import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: parseInt(this.configService.get('EMAIL_PORT') || '587'),
      secure: this.configService.get('EMAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    resetUrl: string,
  ): Promise<void> {
    const mailOptions = {
      from: `"${this.configService.get('EMAIL_FROM_NAME') || 'CozyApp'}" <${this.configService.get('EMAIL_FROM') || 'noreply@cozyapp.com'}>`,
      to,
      subject: 'Restablecer contraseña - CozyApp',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hola, ${name}</h2>
          <p>Recibimos una solicitud para restablecer tu contraseña en CozyApp.</p>
          <p>Haz clic en el siguiente enlace para establecer una nueva contraseña:</p>
          <p>
            <a 
              href="${resetUrl}" 
              style="display: inline-block; background-color: #4caf50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;"
            >
              Restablecer contraseña
            </a>
          </p>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo y tu contraseña seguirá siendo la misma.</p>
          <p>Saludos,<br />Equipo de CozyApp</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Error al enviar el correo de restablecimiento de contraseña');
    }
  }

  async sendWelcomeEmail(
    to: string,
    name: string,
  ): Promise<void> {
    const mailOptions = {
      from: `"${this.configService.get('EMAIL_FROM_NAME') || 'CozyApp'}" <${this.configService.get('EMAIL_FROM') || 'noreply@cozyapp.com'}>`,
      to,
      subject: 'Bienvenido a CozyApp',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>¡Bienvenido a CozyApp, ${name}!</h2>
          <p>Gracias por registrarte en nuestra aplicación.</p>
          <p>Con CozyApp podrás:</p>
          <ul>
            <li>Organizar tus tareas diarias</li>
            <li>Crear listas personalizadas</li>
            <li>Aplicar la técnica Pomodoro para mejorar tu productividad</li>
            <li>Visualizar tu progreso con un calendario interactivo</li>
          </ul>
          <p>¡Esperamos que disfrutes organizando tu tiempo con nosotros!</p>
          <p>Saludos,<br />Equipo de CozyApp</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending welcome email:', error);
     
    }
  }
}