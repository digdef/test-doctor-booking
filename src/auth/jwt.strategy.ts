import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtPayload } from './jwt-payload.interface';
import { UserService } from '../user/user.service';
import { User } from '../user/schemas/user.schema';
// eslint-disable-next-line import/order
import dotenv = require('dotenv');

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
dotenv.config().parsed;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger('JwtStrategy');
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = payload;
    const user = await this.userService.getUser(_id);
    if (!user) {
      this.logger.error(`User ${user} is not exist`);
      throw new UnauthorizedException();
    }
    return user;
  }
}
