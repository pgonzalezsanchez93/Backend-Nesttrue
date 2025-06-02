import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";



@Schema({ timestamps: true })
export class User {
    _id: string;
     
    @Prop({unique: true, required: true})
    email: string;

    @Prop({ required: true, minlength: 3})
    name: string;

    @Prop({ minlength: 6, required: true})
    password?: string;

    @Prop({ default: true})
    isActive: boolean;

    @Prop({ type: [String], default: ['user'] }) // user o admin
    roles: string[];

    @Prop({ type: Date, default: Date.now })
    lastLogin: Date;

    @Prop({ type: Object, default: {} })
    preferences: {
        theme?: string;
        emailNotifications?: boolean;
        pushNotifications?: boolean;
        avatarColor?: string;
        bio?: string;
        location?: string;
        website?: string;
        taskStats?: {
            completed: number;
            pending: number;
            lists: number;
        };
        pomodoroSettings?: {
            workDuration: number;
            shortBreakDuration: number;
            longBreakDuration: number;
            sessionsUntilLongBreak?: number;
            autoStartBreaks?: boolean;
            autoStartPomodoros?: boolean;
            soundEnabled?: boolean;
            notificationsEnabled?: boolean;
        }
    };

    @Prop({ type: String })
    resetPasswordToken?: string;
    
    @Prop({ type: Date })
    resetPasswordExpires?: Date;
   
    createdAt?: Date;
    updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);