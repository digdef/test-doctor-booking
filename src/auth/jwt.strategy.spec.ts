import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { User, UserSchema } from '../user/schemas/user.schema';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../user/user.service';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<User>;

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model(User.name, UserSchema);

    const module = await Test.createTestingModule({
      providers: [
        UserService,
        JwtStrategy,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
      ],
    }).compile();
    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
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

  describe('validate', () => {
    it('returns the user based on JWT payload', async () => {
      const mockUser = {
        _id: '569ed8269353e9f4c51617aa',
        email: 'test@email.com',
      };
      // eslint-disable-next-line new-cap
      const newUser = new userModel(mockUser);
      await newUser.save();

      const checkUser = await userModel.findById('569ed8269353e9f4c51617aa');
      const result = await jwtStrategy.validate({
        _id: '569ed8269353e9f4c51617aa',
      });
      expect(result).toEqual(checkUser);
    });
  });
});
