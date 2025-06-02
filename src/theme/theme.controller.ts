import { Controller, Get, Put, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ThemeService } from './theme.service';
import { AuthGuard } from '../auth/guards/auth/auth.guard';
import { UserOwnerGuard } from '../auth/guards/user-owner/user-owner.guard';

@Controller('themes') 
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Get()
  getAvailableThemes() {
    return this.themeService.getAvailableThemes();
  }

  @UseGuards(AuthGuard, UserOwnerGuard)
  @Put('users/:userId/theme')
  updateUserTheme(
    @Param('userId') userId: string,
    @Body() body: { theme: string }
  ) {
    return this.themeService.updateUserTheme(userId, body.theme);
  }
}