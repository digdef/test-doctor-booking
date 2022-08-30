import { Controller, Delete, Get, HttpCode, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('users')
  @HttpCode(200)
  getAllUsers(): Promise<User[]> {
    return this.userService.getAll('user');
  }

  @Get('doctors')
  getAllDoctors(): Promise<User[]> {
    return this.userService.getAll('doc');
  }

  @Get(':id')
  getOne(@Param('id') id: string): Promise<User> {
    return this.userService.getById(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<User> {
    return this.userService.remove(id);
  }
}
