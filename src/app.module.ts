import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AppointmentModule } from './appointment/appointment.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(
      'mongodb+srv://root:root@cluster0.37srx.mongodb.net/?retryWrites=true&w=majority',
    ),
    AuthModule,
    UserModule,
    AppointmentModule,
  ],
})
export class AppModule {}
