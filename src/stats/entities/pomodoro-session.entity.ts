import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class PomodoroSession extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  duration: number;

  @Prop({ default: true })
  completed: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Task' })
  taskId: MongooseSchema.Types.ObjectId;

  @Prop()
  notes: string;
}

export const PomodoroSessionSchema = SchemaFactory.createForClass(PomodoroSession);