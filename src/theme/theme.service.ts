import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ThemeService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>
  ) {}

  getAvailableThemes() {
    return [
      { id: 'default', name: 'Predeterminado', primaryColor: '#3f51b5' },
      { id: 'dark', name: 'Oscuro', primaryColor: '#2c2c2c' },
      { id: 'light', name: 'Claro', primaryColor: '#f5f5f5' },
      { id: 'nature', name: 'Naturaleza', primaryColor: '#4caf50' },
      { id: 'ocean', name: 'Océano', primaryColor: '#03a9f4' }
    ];
  }

  async updateUserTheme(userId: string, theme: string) {
    const availableThemes = this.getAvailableThemes().map(t => t.id);
    
    if (!availableThemes.includes(theme)) {
      theme = 'default'; 
    }

    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (!user.preferences) {
      user.preferences = {};
    }
    
    user.preferences.theme = theme;
    
    await user.save();
    
    return user;
  }
}