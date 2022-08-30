import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

// eslint-disable-next-line no-use-before-define
export type AppointmentDocument = Appointment & Document;

@Schema()
export class Appointment {
  _id: string;

  @Prop()
  date: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  })
  user: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'doctor',
  })
  doctor: string;

  @Prop()
  active: boolean;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
