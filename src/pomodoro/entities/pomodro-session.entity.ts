import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema({
  timestamps: true,
})
export class PomodoroSession extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, default: 0 })
  duration: number;

  @Prop({ default: 'work' })
  mode: string;

  @Prop({ default: true })
  completed: boolean;

  @Prop({ default: Date.now })
  startTime: Date;

  @Prop()
  endTime: Date;

  @Prop()
  taskId: string;
}

export const PomodoroSessionSchema = SchemaFactory.createForClass(PomodoroSession);