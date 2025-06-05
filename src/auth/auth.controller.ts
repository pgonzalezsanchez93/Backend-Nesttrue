import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Put, UnauthorizedException, Query, HttpCode, BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from './guards/auth/auth.guard';
import { LoginResponse } from './interfaces/login-response';
import { User } from './entities/user.entity';
import { CreateUserDto, LoginDto, RegisterUserDto, TaskStatsDto, UpdateProfileDto, UpdateUserPreferencesDto } from './dto';
import { AuthService } from './services/auth.service';
import { UserOwnerGuard } from './guards/user-owner/user-owner.guard';
import { AdminGuard } from './guards/admin/admin.guard';
import { GetUser } from './decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/register')
  register(@Body() registerDto: RegisterUserDto) {
    return this.authService.register(registerDto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
@HttpCode(200)
async resetPassword(@Body() body: { token: string, password: string }): Promise<{ message: string }> {
  console.log('🔄 Reset password endpoint called:', {
      hasToken: !!body.token,
      tokenLength: body.token?.length,
      hasPassword: !!body.password,
      timestamp: new Date().toISOString()
    });

  try {
    await this.authService.resetPassword(body.token, body.password);
    
    console.log('Password reset successful');
    return { message: 'Contraseña restablecida con éxito' };
  } catch (error) {
    console.error('Reset password endpoint error:', error);
    throw error;
  }
}

 @Post('password/request-reset')
  @HttpCode(200)
  async requestPasswordReset(@Body() body: { email: string }): Promise<{ message: string }> {
    console.log('🔄 Request password reset endpoint called:', {
      email: body.email,
      timestamp: new Date().toISOString()
    });
    
    try {
      const result = await this.authService.requestPasswordReset(body.email);
      console.log(' Request password reset successful');
      return result;
    } catch (error) {
      console.error(' Request password reset error:', error);
      throw error;
    }
  }


  @UseGuards(AuthGuard)
  @Get('check-token')
  checkToken(@Request() req: Request): LoginResponse {
    const user = req['user'] as User;
    return {
      user,
      token: this.authService.getJwtToken({ id: user._id })
    }
  }

  @UseGuards(AuthGuard)
  @Put('profile')
  updateProfile(@GetUser() user: User, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(user._id, updateProfileDto);
  }

  @UseGuards(AuthGuard)
  @Put('preferences')
@UseGuards(AuthGuard)
async updateUserPreferences(
  @GetUser() user: User,
  @Body() updatePreferencesDto: UpdateUserPreferencesDto
): Promise<User> {
  try {
    return await this.authService.updateUserPreferences(user._id, updatePreferencesDto);
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;
    }
    throw new BadRequestException('Error al actualizar las preferencias del usuario');
  }
}

  @UseGuards(AuthGuard, UserOwnerGuard)
  @Put('users/:userId/stats')
  updateUserStats(
    @Param('userId') id: string, 
    @Body() body: { taskStats: TaskStatsDto }
  ) {
    return this.authService.updateUserStats(id, body.taskStats);
  }

  @UseGuards(AuthGuard)
  @Get('dashboard')
  getUserDashboard(@GetUser() user: User) {
    return this.authService.getUserDashboard(user._id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Post('users')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get('users')
  findAll(@Query('active') active?: string, @Query('role') role?: string) {
    return this.authService.findAll(active, role);
  }

  @UseGuards(AuthGuard)
  @Get('users/:id')
  findOne(@Param('id') id: string, @Request() req: Request) {
    const user = req['user'] as User;
    
    if (user.roles.includes('admin') || user._id === id) {
      return this.authService.findUserById(id);
    }
    throw new UnauthorizedException('You are not authorized to access this user information');
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Patch('users/:id/status')
  toggleUserStatus(@Param('id') id: string) {
    return this.authService.toggleUserStatus(id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body() body: { isAdmin: boolean }) {
    return this.authService.updateUserRole(id, body.isAdmin);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Delete('users/:id')
  removeUser(@Param('id') id: string) {
    return this.authService.remove(id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get('stats/users')
  getUserStats() {
    return this.authService.getUserStats();
  }

  @UseGuards(AuthGuard)
  @Post('password/change')
  @HttpCode(200)
  async changePassword(
    @GetUser('id') userId: string,
    @Body() body: { currentPassword: string, newPassword: string }
  ): Promise<{ message: string }> {
    await this.authService.changePassword(userId, body.currentPassword, body.newPassword);
    return { message: 'Contraseña cambiada con éxito' };
  }
}