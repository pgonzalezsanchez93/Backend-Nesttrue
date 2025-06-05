import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../entities/user.entity';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/jwt-payload';
import { LoginResponse } from '../interfaces/login-response';
import { RegisterUserDto, UpdateAuthDto, CreateUserDto, LoginDto, UpdateProfileDto, UpdateUserPreferencesDto, TaskStatsDto } from '../dto';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from 'src/shared/services/email.service';

@Injectable()
export class AuthService {

 constructor( 
    @InjectModel( User.name) 
    private userModel: Model<User>,
    private jwtService: JwtService,
    private readonly emailService: EmailService ){}

async create(createUserDto: CreateUserDto) {
  try {
    const { password, ...userData } = createUserDto;
    
    const roles = userData.isAdmin ? ['admin', 'user'] : ['user'];
    
    const newUser = new this.userModel({
      password: bcryptjs.hashSync(password, 10),
      ...userData,
      roles
    });

    await newUser.save();
    const { password:_, ...user } = newUser.toJSON();

    return user; 
  } catch (error) {
    if(error.code === 11000) {
      throw new BadRequestException(`${createUserDto.email} ya existe`);
    }
    throw new InternalServerErrorException('Algo terrible sucedió');
  }
}

async register(registerDto: RegisterUserDto): Promise<LoginResponse> {
    try {
      console.log(' Iniciando registro para:', registerDto.email);
      
      const user = await this.create(registerDto);
      console.log('✅Usuario registrado exitosamente:', user.email);
      

      try {
        await this.emailService.sendWelcomeEmail(user.email, user.name);
        console.log(' Email de bienvenida enviado a:', user.email);
      } catch (emailError) {
        console.warn(' No se pudo enviar email de bienvenida:', emailError.message);
       
      }
      
      const token = this.getJwtToken({ id: user._id });
      console.log(' Token generado para usuario:', user._id);
      
      return {
        user: user,
        token: token
      };
    } catch (error) {
      console.error(' Error en registro:', error);
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
  try {
    const user = await this.userModel.findOne({ email });
    
    
    const securityMessage = 'Si el correo existe en nuestra base de datos, recibirás un enlace para restablecer tu contraseña.';
    
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return { message: securityMessage };
    }

    const resetToken = uuidv4();
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // 1 hora

    await this.userModel.findByIdAndUpdate(
      user._id,
      { 
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpires
      }
    );


    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/auth/reset-password?token=${resetToken}`;
      
    
      await this.emailService.sendPasswordResetEmail(user.email, user.name, resetUrl);
      
      console.log(` Password reset email sent successfully to: ${email}`);
      console.log(` Reset URL: ${resetUrl}`);
      
    } catch (emailError) {
      console.error(' Error sending password reset email:', emailError);
      
      if (process.env.NODE_ENV !== 'production') {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/auth/reset-password?token=${resetToken}`;
        console.log(` DESARROLLO - Token de reset: ${resetToken}`);
        console.log(` DESARROLLO - URL de reset: ${resetUrl}`);
      }
    }
    
    return { message: securityMessage };
    
  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    throw new InternalServerErrorException('Error al procesar la solicitud de restablecimiento');
  }
}

async login(loginDto: LoginDto): Promise<LoginResponse> {
  const { email, password } = loginDto;

  const user = await this.userModel.findOne({ email: email});

  if(!user) {
    throw new UnauthorizedException('Credenciales no válidas - email');
  }
  if(!bcryptjs.compareSync(password, user.password!)) {
    throw new UnauthorizedException('Credenciales no válidas - password');
  }

  await this.userModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });

  const { password:_, ...rest } = user.toJSON();

  return {
    user: rest,
    token: this.getJwtToken({ id: user.id}),
  };
}

async findAll(active?: string, role?: string): Promise<User[]> {
  let query = {};
  
  if (active === 'true') {
    query = { ...query, isActive: true };
  } else if (active === 'false') {
    query = { ...query, isActive: false };
  }
  
  if (role === 'admin') {
    query = { ...query, roles: 'admin' };
  } else if (role === 'user') {
    query = { ...query, roles: { $nin: ['admin'] } };
  }
  
  return this.userModel.find(query);
}

