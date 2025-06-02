import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MockEmailService {
  private readonly logger = new Logger(MockEmailService.name);

  async sendPasswordResetEmail(
    to: string,
    name: string,
    resetUrl: string,
  ): Promise<void> {
    this.logger.debug(`[MOCK EMAIL] Sending password reset email to ${to}`);
    this.logger.debug(`[MOCK EMAIL] Name: ${name}`);
    this.logger.debug(`[MOCK EMAIL] Reset URL: ${resetUrl}`);
  }

  async sendWelcomeEmail(
    to: string,
    name: string,
  ): Promise<void> {
    this.logger.debug(`[MOCK EMAIL] Sending welcome email to ${to}`);
    this.logger.debug(`[MOCK EMAIL] Name: ${name}`);
  }
}