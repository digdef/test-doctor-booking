import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// eslint-disable-next-line import/order
import dotenv = require('dotenv');
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { UserModule } from '../user/user.module';
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
dotenv.config().parsed; // ensure process.env have .env vars

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Appointment.name,
        schema: AppointmentSchema,
      },
    ]),
    forwardRef(() => UserModule),
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