async findUserById(id: string) {
  const user = await this.userModel.findById(id);
  if (!user) {
    throw new NotFoundException(`Usuario con id ${id} no encontrado`);
  }
  
  const { password, ...rest } = user.toJSON();
  return rest;
}

async remove(id: string) {
  const user = await this.userModel.findByIdAndDelete(id);
  
  if (!user) {
    throw new NotFoundException(`Usuario con id ${id} no encontrado`);
  }
  
  return { message: 'Usuario eliminado correctamente' };
}

getJwtToken(payload: JwtPayload) {
  const token = this.jwtService.sign(payload);
  return token;
}

async getUserDashboard(id: string) {
  try {
    const user = await this.userModel.findById(id);
    
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    
    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        lastLogin: user.lastLogin,
        preferences: user.preferences
      },
      dashboardId: `dashboard-${user._id}`,
    };
  } catch (error) {
    this.handleExceptions(error);
  }
}

async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
  try {
    const user = await this.userModel.findById(id);
    
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    
    if (updateProfileDto.newPassword) {
      if (!updateProfileDto.currentPassword) {
        throw new BadRequestException('La contraseña actual es obligatoria');
      }
      
      if (!bcryptjs.compareSync(updateProfileDto.currentPassword, user.password!)) {
        throw new BadRequestException('La contraseña actual es incorrecta');
      }
      
      const hashedPassword = bcryptjs.hashSync(updateProfileDto.newPassword, 10);
      
      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        { 
          name: updateProfileDto.name,
          password: hashedPassword 
        },
        { new: true }
      );
      
      if (!updatedUser) {
        throw new NotFoundException(`Error al actualizar el perfil del usuario`);
      }
      
      const { password, ...result } = updatedUser.toJSON();
      return result;
    } else {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        { name: updateProfileDto.name },
        { new: true }
      );
      
      if (!updatedUser) {
        throw new NotFoundException(`Error al actualizar el perfil del usuario`);
      }
      
      const { password, ...result } = updatedUser.toJSON();
      return result;
    }
  } catch (error) {
    this.handleExceptions(error);
  }
}

async updatePreferences(id: string, preferencesDto: UpdateUserPreferencesDto) {
  try {
    const user = await this.userModel.findById(id);
    
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    if (!user.preferences) {
      user.preferences = {};
    }
    
    
    if (preferencesDto.pomodoroSettings) {
      const existingPomodoro = user.preferences.pomodoroSettings || {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4,
        autoStartBreaks: false,
        autoStartPomodoros: false,
        soundEnabled: true,
        notificationsEnabled: true
      };
      
      user.preferences.pomodoroSettings = {
        workDuration: preferencesDto.pomodoroSettings.workDuration ?? existingPomodoro.workDuration ?? 25,
        shortBreakDuration: preferencesDto.pomodoroSettings.shortBreakDuration ?? existingPomodoro.shortBreakDuration ?? 5,
        longBreakDuration: preferencesDto.pomodoroSettings.longBreakDuration ?? existingPomodoro.longBreakDuration ?? 15,
        sessionsUntilLongBreak: preferencesDto.pomodoroSettings.sessionsUntilLongBreak ?? existingPomodoro.sessionsUntilLongBreak ?? 4,
        autoStartBreaks: preferencesDto.pomodoroSettings.autoStartBreaks ?? existingPomodoro.autoStartBreaks ?? false,
        autoStartPomodoros: preferencesDto.pomodoroSettings.autoStartPomodoros ?? existingPomodoro.autoStartPomodoros ?? false,
        soundEnabled: preferencesDto.pomodoroSettings.soundEnabled ?? existingPomodoro.soundEnabled ?? true,
        notificationsEnabled: preferencesDto.pomodoroSettings.notificationsEnabled ?? existingPomodoro.notificationsEnabled ?? true
      };
    }
    
    
    if (preferencesDto.taskStats) {
      const existingStats = user.preferences.taskStats || {
        completed: 0,
        pending: 0,
        lists: 0
      };
      
      user.preferences.taskStats = {
        completed: preferencesDto.taskStats.completed ?? existingStats.completed ?? 0,
        pending: preferencesDto.taskStats.pending ?? existingStats.pending ?? 0,
        lists: preferencesDto.taskStats.lists ?? existingStats.lists ?? 0
      };
    }
 
    Object.keys(preferencesDto).forEach(key => {
      if (key !== 'pomodoroSettings' && key !== 'taskStats' && preferencesDto[key] !== undefined) {
        user.preferences[key] = preferencesDto[key];
      }
    });
    
    const updatedUser = await user.save();
    
    const { password, ...result } = updatedUser.toJSON();
    return result;
  } catch (error) {
    this.handleExceptions(error);
  }
}

