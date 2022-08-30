import { IsDate, IsString, MinDate, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'date',
    example: '2022-01-01T00:00:00.000Z',
    required: true,
    type: Date,
  })
  @IsDate()
  @Transform(({ value }) => value && new Date(value))
  @MinDate(new Date())
  date: Date;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'user id',
    example: '123',
    required: true,
    type: String,
  })
  user: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'doctor id',
    example: '123',
    required: true,
    type: String,
  })
  doctor: string;
}
