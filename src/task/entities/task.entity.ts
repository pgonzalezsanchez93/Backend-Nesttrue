import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export enum TaskPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}

export enum TaskStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed'
}

@Schema({ timestamps: true })
export class Task extends Document {
    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ 
        type: String, 
        enum: Object.values(TaskStatus),
        default: TaskStatus.PENDING 
    })
    status: TaskStatus;

    @Prop({ 
        type: String, 
        enum: Object.values(TaskPriority),
        default: TaskPriority.MEDIUM 
    })
    priority: TaskPriority;

    @Prop({ type: Date })
    startDate: Date;

    @Prop({ type: Date })
    dueDate: Date;

    @Prop({ type: Date })
    endDate: Date;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    userId: string;

    @Prop({ type: String })
    listId: string;

    @Prop({ default: false })
    isCompleted: boolean;

    @Prop({ type: Date })
    completedAt: Date;

    @Prop({ type: Boolean, default: true })
    allDay: boolean;

    @Prop({ type: String })
    startTime: string;

    @Prop({ type: String })
    endTime: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);