async toggleUserStatus(id: string) {
  try {
    const user = await this.userModel.findById(id);
    
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { isActive: !user.isActive },
      { new: true }
    );
    
    if (!updatedUser) {
      throw new NotFoundException(`Error al actualizar el estado del usuario`);
    }
    
    const { password, ...result } = updatedUser.toJSON();
    return result;
  } catch (error) {
    this.handleExceptions(error);
  }
}

async updateUserRole(id: string, isAdmin: boolean) {
  try {
    const user = await this.userModel.findById(id);
    
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    const roles = isAdmin ? ['admin', 'user'] : ['user'];
    
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { roles },
      { new: true }
    );
    
    if (!updatedUser) {
      throw new NotFoundException(`Error al actualizar el rol del usuario`);
    }
    
    const { password, ...result } = updatedUser.toJSON();
    return result;
  } catch (error) {
    this.handleExceptions(error);
  }
}

async forgotPassword(email: string) {
  try {
    const user = await this.userModel.findOne({ email });
    
    if (!user) {
      return { message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña' };
    }

    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    await this.userModel.findByIdAndUpdate(
      user._id,
      { 
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry
      }
    );
    
    return { 
      message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña',
      token: resetToken
    };
  } catch (error) {
    this.handleExceptions(error);
  }
}

async resetPassword(token: string, newPassword: string): Promise<void> {
  const user = await this.userModel.findOne({ 
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() } 
  });

  if (!user) {
     throw new BadRequestException('Token inválido o expirado');
  }

  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(newPassword, salt);

  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  
  await user.save();
}

async getUserStats() {
  try {
    const totalUsers = await this.userModel.countDocuments();
    const activeUsers = await this.userModel.countDocuments({ isActive: true });
    const inactiveUsers = await this.userModel.countDocuments({ isActive: false });
    const adminUsers = await this.userModel.countDocuments({ roles: 'admin' });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsers = await this.userModel.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActiveUsers = await this.userModel.countDocuments({
      lastLogin: { $gte: sevenDaysAgo }
    });
    
    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      newUsers,
      recentActiveUsers
    };
  } catch (error) {
    this.handleExceptions(error);
  }
}

private handleExceptions(error: any) {
  if (error.code === 11000) {
    throw new BadRequestException(`El usuario ya existe en la base de datos ${JSON.stringify(error.keyValue)}`);
  }
  if (error.status === 400 || error.status === 404) {
    throw error;
  }
  console.error(error);
  throw new InternalServerErrorException('Error inesperado, revisa los logs del servidor');
}

async updateUserPreferences(
  userId: string, 
  preferences: { theme?: string; emailNotifications?: boolean; pushNotifications?: boolean }
): Promise<User> {
  try {
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    
    user.preferences = {
      ...user.preferences,
      ...preferences
    };

    await user.save();
    
    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword as User;
    
  } catch (error) {
    throw new BadRequestException('Error al actualizar las preferencias');
  }
}

async updateUserStats(userId: string, taskStats: TaskStatsDto) {
  try {
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new NotFoundException(`Usuario con id ${userId} no encontrado`);
    }
    
    if (!user.preferences) {
      user.preferences = {};
    }
    
    user.preferences.taskStats = {
      completed: taskStats.completed || 0,
      pending: taskStats.pending || 0,
      lists: taskStats.lists || 0
    };
    
    const updatedUser = await user.save();
    
    const { password, ...result } = updatedUser.toJSON();
    return result;
  } catch (error) {
    this.handleExceptions(error);
  }
}

async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  const user = await this.userModel.findById(userId);
  if (!user) {
    throw new NotFoundException('Usuario no encontrado');
  }

  if (!user.password) {
    throw new UnauthorizedException('El usuario no tiene contraseña configurada');
  }

  const isPasswordValid = await bcryptjs.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedException('Contraseña actual incorrecta');
  }

  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(newPassword, salt);

  user.password = hashedPassword;
  await user.save();
}

}