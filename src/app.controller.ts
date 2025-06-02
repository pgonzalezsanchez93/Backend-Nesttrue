import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'CozyApp Backend is running!';
  }

  @Get('api/health')
  healthCheck(): object {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'cozyapp-backend'
    };
  }
}