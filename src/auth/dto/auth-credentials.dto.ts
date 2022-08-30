import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthCredentialsDto {
  @IsString()
  @ApiProperty({
    description: 'user email or phone',
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
}
