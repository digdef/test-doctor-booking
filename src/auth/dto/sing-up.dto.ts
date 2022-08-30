import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TypeEnum } from '../enums/type.enum';

export class SingUpDto {
  @IsEmail()
  @ApiProperty({
    description: 'user email',
    example: 'example@gmail.com',
    required: true,
    type: String,
  })
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(32)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak',
  })
  @ApiProperty({
    description: '1 upper, 1 lower, 1 number of Special char',
    example: 'Qwerty4',
    required: true,
    type: String,
  })
  password: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'photo uri',
    example: 'https://example.com/image.png',
    required: true,
    type: String,
  })
  // eslint-disable-next-line camelcase
  photo_avatar: string;

  @IsString()
  @ApiProperty({
    description: 'Users name',
    example: 'Joe',
    required: true,
    type: String,
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'Users name',
    example: 'Joe',
    required: true,
    type: String,
  })
  phone: string;

  @IsEnum(TypeEnum)
  @ApiProperty({
    description: 'type',
    example: 'doc',
    required: true,
    type: String,
  })
  type: TypeEnum;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'spec',
    example: 'therapist',
    required: false,
    type: String,
  })
  spec: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: 'free',
    example: true,
    required: false,
    type: Boolean,
  })
  free: boolean;
}
