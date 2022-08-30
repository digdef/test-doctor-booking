import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  private logger = new Logger('UserService');
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async getAll(type: string): Promise<User[]> {
    try {
      const users = await this.userModel
        .aggregate([
          {
            $match: { type },
          },
          {
            $lookup: {
              from: 'appointments', // collection name in db
              let: { user: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: [true, '$active'] },
                        {
                          $or: [
                            { $eq: ['$user', '$$user'] },
                            { $eq: ['$doctor', '$$user'] },
                          ],
                        },
                      ],
                    },
                  },
                },
              ],
              as: 'appointments',
            },
          },
        ])
        .exec();
      return users.map((el) => {
        const appointments = el.appointments.map((appointment) => {
          return new Date(appointment.date).getTime() < Date.now()
            ? {
                ...appointment,
                active: false,
              }
            : appointment;
        });
        return { ...el, appointments };
      });
    } catch (error) {
      this.logger.error(`InternalServerErrorException`, error);
      throw new InternalServerErrorException(error);
    }
  }

  async getById(id: string): Promise<User> {
    try {
      return await this.userModel.findById(id);
    } catch (error) {
      this.logger.error(`InternalServerErrorException`, error);
      throw new InternalServerErrorException(error);
    }
  }

  async getUser(id: string): Promise<User> {
    try {
      return await this.userModel.findById(id);
    } catch (error) {
      this.logger.error(`InternalServerErrorException`, error);
      throw new InternalServerErrorException(error);
    }
  }

  async getByEmail(email: string): Promise<User> {
    try {
      return await this.userModel.findOne({ email });
    } catch (error) {
      this.logger.error(`InternalServerErrorException`, error);
      throw new InternalServerErrorException(error);
    }
  }

  async create(userDto: CreateUserDto): Promise<User> {
    try {
      // eslint-disable-next-line new-cap
      const newUser = new this.userModel(userDto);
      return await newUser.save();
    } catch (error) {
      this.logger.error(`InternalServerErrorException`, error);
      throw new InternalServerErrorException(error);
    }
  }

  async remove(id: string): Promise<User> {
    try {
      return await this.userModel.findByIdAndRemove(id);
    } catch (error) {
      this.logger.error(`InternalServerErrorException`, error);
      throw new InternalServerErrorException(error);
    }
  }
}
