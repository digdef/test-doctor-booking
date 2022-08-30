import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as matchers from 'jest-extended';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';

expect.extend(matchers);

describe('Appointment', () => {
  let controller: AppointmentController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<User>;
  let appointmentModel: Model<Appointment>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model(User.name, UserSchema);
    appointmentModel = mongoConnection.model(
      Appointment.name,
      AppointmentSchema,
    );
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentController],
      providers: [
        AppointmentService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
        {
          provide: getModelToken(Appointment.name),
          useValue: appointmentModel,
        },
        UserService,
        SchedulerRegistry,
      ],
    }).compile();
    controller = app.get<AppointmentController>(AppointmentController);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const { collections } = mongoConnection;
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  it('controller should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('create', () => {
    it('should create', async () => {
      const mockUser = {
        _id: '569ed8269353e9f4c51617aa',
        email: 'test@email.com',
        type: 'user',
      };
      // eslint-disable-next-line new-cap
      const newUser = new userModel(mockUser);
      await newUser.save();

      const mockDoctor = {
        _id: '669ed8269353e9f4c51617aa',
        email: 'testDoctor@email.com',
        type: 'doc',
        spec: 'therapist',
      };
      // eslint-disable-next-line new-cap
      const newDoctor = new userModel(mockDoctor);
      await newDoctor.save();
      expect(
        await controller.create({
          date: new Date(),
          user: '569ed8269353e9f4c51617aa',
          doctor: '669ed8269353e9f4c51617aa',
        }),
      ).not.toBeEmptyObject();
    });
  });

  describe('cancel', () => {
    it('should cancel', async () => {
      const mockUser = {
        _id: '569ed8269353e9f4c51617aa',
        email: 'test@email.com',
        type: 'user',
      };
      // eslint-disable-next-line new-cap
      const newUser = new userModel(mockUser);
      await newUser.save();

      const mockDoctor = {
        _id: '669ed8269353e9f4c51617aa',
        email: 'testDoctor@email.com',
        type: 'doc',
        spec: 'therapist',
      };
      // eslint-disable-next-line new-cap
      const newDoctor = new userModel(mockDoctor);
      await newDoctor.save();
      const mockAppointment = {
        _id: '123ed8269353e9f4c51617aa',
        date: new Date().toISOString(),
        user: '569ed8269353e9f4c51617aa',
        doctor: '669ed8269353e9f4c51617aa',
        active: false,
      };
      // eslint-disable-next-line new-cap
      const newAppointment = new appointmentModel(mockAppointment);
      await newAppointment.save();

      const doctor = await userModel.findById('669ed8269353e9f4c51617aa');
      const checkAppointment = await appointmentModel.findById(
        '123ed8269353e9f4c51617aa',
      );
      const checkUnapprovedAppointment = await appointmentModel
        .findById('123ed8269353e9f4c51617aa')
        .select({
          date: 1,
          user: 1,
          doctor: 1,
          active: 1,
        });
      expect(await controller.unapproved(doctor)).toPartiallyContain(
        checkUnapprovedAppointment,
      );

      expect(
        await controller.cancel('123ed8269353e9f4c51617aa', doctor),
      ).toEqual(checkAppointment);
    });
  });
});
