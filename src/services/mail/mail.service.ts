import nodemailer from 'nodemailer';
import { SettingsRepository } from '../../repositories/settings.repository';
import { config } from '../../config/env';

export class MailService {
  static async getTransporter() {
    try {
      const dbSettings = await SettingsRepository.getSMTPSettings();
      const host = dbSettings?.smtpHost || config.smtp.host;
      const port = dbSettings?.smtpPort || config.smtp.port;
      const user = dbSettings?.smtpUser || config.smtp.user;
      const pass = dbSettings?.smtpPass || config.smtp.pass;

      if (!host || !pass) {
        console.warn('[MailService] SMTP is not configured or password is empty. Mail features are disabled.');
        return null;
      }

      return nodemailer.createTransport({
        host,
        port,
        secure: port === 465, 
        auth: {
          user,
          pass
        },
        tls: {
          rejectUnauthorized: true
        }
      });
    } catch (error) {
      console.error('Error creating mail transporter:', error);
      return null;
    }
  }

  static async getSmtpFrom() {
    const dbSettings = await SettingsRepository.getSMTPSettings();
    return dbSettings?.smtpFrom || config.smtp.from;
  }

  static async sendMail(to: string, subject: string, html: string) {
    const transporter = await this.getTransporter();
    const from = await this.getSmtpFrom();
    
    if (!transporter) {
      console.warn(`[MailService] Skip sending mail to "${to}" because SMTP is not configured.`);
      return null;
    }

    return transporter.sendMail({
      from,
      to,
      subject,
      html
    });
  }
}
