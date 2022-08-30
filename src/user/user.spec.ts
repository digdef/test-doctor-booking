import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './schemas/user.schema';

describe('User', () => {
  let controller: UserController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<User>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model(User.name, UserSchema);
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
      ],
    }).compile();
    controller = app.get<UserController>(UserController);
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
  describe('getAllUsers', () => {
    it('should be defined', async () => {
      expect(await controller.getAllUsers()).toBeDefined();
      expect(await controller.getAllUsers()).not.toBeUndefined();
    });
  });
  describe('getAllDoctors', () => {
    it('should be defined', async () => {
      expect(await controller.getAllUsers()).toBeDefined();
      expect(await controller.getAllUsers()).not.toBeUndefined();
    });
  });
  describe('getOne', () => {
    it('should be one user', async () => {
      const mockUser = {
        _id: '569ed8269353e9f4c51617aa',
        email: 'test@email.com',
      };
      // eslint-disable-next-line new-cap
      const newUser = new userModel(mockUser);
      await newUser.save();
      const checkUser = await userModel.findById('569ed8269353e9f4c51617aa');
      expect(await controller.getOne('569ed8269353e9f4c51617aa')).toEqual(
        checkUser,
      );
    });
  });
  describe('remove', () => {
    it('should be remove user', async () => {
      const mockUser = {
        _id: '569ed8269353e9f4c51617aa',
        email: 'test@email.com',
      };
      // eslint-disable-next-line new-cap
      const newUser = new userModel(mockUser);
      await newUser.save();
      const checkUser = await userModel.findById('569ed8269353e9f4c51617aa');
      expect(await controller.remove('569ed8269353e9f4c51617aa')).toEqual(
        checkUser,
      );
    });
  });
});
