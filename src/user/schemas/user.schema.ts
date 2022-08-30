import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Appointment } from '../../appointment/schemas/appointment.schema';

// eslint-disable-next-line no-use-before-define
export type UserDocument = User & Document;

@Schema()
export class User {
  _id: string;

  @Prop({
    required: true,
    unique: true,
  })
  email: string;

  @Prop()
  password: string;

  @Prop()
  // eslint-disable-next-line camelcase
  reg_token: string;

  @Prop()
  // eslint-disable-next-line camelcase
  photo_avatar: string;

  @Prop()
  phone: string;

  @Prop()
  name: string;

  @Prop({
    enum: ['doc', 'user'],
  })
  type: string;

  @Prop()
  spec: string;

  @Prop()
  free: boolean;

  appointments: Appointment[];
}

export const UserSchema = SchemaFactory.createForClass(User);
