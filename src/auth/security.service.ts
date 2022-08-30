import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

@Injectable()
export class SecurityService {
  protected readonly passwordSecretKey: string;
  protected readonly passwordAlgorithm: string;
  protected readonly passwordIv: Buffer;
  constructor() {
    this.passwordAlgorithm = 'aes-256-ctr';
    this.passwordSecretKey = createHash('sha256')
      .update(process.env.SECRET_KEY)
      .digest('base64')
      .substr(0, 32);
    this.passwordIv = randomBytes(16);
  }

  public encryptPassword(rawPassword: string): string {
    try {
      const cipher = createCipheriv(
        this.passwordAlgorithm,
        this.passwordSecretKey,
        this.passwordIv,
      );
      const encrypted = Buffer.concat([
        cipher.update(Buffer.from(rawPassword)),
        cipher.final(),
      ]);
      return `${this.passwordIv.toString('hex')}:${encrypted.toString('hex')}`;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  public decryptPassword(encryptedPassword: string): string {
    try {
      const params = encryptedPassword.split(':');
      const decipher = createDecipheriv(
        this.passwordAlgorithm,
        this.passwordSecretKey,
        Buffer.from(params[0], 'hex'),
      );
      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(params[1], 'hex')),
        decipher.final(),
      ]).toString();
      return decrypted;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  public comparePassword(password, realPassword): boolean {
    return password === this.decryptPassword(realPassword);
  }
}
