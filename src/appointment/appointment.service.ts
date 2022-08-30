import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  Inject,
  forwardRef,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Model } from 'mongoose';
// eslint-disable-next-line import/no-extraneous-dependencies
import { CronJob } from 'cron';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment, AppointmentDocument } from './schemas/appointment.schema';
import { User } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const log = require('log-to-file');

@Injectable()
export class AppointmentService {
  private logger = new Logger('AppointmentService');
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    private schedulerRegistry: SchedulerRegistry,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async create(appointmentDto: CreateAppointmentDto): Promise<Appointment> {
    try {
      const checkUser = await this.userService.getUser(appointmentDto.user);
      const checkDoctor = await this.userService.getUser(appointmentDto.doctor);

      if (!checkUser || !checkDoctor) {
        this.logger.error('No such user or doctor');
        throw new BadRequestException('No such user or doctor');
      }

      const currentDate = new Date(appointmentDto.date);
      const offset = currentDate.getTimezoneOffset();
      const checkDate = new Date(currentDate.getTime() - offset * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const doctorAppointmentCount = await this.appointmentModel.count({
        doctor: appointmentDto.doctor,
        date: {
          $gt: new Date(checkDate),
          $lt: new Date(checkDate).setDate(new Date(checkDate).getDate() + 1),
        },
        active: true,
      });
      if (doctorAppointmentCount >= 3) {
        this.logger.error('It is not possible to make an appointment');
        throw new ForbiddenException(
          'It is not possible to make an appointment',
        );
      }
      // eslint-disable-next-line new-cap
      const newAppointment = new this.appointmentModel({
        ...appointmentDto,
        active: false,
      });
      return await newAppointment.save();
    } catch (error) {
      this.logger.error(`InternalServerErrorException`, error);
      throw new InternalServerErrorException(error);
    }
  }

  async approve(id: string, user: User): Promise<Appointment> {
    try {
      const appointment = await this.appointmentModel.findOne({
        _id: id,
        doctor: user._id,
      });
      if (!appointment) {
        this.logger.error('Not found');
        throw new ForbiddenException('Not found');
      }
      if (appointment.active) {
        this.logger.error('Already approved');
        throw new BadRequestException('Already approved');
      }
      const userData = await this.userService.getUser(appointment.user);
      const timeOneDays = new Date(appointment.date).setDate(
        new Date(appointment.date).getDate() - 1,
      );
      const timeTwoHours = new Date(appointment.date).setHours(
        new Date(appointment.date).getHours() - 2,
      );

      const jobOneDays = new CronJob(new Date(timeOneDays), () => {
        const message = `Привет ${
          userData.name
        }! Напоминаем что вы записаны к ${
          user.spec
        } завтра в ${appointment.date.toLocaleTimeString()}!`;
        log(message, 'alert.log');
        this.logger.log(message);
      });
      this.schedulerRegistry.addCronJob(
        `job-one-day-${appointment._id}`,
        jobOneDays,
      );
      jobOneDays.start();

      const jobTwoHours = new CronJob(new Date(timeTwoHours), () => {
        const message = `Привет ${userData.name}! Вам через 2 часа к ${
          user.spec
        } в ${appointment.date.toLocaleTimeString()}!`;
        log(message, 'alert.log');
        this.logger.log(message);
      });
      this.schedulerRegistry.addCronJob(
        `job-two-hours-${appointment._id}`,
        jobTwoHours,
      );
      jobTwoHours.start();

      return await this.appointmentModel.findByIdAndUpdate(
        id,
        { active: true },
        { new: true },
      );
    } catch (error) {
      this.logger.error(`InternalServerErrorException`, error);
      throw new InternalServerErrorException(error);
    }
  }

  async cancel(id: string, user: User): Promise<Appointment> {
    try {
      const appointment = await this.appointmentModel.findOne({
        _id: id,
        doctor: user._id,
      });
      if (!appointment) {
        this.logger.error('Not found');
        throw new ForbiddenException('Not found');
      }
      if (appointment.active) {
        this.schedulerRegistry.deleteCronJob(`job-one-day-${appointment._id}`);
        this.schedulerRegistry.deleteCronJob(
          `job-two-hours-${appointment._id}`,
        );
      }
      return await this.appointmentModel.findByIdAndRemove(id);
    } catch (error) {
      this.logger.error(`InternalServerErrorException`, error);
      throw new InternalServerErrorException(error);
    }
  }

  async getUnapproved(user: User): Promise<Appointment[]> {
    try {
      return await this.appointmentModel
        .find({
          $or: [
            { doctor: user._id, active: false },
            { user: user._id, active: false },
          ],
        })
        .select({
          date: 1,
          user: 1,
          doctor: 1,
          active: 1,
        });
    } catch (error) {
      this.logger.error(`InternalServerErrorException`, error);
      throw new InternalServerErrorException(error);
    }
  }

  async getApprove(user: User) {
    try {
      const appointments = await this.appointmentModel
        .find({
          $or: [
            { doctor: user._id, active: true },
            { user: user._id, active: true },
          ],
        })
        .select({
          date: 1,
          user: 1,
          doctor: 1,
          active: 1,
        })
        .exec();

      return appointments.map((el) => {
        return new Date(el.date).getTime() < Date.now()
          ? {
              _id: el._id,
              date: el.date,
              user: el.user,
              doctor: el.doctor,
              active: false,
            }
          : el;
      });
    } catch (error) {
      this.logger.error(`InternalServerErrorException`, error);
      throw new InternalServerErrorException(error);
    }
  }
}
