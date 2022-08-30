import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SingUpDto, AuthCredentialsDto } from './dto';
import { JwtPayload } from './jwt-payload.interface';
import { SecurityService } from './security.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private securityService: SecurityService,
  ) {}

  async signUp(singUp: SingUpDto): Promise<{ accessToken: string }> {
    try {
      const password = this.securityService.encryptPassword(singUp.password);
      const user = await this.userService.create({ ...singUp, password });
      // eslint-disable-next-line no-underscore-dangle
      const payload: JwtPayload = { _id: user._id };
      const accessToken = this.jwtService.sign(payload);

      return { accessToken };
    } catch (error) {
      this.logger.error(`InternalServerErrorException`, error);
      throw new InternalServerErrorException(error);
    }
  }

  async signIn(
    authCredentials: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    try {
      const user = await this.userService.getByEmail(authCredentials.email);
      const checkPassword = this.securityService.comparePassword(
        authCredentials.password,
        user.password,
      );

      if (!user || !checkPassword) {
        this.logger.error('Invalid credentials');
        throw new UnauthorizedException('Invalid credentials');
      }

      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { _id } = user;

      const payload: JwtPayload = { _id };
      const accessToken = this.jwtService.sign(payload);

      return { accessToken };
    } catch (error) {
      this.logger.debug(error, 'login error');
      throw new InternalServerErrorException(error);
    }
  }
}
