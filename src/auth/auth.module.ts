import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
// eslint-disable-next-line import/order
import dotenv = require('dotenv');
import { UserModule } from '../user/user.module';
import { SecurityService } from './security.service';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
dotenv.config().parsed; // ensure process.env have .env vars

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: parseInt(process.env.JWT_EXPIRES_IN, 10),
      },
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, SecurityService],
  exports: [JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
