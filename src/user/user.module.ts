import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
// eslint-disable-next-line import/order
import dotenv = require('dotenv');
import { User, UserSchema } from './schemas/user.schema';
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
dotenv.config().parsed; // ensure process.env have .env vars

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          const schema = UserSchema;
          schema.plugin(require('mongoose-unique-validator'), {
            message: 'already exists',
          });
          return schema;
        },
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
