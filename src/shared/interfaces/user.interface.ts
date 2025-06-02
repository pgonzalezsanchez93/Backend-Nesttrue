import { PomodoroSettings } from './pomodoro.interface';

export interface UserPreferences {
  theme?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  pomodoroSettings?: PomodoroSettings;
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  roles: string[];
  isActive: boolean;
  preferences: UserPreferences;
  createdAt?: Date;
  updatedAt?: Date;
}
