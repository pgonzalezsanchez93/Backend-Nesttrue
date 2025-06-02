import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class TaskList extends Document {
    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ type: String, default: '#3f51b5' }) // Default to primary color
    color: string;

    @Prop({ type: String, default: 'list' })
    icon: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    userId: string;

    @Prop({ default: true })
    isActive: boolean;
}

export const TaskListSchema = SchemaFactory.createForClass(TaskList);