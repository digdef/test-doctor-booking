export class CreateUserDto {
  email: string;

  password: string;

  // eslint-disable-next-line camelcase
  photo_avatar: string;

  phone: string;

  name: string;

  type: string;

  spec?: string;

  free?: boolean;
}
