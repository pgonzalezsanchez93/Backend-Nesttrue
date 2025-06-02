import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class GlobalEvent extends Document {
    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ type: Date, required: true })
    startDate: Date;

    @Prop({ type: Date, required: true })
    endDate: Date;

    @Prop({ default: true })
    isActive: boolean;
}

export const GlobalEventSchema = SchemaFactory.createForClass(GlobalEvent)