import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Appointment } from './schemas/appointment.schema';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../user/schemas/user.schema';

@Controller('appointment')
@ApiTags('appointment')
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public create(
    @Body(ValidationPipe) createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    return this.appointmentService.create(createAppointmentDto);
  }

  @Get('unapproved')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  unapproved(@GetUser() user: User): Promise<Appointment[]> {
    return this.appointmentService.getUnapproved(user);
  }

  @Get('approved')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  getApprove(@GetUser() user: User): Promise<Appointment[]> {
    return this.appointmentService.getApprove(user);
  }

  @Post('approve/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  approve(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Appointment> {
    return this.appointmentService.approve(id, user);
  }

  @Post('cancel/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  cancel(@Param('id') id: string, @GetUser() user: User): Promise<Appointment> {
    return this.appointmentService.cancel(id, user);
  }
}
